package main

import (
	"christmas-link-backend/cache"
	"christmas-link-backend/controllers"
	"christmas-link-backend/database"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化Redis缓存
	cache.InitRedis()

	// 初始化数据库
	database.InitDatabase()
	defer database.CloseDatabase()

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

	// 创建控制器实例
	poolController := controllers.NewPoolController(database.GetDB())
	historyController := controllers.NewHistoryController(database.GetDB())

	// 基础健康检查端点
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Christmas Link Backend API",
			"status":  "running",
			"version": "2.0.0",
			"tech":    "Golang + Gin + SQLite + Redis",
			"features": []string{
				"匹配池管理",
				"随机匹配算法",
				"历史记录查询",
				"Redis缓存",
				"数据持久化",
			},
		})
	})

	// API路由组
	api := r.Group("/api")
	{
		// 匹配池路由
		pools := api.Group("/pools")
		{
			pools.POST("", poolController.CreatePool)
			pools.GET("", poolController.GetPools)
			pools.GET("/:id", poolController.GetPoolByID)
			pools.POST("/join", poolController.JoinPool)
		}

		// 匹配路由
		api.POST("/match", poolController.StartMatch)

		// 历史记录路由
		history := api.Group("/history")
		{
			history.GET("", historyController.GetHistory)
			history.GET("/:id", historyController.GetHistoryByID)
		}

		// 统计信息路由
		api.GET("/stats", historyController.GetStatistics)
	}

	// 优雅关闭处理
	go func() {
		// 监听系统信号
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit

		log.Println("🛑 正在关闭服务器...")
		database.CloseDatabase()
		os.Exit(0)
	}()

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
	log.Println("   GET  /api/stats        - Get statistics")
	log.Println("💡 Redis缓存已启用，提供更快的响应速度")

	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
