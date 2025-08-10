package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisConfig Redis配置结构
type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

// GetRedisConfig 获取Redis配置
func GetRedisConfig() *RedisConfig {
	config := &RedisConfig{
		Host:     getEnvOrDefault("REDIS_HOST", "localhost"),
		Port:     getEnvIntOrDefault("REDIS_PORT", 6379),
		Password: getEnvOrDefault("REDIS_PASSWORD", ""),
		DB:       getEnvIntOrDefault("REDIS_DB", 0),
	}

	log.Printf("🔧 Redis配置: %s:%d DB:%d", config.Host, config.Port, config.DB)
	return config
}

// CreateRedisClient 创建Redis客户端
func CreateRedisClient(config *RedisConfig) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%d", config.Host, config.Port),
		Password:     config.Password,
		DB:           config.DB,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10,
		MinIdleConns: 2,
	})

	return client
}

// getEnvOrDefault 获取环境变量或默认值
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvIntOrDefault 获取环境变量整数值或默认值
func getEnvIntOrDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
