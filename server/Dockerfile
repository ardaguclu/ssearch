FROM golang:latest as ssearch-api
LABEL maintainer="Arda Güçlü <ardaguclu@gmail.com>"
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main cmd/api/main.go
EXPOSE 7981
CMD ["./main"]