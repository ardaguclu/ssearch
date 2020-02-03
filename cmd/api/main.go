package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/ardaguclu/ssearch/internal/api"
)

func main() {
	env := flag.String("env", "dev", "environment")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		for {
			select {
			case <-sigint:
				log.Println("Request cancelled")
				cancel()
			}
		}
	}()

	log.Println("SSearch API started")
	api.Listen(ctx, env)
}
