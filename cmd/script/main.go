package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/aws/aws-sdk-go/service/s3"

	"github.com/aws/aws-sdk-go/aws/credentials"

	"github.com/aws/aws-sdk-go/aws/endpoints"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

const (
	BucketName = "Test"
	TestDir    = "cmd/script/testdata/"
	S3Endpoint = "http://localhost:4572"
)

func main() {
	sess := session.Must(session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials("foo", "var", ""),
		Endpoint:    aws.String(S3Endpoint),
		Region:      aws.String(endpoints.EuWest1RegionID),
	}))

	c := s3.New(sess, &aws.Config{})
	di := &s3.DeleteBucketInput{
		Bucket: aws.String(BucketName),
	}

	c.DeleteBucket(di)
	ci := &s3.CreateBucketInput{
		Bucket: aws.String(BucketName),
	}
	c.CreateBucket(ci)

	uploader := s3manager.NewUploader(sess)

	files, err := ioutil.ReadDir(TestDir)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		f, err := os.Open(TestDir + file.Name())
		if err != nil {
			log.Fatalf("failed to open file %q, %v \n", file, err)
		}

		_, err = uploader.Upload(&s3manager.UploadInput{
			Bucket: aws.String(BucketName),
			Key:    aws.String(file.Name()),
			Body:   f,
		})
		if err != nil {
			log.Fatalf("failed to upload file, %v \n", err)
		}
	}

	fmt.Println("test file upload is completed")
}
