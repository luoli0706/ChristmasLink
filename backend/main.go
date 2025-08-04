package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// 创建Gin路由器
	r := gin.Default()

	// 添加CORS中间件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 基础健康检查端点
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Christmas Link Backend API",
			"status":  "running",
			"version": "1.0.0",
			"tech":    "Golang + Gin + SQLite",
		})
	})

	// API路由组
	api := r.Group("/api")
	{
		// 匹配池路由
		pools := api.Group("/pools")
		{
			pools.POST("", createPool)
			pools.GET("", getPools)
			pools.GET("/:id", getPoolByID)
			pools.POST("/join", joinPool)
		}

		// 匹配路由
		api.POST("/match", startMatch)

		// 历史记录路由
		history := api.Group("/history")
		{
			history.GET("", getHistory)
			history.GET("/:id", getHistoryByID)
		}
	}

	// 启动服务器
	port := ":7776" // 与前端API配置保持一致
	log.Printf("🎄 Christmas Link Backend starting on http://127.0.0.1%s", port)
	log.Println("📋 Available endpoints:")
	log.Println("   GET  /                 - Health check")
	log.Println("   POST /api/pools        - Create pool")
	log.Println("   GET  /api/pools        - Get pools")
	log.Println("   GET  /api/pools/:id    - Get pool by ID")
	log.Println("   POST /api/pools/join   - Join pool")
	log.Println("   POST /api/match        - Start match")
	log.Println("   GET  /api/history      - Get history")
	log.Println("   GET  /api/history/:id  - Get history by ID")

	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// 临时处理器函数 - 返回"功能开发中"
func createPool(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Create pool endpoint - Ready for implementation",
		"data":    nil,
	})
}

func getPools(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Get pools endpoint - Ready for implementation",
		"data":    []interface{}{},
	})
}

func getPoolByID(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Get pool by ID endpoint - Ready for implementation",
		"data": gin.H{
			"id": id,
		},
	})
}

func joinPool(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Join pool endpoint - Ready for implementation",
		"data":    nil,
	})
}

func startMatch(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Start match endpoint - Ready for implementation",
		"data":    nil,
	})
}

func getHistory(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Get history endpoint - Ready for implementation",
		"data":    []interface{}{},
	})
}

func getHistoryByID(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Get history by ID endpoint - Ready for implementation",
		"data": gin.H{
			"id": id,
		},
	})
}
