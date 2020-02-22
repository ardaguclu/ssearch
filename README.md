![Image description](https://ssearch.xyz/assets/logo_white_background.jpg)
[![Go Report Card](https://goreportcard.com/badge/github.com/ardaguclu/ssearch)](https://goreportcard.com/report/github.com/ardaguclu/ssearch)

Searching in S3 is a daunting challenge for developers. Looking at the files one by one or trying to find a pattern to understand which files include the key you want to search is one of the lack features S3 team does not develop in order to protect S3's performance perfection.

Thereby SSEARCH has been implemented most performant way to find the files as soon as possible only for this purpose. According to the benchmark results, it searches in a bucket includes 1000 files within seconds.

* **Go's concurrency libraries are used efficiently.** 
* **Rabin-Karp algorithm is used for searching in files**.
* **React based UI provides elegant design for search operations.**

### USAGE  

Installation is pretty simple, after downloading the docker-compose file, only run it. You can start searching in your S3 buckets immediately.
 
 * `curl https://downloads.ssearch.xyz/latest/docker-compose.yml --output docker-compose.yml`
 * `docker-compose up -d`

Two Docker containers, namely API and UI, will be started. You can start searching in S3 from the UI;

`http://localhost:7982/` 

![UI-EXAMPLE](https://ssearch.xyz/assets/ui-example.png)

or directly from API;

`http://localhost:7981/search?bucket={bucketName}&filter={searchText}&region={region}&result-count={20}&start={unixStartTimestamp}&end={unixEndTimestamp}`


### REQUIREMENTS

* You can use it anywhere as long as the environment you use has sufficient read roles accessing to S3. `AmazonS3ReadOnlyAccess` is a good example for this;
  
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:Get*",
                   "s3:List*"
               ],
               "Resource": "*"
           }
       ]
 
 * If you install Ssearch into EC2 and want to use it remotely from your local machine, please be sure that 7981&7982 port 
 numbers are allowed as inbound ports in Security Groups.
 * [docker](https://docs.docker.com/install/)
 * [docker-compose](https://docs.docker.com/compose/install/)

### HACKING & TESTING

If you would like to test Ssearch in your local environment without any AWS account, you can use [Localstack](https://localstack.cloud/). 
Preconfigured Localstack can be started for hacking purposes;

`cd server/cmd/script; docker-compose up -d`

After starting Localstack, running Go script for importing test data;

`go run main.go`

Now, you can test your local environment calling directly from API;

`cd ../api/; go run main.go`

`curl -X GET 'http://localhost:7981/search?bucket=Test&filter=Apple&result-count=1'`

It returns results retrieved from localstack S3 simulating AWS S3.

### DISCLAIMER & NOTES

* If you use Ssearch from out of your VPC or in your VPC without defining S3 as an internal endpoint, there will be additional data in/out cost
like any other use case of S3 satisfying former conditions.

### ROADMAP

In ongoing versions, these features listed below will be added preemptively;

* Searching in files whose sizes are greater than 500mb.
* Searching in files whose types are in Parquet or Binary or compressed.
* Searching in metadata.