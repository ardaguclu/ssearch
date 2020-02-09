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

// script is used for development purposes. As a prerequisite localstack should be started
// and 4572 port is open for S3 connection. Afterwards, this script populates sample data for being used.
func main() {
	sess := session.Must(session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials("foo", "var", ""),
		Endpoint:    aws.String(S3Endpoint),
		Region:      aws.String(endpoints.EuWest1RegionID),
	}))

	c := s3.New(sess)

	ci := &s3.CreateBucketInput{
		Bucket: aws.String(BucketName),
	}
	_, err := c.CreateBucket(ci)
	if err != nil {
		log.Fatalf("create bucket failed ", err)
	}

	uploader := s3manager.NewUploader(sess)

	files, err := ioutil.ReadDir(TestDir)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		name := file.Name()
		f, err := os.Open(TestDir + name)
		if err != nil {
			log.Fatalf("failed to open file %q, %v \n", file, err)
		}

		if name == "example_3.json" {
			name = "inner/example_3.json"
		}

		uploadresult, err := uploader.Upload(&s3manager.UploadInput{
			Bucket: aws.String(BucketName),
			Key:    aws.String(name),
			Body:   f,
		})
		if err != nil {
			log.Fatalf("failed to upload file, %v \n", err)
		}

		log.Println("file uploaded ", uploadresult.Location)
	}

	fmt.Println("test file upload is completed")
}
