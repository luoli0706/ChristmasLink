package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

// RedisClient Redis客户端全局实例
var RedisClient *redis.Client

// InitRedis 初始化Redis连接
func InitRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379", // Redis地址
		Password: "",               // 没有密码
		DB:       0,                // 使用默认数据库
	})

	// 测试连接
	ctx := context.Background()
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("⚠️  Redis连接失败: %v", err)
		log.Println("💡 请确保Redis服务正在运行，继续使用数据库缓存")
		RedisClient = nil
	} else {
		log.Println("✅ Redis连接成功")
	}
}

// CacheService 缓存服务结构体
type CacheService struct {
	ctx context.Context
}

// NewCacheService 创建缓存服务实例
func NewCacheService() *CacheService {
	return &CacheService{
		ctx: context.Background(),
	}
}

// Set 设置缓存
func (c *CacheService) Set(key string, value interface{}, expiration time.Duration) error {
	if RedisClient == nil {
		log.Printf("Redis未连接，跳过缓存设置: %s", key)
		return nil
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return RedisClient.Set(c.ctx, key, data, expiration).Err()
}

// Get 获取缓存
func (c *CacheService) Get(key string, dest interface{}) error {
	if RedisClient == nil {
		return redis.Nil // 返回缓存未命中
	}

	data, err := RedisClient.Get(c.ctx, key).Result()
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(data), dest)
}

// Delete 删除缓存
func (c *CacheService) Delete(key string) error {
	if RedisClient == nil {
		return nil
	}

	return RedisClient.Del(c.ctx, key).Err()
}

// Exists 检查缓存是否存在
func (c *CacheService) Exists(key string) bool {
	if RedisClient == nil {
		return false
	}

	result, err := RedisClient.Exists(c.ctx, key).Result()
	return err == nil && result > 0
}

// DeletePattern 根据模式删除缓存
func (c *CacheService) DeletePattern(pattern string) error {
	if RedisClient == nil {
		return nil
	}

	keys, err := RedisClient.Keys(c.ctx, pattern).Result()
	if err != nil {
		return err
	}

	if len(keys) > 0 {
		return RedisClient.Del(c.ctx, keys...).Err()
	}

	return nil
}

// SetWithJSON 设置JSON格式的缓存（便捷方法）
func (c *CacheService) SetWithJSON(key string, value interface{}, expiration time.Duration) error {
	return c.Set(key, value, expiration)
}

// GetJSON 获取JSON格式的缓存（便捷方法）
func (c *CacheService) GetJSON(key string, dest interface{}) bool {
	err := c.Get(key, dest)
	return err == nil
}

// 缓存键名常量
const (
	// 匹配池相关缓存键
	CacheKeyPools      = "pools:all"
	CacheKeyPool       = "pool:%d"
	CacheKeyPoolUsers  = "pool:%d:users"
	CacheKeyPoolFields = "pool:%d:fields"

	// 历史记录相关缓存键
	CacheKeyHistory     = "history:all"
	CacheKeyHistoryItem = "history:%d"

	// 统计信息缓存键
	CacheKeyStats     = "stats:general"
	CacheKeyPoolStats = "stats:pool:%d"
)

// 缓存过期时间常量
const (
	CacheExpireShort  = 5 * time.Minute  // 短期缓存：5分钟
	CacheExpireMedium = 30 * time.Minute // 中期缓存：30分钟
	CacheExpireLong   = 2 * time.Hour    // 长期缓存：2小时
	CacheExpireStatic = 24 * time.Hour   // 静态缓存：24小时
)

// GeneratePoolKey 生成匹配池缓存键
func GeneratePoolKey(poolID int) string {
	return fmt.Sprintf(CacheKeyPool, poolID)
}

// GeneratePoolUsersKey 生成匹配池用户缓存键
func GeneratePoolUsersKey(poolID int) string {
	return fmt.Sprintf(CacheKeyPoolUsers, poolID)
}

// GeneratePoolFieldsKey 生成匹配池字段缓存键
func GeneratePoolFieldsKey(poolID int) string {
	return fmt.Sprintf(CacheKeyPoolFields, poolID)
}

// GenerateHistoryKey 生成历史记录缓存键
func GenerateHistoryKey(historyID int) string {
	return fmt.Sprintf(CacheKeyHistoryItem, historyID)
}

// GeneratePoolStatsKey 生成匹配池统计缓存键
func GeneratePoolStatsKey(poolID int) string {
	return fmt.Sprintf(CacheKeyPoolStats, poolID)
}
