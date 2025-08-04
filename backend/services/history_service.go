package services

import (
	"christmas-link-backend/cache"
	"christmas-link-backend/models"
	"log"
	"time"

	"gorm.io/gorm"
)

// HistoryService 历史记录服务
type HistoryService struct {
	db           *gorm.DB
	cacheService *cache.CacheService
}

// NewHistoryService 创建历史记录服务实例
func NewHistoryService(db *gorm.DB) *HistoryService {
	return &HistoryService{
		db:           db,
		cacheService: cache.NewCacheService(),
	}
}

// GetHistory 获取匹配历史记录列表（带缓存）
func (s *HistoryService) GetHistory() ([]models.HistoryRecord, error) {
	// 尝试从缓存获取
	var history []models.HistoryRecord
	if s.cacheService.GetJSON(cache.CacheKeyHistory, &history) {
		log.Println("📚 从缓存获取历史记录列表")
		return history, nil
	}

	// 从数据库查询
	var records []models.MatchRecord
	if err := s.db.Order("matched_at DESC").Find(&records).Error; err != nil {
		return nil, err
	}

	// 转换为响应格式
	history = make([]models.HistoryRecord, len(records))
	for i, record := range records {
		history[i] = models.HistoryRecord{
			ID:          record.ID,
			PoolName:    record.PoolName,
			MatchDate:   record.MatchedAt.Format("2006-01-02 15:04:05"),
			TotalUsers:  record.TotalUsers,
			PairsCount:  record.PairsCount,
			HasLoneUser: record.HasLoneUser,
			Status:      record.Status,
		}
	}

	// 缓存结果
	s.cacheService.SetWithJSON(cache.CacheKeyHistory, history, cache.CacheExpireMedium)
	log.Printf("📚 从数据库获取历史记录列表，已缓存 %d 条记录", len(history))

	return history, nil
}

// GetHistoryByID 根据ID获取历史记录详情（带缓存）
func (s *HistoryService) GetHistoryByID(id uint) (*models.MatchResult, error) {
	cacheKey := cache.GenerateHistoryKey(int(id))

	// 尝试从缓存获取
	var result models.MatchResult
	if s.cacheService.GetJSON(cacheKey, &result) {
		log.Printf("📚 从缓存获取历史记录详情: %d", id)
		return &result, nil
	}

	// 从数据库查询
	var record models.MatchRecord
	if err := s.db.Preload("Pairs").First(&record, id).Error; err != nil {
		return nil, err
	}

	// 构建返回结果
	result = models.MatchResult{
		PoolName:   record.PoolName,
		TotalUsers: record.TotalUsers,
		Pairs:      make([]models.MatchPairResult, len(record.Pairs)),
		Timestamp:  record.MatchedAt.Format("2006-01-02 15:04:05"),
	}

	for i, pair := range record.Pairs {
		user1Name := s.getUserDisplayName(pair.ParsedUser1Data)
		result.Pairs[i] = models.MatchPairResult{
			Pair:      pair.PairNumber,
			User1:     user1Name,
			User1Data: pair.ParsedUser1Data,
		}

		if pair.ParsedUser2Data != nil {
			user2Name := s.getUserDisplayName(pair.ParsedUser2Data)
			result.Pairs[i].User2 = user2Name
			result.Pairs[i].User2Data = pair.ParsedUser2Data
		}
	}

	// 缓存结果
	s.cacheService.SetWithJSON(cacheKey, result, cache.CacheExpireLong)
	log.Printf("📚 从数据库获取历史记录详情: %d，已缓存", id)

	return &result, nil
}

// getUserDisplayName 获取用户显示名称
func (s *HistoryService) getUserDisplayName(userData map[string]interface{}) string {
	// 按优先级查找显示名称
	priorities := []string{"name", "姓名", "昵称", "nickname", "username", "用户名"}

	for _, key := range priorities {
		if value, ok := userData[key]; ok {
			if str, ok := value.(string); ok && str != "" {
				return str
			}
		}
	}

	// 如果没有找到名称字段，返回第一个非空字符串值
	for _, value := range userData {
		if str, ok := value.(string); ok && str != "" {
			return str
		}
	}

	return "匿名用户"
}

// GetStatistics 获取统计信息（带缓存）
func (s *HistoryService) GetStatistics() (map[string]interface{}, error) {
	// 尝试从缓存获取
	var stats map[string]interface{}
	if s.cacheService.GetJSON(cache.CacheKeyStats, &stats) {
		log.Println("📊 从缓存获取统计信息")
		return stats, nil
	}

	// 从数据库查询统计信息
	var totalPools int64
	var totalUsers int64
	var totalMatches int64
	var totalPairs int64

	s.db.Model(&models.MatchPool{}).Count(&totalPools)
	s.db.Model(&models.PoolUser{}).Count(&totalUsers)
	s.db.Model(&models.MatchRecord{}).Count(&totalMatches)
	s.db.Model(&models.MatchPair{}).Count(&totalPairs)

	stats = map[string]interface{}{
		"totalPools":   totalPools,
		"totalUsers":   totalUsers,
		"totalMatches": totalMatches,
		"totalPairs":   totalPairs,
		"updatedAt":    time.Now().Format("2006-01-02 15:04:05"),
	}

	// 缓存结果
	s.cacheService.SetWithJSON(cache.CacheKeyStats, stats, cache.CacheExpireLong)
	log.Println("📊 从数据库获取统计信息，已缓存")

	return stats, nil
}
