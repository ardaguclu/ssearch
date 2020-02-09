package search

import (
	"context"
	"log"
	"runtime"
	"sync"

	"github.com/ardaguclu/ssearch/server/internal/rabinkarp"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"

	"github.com/aws/aws-sdk-go/aws/endpoints"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

const (
	S3LocalstackEndpoint    = "http://localhost:4572"
	MaxAllowedFileSize      = int64(500 << (10 * 2))
	S3DownloadPartSize      = 64 << (10 * 2)
	MaxObjectSizePerRequest = 1000
)

type S struct {
	sess       *session.Session
	downloader *s3manager.Downloader
}

type SReq struct {
	Bucket      string `form:"bucket" binding:"required"`
	Text        string `form:"filter" binding:"required"`
	ResultCount int    `form:"result-count" binding:"required"`
	StartDate   int64  `form:"start"`
	EndDate     int64  `form:"end"`
}

// NewS returns S object which will be used for S3 access.
func NewS(env string) *S {
	var sess *session.Session
	if env == "dev" {
		sess = session.Must(session.NewSession(&aws.Config{
			Credentials: credentials.NewStaticCredentials("foo", "var", ""),
			Endpoint:    aws.String(S3LocalstackEndpoint),
			Region:      aws.String(endpoints.EuWest1RegionID),
		}))
	} else {
		sess = session.Must(session.NewSession(&aws.Config{}))
	}

	return &S{
		sess:       sess,
		downloader: s3manager.NewDownloader(sess, func(d *s3manager.Downloader) { d.PartSize = S3DownloadPartSize }),
	}
}

func (s *S) GetBuckets(ctx context.Context) ([]string, error) {
	c := s3.New(s.sess)

	lbi := &s3.ListBucketsInput{}

	lbo, err := c.ListBucketsWithContext(ctx, lbi, request.WithLogLevel(aws.LogDebugWithHTTPBody))

	if err != nil {
		return nil, err
	}

	var buckets []string
	for _, b := range lbo.Buckets {
		buckets = append(buckets, *b.Name)
	}

	return buckets, nil
}

// Start starts search process with the given parameters.
func (s *S) Start(ctx context.Context, req *SReq) ([]s3.Object, error) {
	c := s3.New(s.sess)

	head := &s3.HeadBucketInput{
		Bucket: aws.String(req.Bucket),
	}

	_, err := c.HeadBucketWithContext(ctx, head, request.WithLogLevel(aws.LogDebugWithHTTPBody))
	if err != nil {
		return nil, err
	}

	loi := &s3.ListObjectsV2Input{
		Bucket:            aws.String(req.Bucket),
		ContinuationToken: nil,
		MaxKeys:           aws.Int64(MaxObjectSizePerRequest),
	}

	var result []s3.Object

	err = c.ListObjectsV2PagesWithContext(ctx, loi,
		func(page *s3.ListObjectsV2Output, lastPage bool) bool {
			s := s.search(ctx, page.Contents, *req)
			if s != nil {
				result = append(result, s...)
			}

			return lastPage || len(result) < req.ResultCount
		})

	if err != nil {
		return nil, err
	}

	return result, nil
}

// search executes search operation concurrently within the batch object files and
// determines being found or not.
func (s *S) search(ctx context.Context, contents []*s3.Object, req SReq) []s3.Object {
	defer func() {
		runtime.GC()
	}()

	var res []s3.Object

	var wg sync.WaitGroup
	var lock sync.Mutex

	for _, c := range contents {
		if req.EndDate > req.StartDate {
			if req.StartDate != 0 && req.StartDate > c.LastModified.Unix() {
				continue
			}
			if req.EndDate != 0 && req.EndDate < c.LastModified.Unix() {
				continue
			}
		}

		if *c.Size > MaxAllowedFileSize {
			continue
		}

		wg.Add(1)
		go func(ctx context.Context, obj s3.Object) {
			defer wg.Done()
			if s.found(ctx, req.Bucket, *obj.Key, req.Text, *obj.Size) {
				lock.Lock()
				defer lock.Unlock()

				res = append(res, obj)
			}
		}(ctx, *c)
	}

	wg.Wait()
	return res
}

// found is used for core search algorithm being implemented,
// it is designed for best performance. Since bucket in the S3 service expectedly stores huge amount of
// files.
func (s *S) found(ctx context.Context, bucket string, key string, searchText string, size int64) bool {
	content := aws.NewWriteAtBuffer(make([]byte, size))
	_, err := s.downloader.DownloadWithContext(ctx,
		content,
		&s3.GetObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(key),
		})

	if err != nil {
		log.Println("error occured ", err)
		return false
	}

	result := content.Bytes()

	rk := rabinkarp.New(searchText)

	for _, c := range result {
		if found := rk.SearchNextChar(c); found == true {
			return true
		}
	}

	return false
}
