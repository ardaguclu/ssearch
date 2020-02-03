package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ardaguclu/ssearch/internal/search"

	"github.com/gin-gonic/gin"
)

var srch *search.S
var ctx context.Context

func Listen(c context.Context, env *string) {
	ctx = c
	srch = search.NewS(*env)

	gin.SetMode("release")
	if *env == "dev" {
		gin.SetMode("debug")
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(customMiddleware())

	r.GET("/search", handleSearch)
	r.GET("/", handleHealth)

	s := &http.Server{
		Addr:         ":7981",
		Handler:      r,
		ReadTimeout:  15 * time.Minute,
		WriteTimeout: 15 * time.Minute,
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				s.Shutdown(ctx)
				return
			}
		}
	}()

	err := s.ListenAndServe()

	if err == http.ErrServerClosed {
		log.Println("Server closed")
	} else if err != nil {
		log.Panic("Server can not start", err)
	}
}

func handleSearch(c *gin.Context) {
	var req *search.SReq
	if err := c.ShouldBind(&req); err != nil || req == nil {
		c.JSON(http.StatusBadRequest,
			gin.H{
				"status": http.StatusBadRequest,
				"result": "bucket and filter parameters are required",
			})
		return
	}

	results, err := srch.Start(ctx, req)
	if err != nil {
		c.JSON(http.StatusBadRequest,
			gin.H{
				"status": http.StatusBadRequest,
				"result": fmt.Sprintf("%+v", err),
			})
		return
	}

	c.JSON(http.StatusOK, results)
}

func handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": http.StatusOK,
	})
}

func customMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
