package services

import (
	"christmas-link-backend/cache"
	"christmas-link-backend/models"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"gorm.io/gorm"
)

// PoolService 匹配池服务
type PoolService struct {
	db            *gorm.DB
	cacheService  *cache.CacheService
	randomService *RandomService
}

// NewPoolService 创建匹配池服务实例
func NewPoolService(db *gorm.DB) *PoolService {
	return &PoolService{
		db:            db,
		cacheService:  cache.NewCacheService(),
		randomService: NewRandomService(),
	}
}

// CreatePool 创建匹配池
func (s *PoolService) CreatePool(req *models.CreatePoolRequest) (*models.PoolResponse, error) {
	// 设置默认冷却时间
	cooldownTime := req.CooldownTime
	if cooldownTime <= 0 {
		cooldownTime = 5 // 默认5秒
	}

	pool := &models.MatchPool{
		Name:         req.Name,
		Description:  req.Description,
		ValidUntil:   req.ValidUntil,
		CooldownTime: cooldownTime,
		Status:       "active",
		Fields:       req.Fields,
	}

	// 在事务中创建匹配池和字段
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 创建匹配池
		if err := tx.Create(pool).Error; err != nil {
			return err
		}

		// 设置字段的PoolID
		for i := range pool.Fields {
			pool.Fields[i].PoolID = pool.ID
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 清除相关缓存
	s.cacheService.Delete(cache.CacheKeyPools)

	// 构建响应格式
	response := &models.PoolResponse{
		ID:          pool.ID,
		Name:        pool.Name,
		Description: pool.Description,
		UserCount:   0, // 新创建的池用户数为0
		ValidUntil:  pool.ValidUntil.Format("2006-01-02 15:04:05"),
		Status:      pool.Status,
		Fields:      pool.Fields,
	}

	log.Printf("✅ 创建匹配池成功: %s (ID: %d)", pool.Name, pool.ID)
	return response, nil
}

// GetPools 获取所有匹配池（带缓存）
func (s *PoolService) GetPools() ([]models.PoolResponse, error) {
	// 尝试从缓存获取
	var pools []models.PoolResponse
	if s.cacheService.GetJSON(cache.CacheKeyPools, &pools) {
		log.Println("📋 从缓存获取匹配池列表")
		return pools, nil
	}

	// 从数据库查询
	var dbPools []models.MatchPool
	if err := s.db.Preload("Fields").Find(&dbPools).Error; err != nil {
		return nil, err
	}

	// 转换为响应格式
	pools = make([]models.PoolResponse, len(dbPools))
	for i, pool := range dbPools {
		userCount := pool.GetUserCount(s.db)

		var lastMatchedAtStr *string
		if pool.LastMatchedAt != nil {
			str := pool.LastMatchedAt.Format("2006-01-02 15:04:05")
			lastMatchedAtStr = &str
		}

		pools[i] = models.PoolResponse{
			ID:            pool.ID,
			Name:          pool.Name,
			Description:   pool.Description,
			UserCount:     userCount,
			ValidUntil:    pool.ValidUntil.Format("2006-01-02 15:04:05"),
			Status:        s.getPoolStatus(&pool),
			CooldownTime:  pool.CooldownTime,
			LastMatchedAt: lastMatchedAtStr,
			Fields:        pool.Fields,
		}
	}

	// 缓存结果
	s.cacheService.SetWithJSON(cache.CacheKeyPools, pools, cache.CacheExpireMedium)
	log.Printf("📋 从数据库获取匹配池列表，已缓存 %d 个池", len(pools))

	return pools, nil
}

// GetPoolByID 根据ID获取匹配池（带缓存）
func (s *PoolService) GetPoolByID(id uint) (*models.PoolResponse, error) {
	cacheKey := cache.GeneratePoolKey(int(id))

	// 尝试从缓存获取
	var pool models.PoolResponse
	if s.cacheService.GetJSON(cacheKey, &pool) {
		log.Printf("📋 从缓存获取匹配池: %d", id)
		return &pool, nil
	}

	// 从数据库查询
	var dbPool models.MatchPool
	if err := s.db.Preload("Fields").First(&dbPool, id).Error; err != nil {
		return nil, err
	}

	userCount := dbPool.GetUserCount(s.db)

	var lastMatchedAtStr *string
	if dbPool.LastMatchedAt != nil {
		str := dbPool.LastMatchedAt.Format("2006-01-02 15:04:05")
		lastMatchedAtStr = &str
	}

	pool = models.PoolResponse{
		ID:            dbPool.ID,
		Name:          dbPool.Name,
		Description:   dbPool.Description,
		UserCount:     userCount,
		ValidUntil:    dbPool.ValidUntil.Format("2006-01-02 15:04:05"),
		Status:        s.getPoolStatus(&dbPool),
		CooldownTime:  dbPool.CooldownTime,
		LastMatchedAt: lastMatchedAtStr,
		Fields:        dbPool.Fields,
	}

	// 缓存结果
	s.cacheService.SetWithJSON(cacheKey, pool, cache.CacheExpireMedium)
	log.Printf("📋 从数据库获取匹配池: %d，已缓存", id)

	return &pool, nil
}

// JoinPool 加入匹配池
func (s *PoolService) JoinPool(req *models.JoinPoolRequest) error {
	// 检查匹配池是否存在
	var pool models.MatchPool
	if err := s.db.First(&pool, req.PoolID).Error; err != nil {
		return fmt.Errorf("匹配池不存在")
	}

	// 检查匹配池状态
	if pool.IsExpired() {
		return fmt.Errorf("匹配池已过期")
	}

	// 将用户数据转换为JSON
	userData, err := json.Marshal(req.UserData)
	if err != nil {
		return fmt.Errorf("用户数据格式错误")
	}

	// 创建用户记录
	poolUser := &models.PoolUser{
		PoolID:      req.PoolID,
		UserData:    userData,
		ContactInfo: req.ContactInfo,
	}

	if err := s.db.Create(poolUser).Error; err != nil {
		return err
	}

	// 清除相关缓存
	s.cacheService.Delete(cache.CacheKeyPools)
	s.cacheService.Delete(cache.GeneratePoolKey(int(req.PoolID)))
	s.cacheService.Delete(cache.GeneratePoolUsersKey(int(req.PoolID)))

	log.Printf("✅ 用户加入匹配池成功: Pool %d", req.PoolID)
	return nil
}

// StartMatch 开始匹配
func (s *PoolService) StartMatch(req *models.StartMatchRequest) (*models.MatchResult, error) {
	// 获取匹配池信息
	var pool models.MatchPool
	if err := s.db.First(&pool, req.PoolID).Error; err != nil {
		return nil, fmt.Errorf("匹配池不存在")
	}

	// 检查匹配池状态和冷却时间
	if pool.Status == "matched" {
		if pool.LastMatchedAt != nil {
			// 正常的冷却时间检查
			cooldownDuration := time.Duration(pool.CooldownTime) * time.Second
			timeElapsed := time.Since(*pool.LastMatchedAt)

			if timeElapsed < cooldownDuration {
				remainingTime := cooldownDuration - timeElapsed
				return nil, fmt.Errorf("匹配池正在冷却中，还需等待 %.1f 秒", remainingTime.Seconds())
			}

			// 冷却时间结束，重置状态
			log.Printf("🔄 匹配池 %s 冷却时间结束，重置为active状态", pool.Name)
		} else {
			// 处理遗留数据：status为matched但LastMatchedAt为null的情况
			log.Printf("🔧 发现遗留数据：匹配池 %s 状态为matched但LastMatchedAt为null，重置为active状态", pool.Name)
		}

		pool.Status = "active"
		if err := s.db.Save(&pool).Error; err != nil {
			return nil, fmt.Errorf("重置匹配池状态失败: %v", err)
		}
	}

	// 检查匹配池是否可用
	if pool.Status != "active" {
		return nil, fmt.Errorf("匹配池当前状态不可用: %s", pool.Status)
	}

	// 获取所有用户
	var users []models.PoolUser
	if err := s.db.Where("pool_id = ?", req.PoolID).Find(&users).Error; err != nil {
		return nil, err
	}

	if len(users) < 2 {
		return nil, fmt.Errorf("用户数量不足，至少需要2个用户")
	}

	// 执行随机匹配
	pairs := s.performMatching(users)

	// 保存匹配记录
	record := &models.MatchRecord{
		PoolID:      req.PoolID,
		PoolName:    pool.Name,
		TotalUsers:  len(users),
		PairsCount:  len(pairs),
		HasLoneUser: len(users)%2 == 1,
		Status:      "completed",
	}

	now := time.Now()
	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 创建匹配记录
		if err := tx.Create(record).Error; err != nil {
			return err
		}

		// 创建配对记录
		for _, pair := range pairs {
			pair.RecordID = record.ID
			if err := tx.Create(&pair).Error; err != nil {
				return err
			}
		}

		// 更新匹配池状态和最后匹配时间
		pool.Status = "matched"
		pool.LastMatchedAt = &now
		if err := tx.Save(&pool).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("保存匹配记录失败: %v", err)
	}

	// 构建返回结果
	result := &models.MatchResult{
		PoolName:   pool.Name,
		TotalUsers: len(users),
		Pairs:      make([]models.MatchPairResult, len(pairs)),
		Timestamp:  time.Now().Format("2006-01-02 15:04:05"),
	}

	for i, pair := range pairs {
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

	// 清除相关缓存
	s.cacheService.Delete(cache.CacheKeyPools)
	s.cacheService.Delete(cache.CacheKeyHistory)
	s.cacheService.Delete(cache.GeneratePoolKey(int(req.PoolID)))

	log.Printf("✅ 匹配完成: Pool %d, %d个用户, %d对配对", req.PoolID, len(users), len(pairs))
	return result, nil
}

// performMatching 执行随机匹配算法（使用 random.org）
func (s *PoolService) performMatching(users []models.PoolUser) []models.MatchPair {
	// 使用真随机数打乱用户列表
	userInterfaces := make([]interface{}, len(users))
	for i, user := range users {
		userInterfaces[i] = user
	}

	// 使用 random.org 提供的真随机数进行打乱
	if err := s.randomService.ShuffleSlice(userInterfaces); err != nil {
		log.Printf("⚠️ 使用 random.org 打乱失败，使用本地随机数: %v", err)
		// 如果 random.org 失败，使用本地随机数作为备选
		rand.Seed(time.Now().UnixNano())
		for i := len(userInterfaces) - 1; i > 0; i-- {
			j := rand.Intn(i + 1)
			userInterfaces[i], userInterfaces[j] = userInterfaces[j], userInterfaces[i]
		}
	}

	// 转换回用户列表
	shuffled := make([]models.PoolUser, len(users))
	for i, userInterface := range userInterfaces {
		shuffled[i] = userInterface.(models.PoolUser)
	}

	var pairs []models.MatchPair
	pairNumber := 1

	// 两两配对
	for i := 0; i < len(shuffled)-1; i += 2 {
		user1 := shuffled[i]
		user2 := shuffled[i+1]

		// 解析用户数据
		var user1Data, user2Data map[string]interface{}
		json.Unmarshal(user1.UserData, &user1Data)
		json.Unmarshal(user2.UserData, &user2Data)

		pair := models.MatchPair{
			PairNumber:      pairNumber,
			User1ID:         user1.ID,
			User2ID:         &user2.ID,
			User1Data:       user1.UserData,
			User2Data:       user2.UserData,
			ParsedUser1Data: user1Data,
			ParsedUser2Data: user2Data,
		}

		pairs = append(pairs, pair)
		pairNumber++
	}

	// 处理轮空用户
	if len(shuffled)%2 == 1 {
		loneUser := shuffled[len(shuffled)-1]
		var userData map[string]interface{}
		json.Unmarshal(loneUser.UserData, &userData)

		pair := models.MatchPair{
			PairNumber:      pairNumber,
			User1ID:         loneUser.ID,
			User2ID:         nil,
			User1Data:       loneUser.UserData,
			User2Data:       nil,
			ParsedUser1Data: userData,
			ParsedUser2Data: nil,
		}

		pairs = append(pairs, pair)
	}

	log.Printf("🎲 使用真随机数完成用户匹配，总用户: %d，配对数: %d", len(users), len(pairs))
	return pairs
}

// getUserDisplayName 获取用户显示名称
func (s *PoolService) getUserDisplayName(userData map[string]interface{}) string {
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

// getPoolStatus 获取匹配池状态
func (s *PoolService) getPoolStatus(pool *models.MatchPool) string {
	if pool.IsExpired() {
		return "expired"
	}

	// 如果状态是matched，检查冷却时间
	if pool.Status == "matched" {
		// 如果没有lastMatchedAt记录，说明是旧数据，应该重置为active
		if pool.LastMatchedAt == nil {
			return "active"
		}

		cooldownDuration := time.Duration(pool.CooldownTime) * time.Second
		timeElapsed := time.Since(*pool.LastMatchedAt)

		// 如果冷却时间已过，应该返回active状态
		if timeElapsed >= cooldownDuration {
			return "active"
		}
	}

	return pool.Status
} // GetPoolUsers 获取匹配池用户列表（带缓存）
func (s *PoolService) GetPoolUsers(poolID uint) ([]models.PoolUser, error) {
	cacheKey := cache.GeneratePoolUsersKey(int(poolID))

	// 尝试从缓存获取
	var users []models.PoolUser
	if s.cacheService.GetJSON(cacheKey, &users) {
		log.Printf("👥 从缓存获取匹配池用户: %d", poolID)
		return users, nil
	}

	// 从数据库查询
	if err := s.db.Where("pool_id = ?", poolID).Find(&users).Error; err != nil {
		return nil, err
	}

	// 缓存结果
	s.cacheService.SetWithJSON(cacheKey, users, cache.CacheExpireShort)
	log.Printf("👥 从数据库获取匹配池用户: %d，已缓存", poolID)

	return users, nil
}

// SearchUserByContact 根据联系方式搜索用户
func (s *PoolService) SearchUserByContact(contactInfo string) ([]models.PoolUser, error) {
	var users []models.PoolUser
	err := s.db.Where("contact_info LIKE ?", "%"+contactInfo+"%").
		Preload("ParsedUserData").
		Find(&users).Error

	return users, err
}

// RemoveUser 移除用户
func (s *PoolService) RemoveUser(userID uint) error {
	var user models.PoolUser
	if err := s.db.First(&user, userID).Error; err != nil {
		return fmt.Errorf("用户不存在")
	}

	if err := s.db.Delete(&user).Error; err != nil {
		return err
	}

	// 清除相关缓存
	s.cacheService.Delete(cache.CacheKeyPools)
	s.cacheService.Delete(cache.GeneratePoolKey(int(user.PoolID)))
	s.cacheService.Delete(cache.GeneratePoolUsersKey(int(user.PoolID)))

	log.Printf("✅ 移除用户成功: %d", userID)
	return nil
}
