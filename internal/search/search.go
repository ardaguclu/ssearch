package search

import (
	"context"
	"sync"

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
	MaxObjectSizePerRequest = 1000
)

type S struct {
	sess *session.Session
}

type SReq struct {
	Bucket      string `form:"bucket" binding:"required"`
	Text        string `form:"filter" binding:"required"`
	ResultCount int    `form:"result-count"`
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
		sess: sess,
	}
}

// Start starts search process with the given parameters.
func (s *S) Start(ctx context.Context, req *SReq) ([]s3.Object, error) {
	c := s3.New(s.sess, &aws.Config{})

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
			s := s.search(page.Contents, req.StartDate, req.EndDate)
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
func (s *S) search(contents []*s3.Object, sd, ed int64) []s3.Object {
	var res []s3.Object

	var wg sync.WaitGroup
	var lock sync.Mutex

	for _, c := range contents {
		if sd != 0 && sd > c.LastModified.Unix() {
			continue
		}
		if ed != 0 && ed < c.LastModified.Unix() {
			continue
		}

		if *c.Size > MaxAllowedFileSize {
			continue
		}

		wg.Add(1)
		go func(obj s3.Object) {
			defer wg.Done()
			if s.found(*c.Key) {
				lock.Lock()
				defer lock.Unlock()

				res = append(res, obj)
			}
		}(*c)
	}

	wg.Wait()
	return res
}

// found is used for core search algorithm being implemented,
// it is designed for best performance. Since bucket in the S3 service expectedly stores huge amount of
// files.
func (s *S) found(key string) bool {
	// Knuth–Morris–Pratt (KMP) Algorithm
	// Rabin-Karp Algorithm
	return true
}
