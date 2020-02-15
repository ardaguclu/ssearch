![Image description](https://ssearch.xyz/assets/logo_white_background.jpg)

Ssearch is S3 search tool created for pawing files and finding the ones including search text in S3 buckets. 
It's backend has been fully implemented in Go and UI in React.

Searching in S3 is a daunting challenge for developers. Thereby it has been implemented most performant way to find the files as soon as possible.

* **Go's concurrency libraries are used efficiently.** 
* **Rabin-Karp algorithm is used for searching in files**.
* **React based UI provides elegance design for search operations.**

### REQUIREMENTS

* You can use it anywhere as long as the environment you use has sufficient read roles accessing to S3. `AmazonS3ReadOnlyAccess` is a good example for this;
  
  `{
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
   }`
 
 * [docker](https://docs.docker.com/install/)
 * [docker-compose](https://docs.docker.com/compose/install/)

### USAGE  
 After ensuring S3 read access on your environment, run the following commands;
 
 * `curl -0 https://downloads.ssearch.xyz/latest/docker-compose.yml`
 * `docker-compose up -d`

Docker containers including API and UI will be started. You can start searching in S3 from the UI;

`http://localhost:7982/` 

or directly from API;

`http://localhost:7981/search?bucket={bucketName}&filter={searchText}&result-count={20}&start={unixStartTimestamp}&end={unixEndTimestamp}`

### HACKING & TESTING

If you would like to test Ssearch in your local environment without any AWS account, you can use Localstack. 
Preconfigured Localstack can be started for hacking purposes;

`cd server/cmd/script; docker-compose up -d`

After starting Localstack, running Go script for importing test data;

`go run main.go`

Now, you can test your local environment calling directly from API;

`cd ../api/; go run main.go`

`curl http://localhost:7981/search?bucket=Test&filter=Apple&result-count=1`

It gives results retrieved from localstack S3 simulating AWS S3.

#### DISCLAIMER

If you use Ssearch from out of your VPC or in your VPC without defining S3 as an internal endpoint, for each use there will be additional data in/out cost
like any other use case of S3 satisfying former conditions.