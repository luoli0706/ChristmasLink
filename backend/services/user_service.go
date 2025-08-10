package services

import (
	"christmas-link-backend/cache"
	"christmas-link-backend/models"
	"encoding/json"
	"fmt"
	"log"

	"gorm.io/gorm"
)

// UserService 用户服务
type UserService struct {
	db           *gorm.DB
	cacheService *cache.CacheService
}

// NewUserService 创建用户服务实例
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db:           db,
		cacheService: cache.NewCacheService(),
	}
}

// SearchUserRequest 搜索用户请求结构
type SearchUserRequest struct {
	ContactInfo string `json:"contactInfo" binding:"required"`
}

// UserInfo 用户信息结构
type UserInfo struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	ContactInfo string `json:"contactInfo"`
	PoolName    string `json:"poolName"`
	JoinedDate  string `json:"joinedDate"`
	Status      string `json:"status"`
}

// SearchUsers 搜索用户
func (us *UserService) SearchUsers(req *SearchUserRequest) ([]UserInfo, error) {
	var users []models.PoolUser

	// 搜索联系方式匹配的用户
	if err := us.db.Where("contact_info LIKE ?", "%"+req.ContactInfo+"%").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("搜索用户失败: %v", err)
	}

	if len(users) == 0 {
		return []UserInfo{}, nil
	}

	// 获取匹配池信息
	var poolIDs []uint
	for _, user := range users {
		poolIDs = append(poolIDs, user.PoolID)
	}

	var pools []models.MatchPool
	if err := us.db.Where("id IN ?", poolIDs).Find(&pools).Error; err != nil {
		return nil, fmt.Errorf("查询匹配池信息失败: %v", err)
	}

	// 创建池ID到池名的映射
	poolMap := make(map[uint]models.MatchPool)
	for _, pool := range pools {
		poolMap[pool.ID] = pool
	}

	// 构建用户信息
	var userInfos []UserInfo
	for _, user := range users {
		// 解析用户数据获取姓名
		var userData map[string]interface{}
		if err := json.Unmarshal(user.UserData, &userData); err != nil {
			continue
		}

		name := us.getUserDisplayName(userData)
		pool := poolMap[user.PoolID]

		// 确定用户状态
		status := "active"
		if pool.Status == "matched" {
			status = "matched"
		} else if pool.IsExpired() {
			status = "expired"
		}

		userInfo := UserInfo{
			ID:          user.ID,
			Name:        name,
			ContactInfo: user.ContactInfo,
			PoolName:    pool.Name,
			JoinedDate:  user.JoinedAt.Format("2006-01-02 15:04:05"),
			Status:      status,
		}

		userInfos = append(userInfos, userInfo)
	}

	log.Printf("🔍 搜索用户完成，找到 %d 个匹配用户", len(userInfos))
	return userInfos, nil
}

// RemoveUser 移除用户
func (us *UserService) RemoveUser(userID uint) error {
	// 检查用户是否存在
	var user models.PoolUser
	if err := us.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("用户不存在")
		}
		return fmt.Errorf("查询用户失败: %v", err)
	}

	// 检查用户所在的匹配池状态
	var pool models.MatchPool
	if err := us.db.First(&pool, user.PoolID).Error; err != nil {
		return fmt.Errorf("查询匹配池失败: %v", err)
	}

	if pool.Status == "matched" {
		return fmt.Errorf("该匹配池已完成匹配，无法移除用户")
	}

	// 删除用户
	if err := us.db.Delete(&user).Error; err != nil {
		return fmt.Errorf("移除用户失败: %v", err)
	}

	// 清除相关缓存
	us.cacheService.Delete(cache.CacheKeyPools)
	us.cacheService.Delete(cache.GeneratePoolKey(int(user.PoolID)))
	us.cacheService.Delete(cache.CacheKeyStats)

	log.Printf("🗑️ 移除用户成功: ID %d，从匹配池 %d", userID, user.PoolID)
	return nil
}

// getUserDisplayName 获取用户显示名称
func (us *UserService) getUserDisplayName(userData map[string]interface{}) string {
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
