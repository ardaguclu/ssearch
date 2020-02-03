package search

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go/aws/awserr"

	"github.com/aws/aws-sdk-go/aws/endpoints"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

const S3Endpoint = "http://localhost:4572"

type S struct {
	sess *session.Session
}

/*bucket := flag.String("bucket", "", "bucket name is required")
text := flag.String("filter", "", "search text is required")
perCount := flag.Int64("per-count", 1, "scanned object count in each iteration, max is 1000")
startDate := flag.Int64("start", 0, "start date unix timestamp format is an optional field.")
endDate := flag.Int64("end", 0, "end date unix timestamp format is an optional field.")*/

type SReq struct {
	Bucket      string `form:"bucket" binding:"required"`
	Text        string `form:"filter" binding:"required"`
	ResultCount int64  `form:"result-count"`
	StartDate   int64  `form:"start"`
	EndDate     int64  `form:"end"`
}

func NewS(env string) *S {
	var sess *session.Session
	if env == "dev" {
		sess = session.Must(session.NewSession(&aws.Config{
			Credentials: credentials.NewStaticCredentials("foo", "var", ""),
			Endpoint:    aws.String(S3Endpoint),
			Region:      aws.String(endpoints.EuWest1RegionID),
		}))
	} else {
		sess = session.Must(session.NewSession(&aws.Config{}))
	}

	return &S{
		sess: sess,
	}
}

func (s *S) Start(ctx context.Context, req *SReq) ([]*s3.Object, error) {
	c := s3.New(s.sess, &aws.Config{})

	head := &s3.HeadBucketInput{
		Bucket: aws.String(req.Bucket),
	}

	_, err := c.HeadBucketWithContext(ctx, head, request.WithLogLevel(aws.LogDebugWithHTTPBody))
	if err != nil {
		if awsErr, ok := err.(awserr.Error); ok {
			// Generic AWS Error with Code, Message, and original error (if any)
			fmt.Println(awsErr.Code(), awsErr.Message(), awsErr.OrigErr())

			if reqErr, ok := err.(awserr.RequestFailure); ok {
				// A service error occurred
				fmt.Println(reqErr.StatusCode(), reqErr.RequestID())
			}
		} else {
			fmt.Println(err.Error())
		}
	}

	loi := &s3.ListObjectsV2Input{
		Bucket:            aws.String(req.Bucket),
		ContinuationToken: nil,
		MaxKeys:           aws.Int64(1000),
	}

	var result []*s3.Object

	err = c.ListObjectsV2PagesWithContext(ctx, loi,
		func(page *s3.ListObjectsV2Output, lastPage bool) bool {
			s := s.search(page.Contents, req.StartDate, req.EndDate)
			if s != nil {
				result = append(result, s...)
			}

			if page.NextContinuationToken == nil {
				return false
			}

			return true
		})

	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s *S) search(contents []*s3.Object, sd, ed int64) []*s3.Object {
	var res []*s3.Object

	for _, c := range contents {
		if sd != 0 && sd > c.LastModified.Unix() {
			continue
		}
		if ed != 0 && ed < c.LastModified.Unix() {
			continue
		}

		fmt.Println(c)
		//c.SelectObjectContent()
		//c.ListObjectsV2PagesWithContext()
		//c.GetObjectWithContext()
		//c.GetObjectTorrentWithContext()
		/*p := s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(key),
			ACL:    aws.String("public-read"),
			Body:   rs,
		}

		r, err := c.PutObject(&p)
		if err != nil {
			panic(err)
		}

		return r*/
	}

	return res
}
