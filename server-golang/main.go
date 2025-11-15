// main.go (or app.go)
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/topper3418/led-hub/golang-server/api"
	"strings"
)

// main.go
func main() {
	r := gin.Default()

	// 1. Serve static assets FIRST
	r.Static("/assets", "./web/build/assets")     // ← critical
	// Serve Vite assets
	r.Static("/web", "./web/build")               // optional: /web/index.html

	// 2. API
	v1 := r.Group("/api/v1")
	db_path := "data/ledhub.db"
	api.RegisterRooms(v1, db_path)
	api.RegisterDevices(v1, db_path)
	api.RegisterLedStrips(v1, db_path)

	// 3. Health
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// 4. SPA fallback — ONLY for unknown routes
	r.NoRoute(func(c *gin.Context) {
		if !strings.HasPrefix(c.Request.URL.Path, "/api") &&
		   !strings.HasPrefix(c.Request.URL.Path, "/assets") {
			c.File("./web/build/index.html")
		} else {
			c.AbortWithStatus(404)
		}
	})

	r.Run(":8080")
}
