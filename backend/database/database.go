package database

import (
	"christmas-link-backend/models"
	"log"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接
func InitDatabase() {
	var err error

	// 配置GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// 连接SQLite数据库
	DB, err = gorm.Open(sqlite.Open("christmas_link.db"), config)
	if err != nil {
		log.Fatal("❌ 数据库连接失败:", err)
	}

	log.Println("✅ 数据库连接成功")

	// 自动迁移数据库结构
	err = DB.AutoMigrate(
		&models.MatchPool{},
		&models.PoolField{},
		&models.PoolUser{},
		&models.MatchRecord{},
		&models.MatchPair{},
	)

	if err != nil {
		log.Fatal("❌ 数据库迁移失败:", err)
	}

	log.Println("✅ 数据库迁移完成")

	// 创建示例数据（仅在开发环境）
	createSampleData()
}

// createSampleData 创建示例数据
func createSampleData() {
	// 检查是否已有数据
	var count int64
	DB.Model(&models.MatchPool{}).Count(&count)
	if count > 0 {
		log.Println("📋 数据库已有数据，跳过示例数据创建")
		return
	}

	log.Println("🎯 创建示例数据...")

	// 创建示例匹配池
	samplePool := &models.MatchPool{
		Name:        "圣诞节匹配池示例",
		Description: "这是一个示例匹配池，用于测试系统功能",
		ValidUntil:  time.Now().Add(24 * time.Hour), // 24小时后过期
		Status:      "active",
		Fields: []models.PoolField{
			{
				FieldName:  "name",
				FieldLabel: "姓名",
				FieldType:  "text",
				IsRequired: true,
				FieldOrder: 1,
			},
			{
				FieldName:  "email",
				FieldLabel: "邮箱",
				FieldType:  "email",
				IsRequired: true,
				FieldOrder: 2,
			},
			{
				FieldName:  "hobby",
				FieldLabel: "爱好",
				FieldType:  "text",
				IsRequired: false,
				FieldOrder: 3,
			},
			{
				FieldName:  "message",
				FieldLabel: "想说的话",
				FieldType:  "textarea",
				IsRequired: false,
				FieldOrder: 4,
			},
		},
	}

	if err := DB.Create(samplePool).Error; err != nil {
		log.Printf("⚠️  创建示例匹配池失败: %v", err)
		return
	}

	log.Printf("✅ 创建示例匹配池成功: %s (ID: %d)", samplePool.Name, samplePool.ID)
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}

// CloseDatabase 关闭数据库连接
func CloseDatabase() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
		}
		log.Println("✅ 数据库连接已关闭")
	}
}
