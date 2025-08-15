package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// MatchPool 匹配池模型
type MatchPool struct {
	ID            uint       `json:"id" gorm:"primarykey"`
	Name          string     `json:"name" gorm:"not null"`
	Description   string     `json:"description"`
	ValidUntil    time.Time  `json:"validUntil" gorm:"not null"`
	Status        string     `json:"status" gorm:"default:active"`  // active, expired, matched
	CooldownTime  int        `json:"cooldownTime" gorm:"default:5"` // 冷却时间（秒）
	LastMatchedAt *time.Time `json:"lastMatchedAt"`                 // 最后匹配时间
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`

	// 关联关系
	Fields []PoolField `json:"fields" gorm:"foreignKey:PoolID;constraint:OnDelete:CASCADE"`
	Users  []PoolUser  `json:"users" gorm:"foreignKey:PoolID;constraint:OnDelete:CASCADE"`
}

// PoolField 匹配池字段配置模型
type PoolField struct {
	ID         uint      `json:"id" gorm:"primarykey"`
	PoolID     uint      `json:"poolId" gorm:"not null"`
	FieldName  string    `json:"name" gorm:"not null"`
	FieldLabel string    `json:"label" gorm:"not null"`
	FieldType  string    `json:"type" gorm:"not null"` // text, textarea, number, email, url
	IsRequired bool      `json:"required" gorm:"default:false"`
	FieldOrder int       `json:"order" gorm:"default:0"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// PoolUser 匹配池用户模型
type PoolUser struct {
	ID          uint            `json:"id" gorm:"primarykey"`
	PoolID      uint            `json:"poolId" gorm:"not null"`
	UserData    json.RawMessage `json:"userData" gorm:"type:text;not null"` // JSON格式存储用户数据
	ContactInfo string          `json:"contactInfo"`                        // 用于移除功能
	JoinedAt    time.Time       `json:"joinedAt"`

	// 用于解析JSON数据的临时字段
	ParsedUserData map[string]interface{} `json:"parsedUserData" gorm:"-"`
}

// MatchRecord 匹配记录模型
type MatchRecord struct {
	ID          uint      `json:"id" gorm:"primarykey"`
	PoolID      uint      `json:"poolId" gorm:"not null"`
	PoolName    string    `json:"poolName" gorm:"not null"`
	TotalUsers  int       `json:"totalUsers" gorm:"not null"`
	PairsCount  int       `json:"pairsCount" gorm:"not null"`
	HasLoneUser bool      `json:"hasLoneUser" gorm:"default:false"`
	Status      string    `json:"status" gorm:"default:completed"` // completed, in_progress
	MatchedAt   time.Time `json:"matchedAt"`

	// 关联关系
	Pairs []MatchPair `json:"pairs" gorm:"foreignKey:RecordID;constraint:OnDelete:CASCADE"`
}

// MatchPair 匹配配对模型
type MatchPair struct {
	ID         uint            `json:"id" gorm:"primarykey"`
	RecordID   uint            `json:"recordId" gorm:"not null"`
	PairNumber int             `json:"pair" gorm:"not null"`
	User1ID    uint            `json:"user1Id" gorm:"not null"`
	User2ID    *uint           `json:"user2Id"` // NULL表示轮空
	User1Data  json.RawMessage `json:"user1Data" gorm:"type:text;not null"`
	User2Data  json.RawMessage `json:"user2Data" gorm:"type:text"`

	// 用于解析JSON数据的临时字段
	ParsedUser1Data map[string]interface{} `json:"user1" gorm:"-"`
	ParsedUser2Data map[string]interface{} `json:"user2" gorm:"-"`
}

// BeforeCreate 创建前的钩子函数
func (p *MatchPool) BeforeCreate(tx *gorm.DB) error {
	if p.Status == "" {
		p.Status = "active"
	}
	return nil
}

// IsExpired 检查匹配池是否已过期
func (p *MatchPool) IsExpired() bool {
	return time.Now().After(p.ValidUntil)
}

// GetUserCount 获取匹配池用户数量
func (p *MatchPool) GetUserCount(db *gorm.DB) int64 {
	var count int64
	db.Model(&PoolUser{}).Where("pool_id = ?", p.ID).Count(&count)
	return count
}

// BeforeCreate 创建前的钩子函数 - PoolUser
func (pu *PoolUser) BeforeCreate(tx *gorm.DB) error {
	pu.JoinedAt = time.Now()
	return nil
}

// AfterFind 查询后的钩子函数 - PoolUser
func (pu *PoolUser) AfterFind(tx *gorm.DB) error {
	if len(pu.UserData) > 0 {
		return json.Unmarshal(pu.UserData, &pu.ParsedUserData)
	}
	return nil
}

// BeforeCreate 创建前的钩子函数 - MatchRecord
func (mr *MatchRecord) BeforeCreate(tx *gorm.DB) error {
	mr.MatchedAt = time.Now()
	if mr.Status == "" {
		mr.Status = "completed"
	}
	return nil
}

// AfterFind 查询后的钩子函数 - MatchPair
func (mp *MatchPair) AfterFind(tx *gorm.DB) error {
	if len(mp.User1Data) > 0 {
		if err := json.Unmarshal(mp.User1Data, &mp.ParsedUser1Data); err != nil {
			return err
		}
	}
	if len(mp.User2Data) > 0 {
		if err := json.Unmarshal(mp.User2Data, &mp.ParsedUser2Data); err != nil {
			return err
		}
	}
	return nil
}

// CreatePoolRequest 创建匹配池请求结构
type CreatePoolRequest struct {
	Name         string      `json:"name" binding:"required"`
	Description  string      `json:"description"`
	ValidUntil   time.Time   `json:"validUntil" binding:"required"`
	CooldownTime int         `json:"cooldownTime"` // 冷却时间（秒），默认5秒
	Fields       []PoolField `json:"fields" binding:"required"`
}

// JoinPoolRequest 加入匹配池请求结构
type JoinPoolRequest struct {
	PoolID      uint                   `json:"poolId" binding:"required"`
	UserData    map[string]interface{} `json:"userData" binding:"required"`
	ContactInfo string                 `json:"contactInfo"`
}

// StartMatchRequest 开始匹配请求结构
type StartMatchRequest struct {
	PoolID uint `json:"poolId" binding:"required"`
}

// PoolResponse 匹配池响应结构
type PoolResponse struct {
	ID            uint        `json:"id"`
	Name          string      `json:"name"`
	Description   string      `json:"description"`
	UserCount     int64       `json:"userCount"`
	ValidUntil    string      `json:"validUntil"`
	Status        string      `json:"status"`
	CooldownTime  int         `json:"cooldownTime"`
	LastMatchedAt *string     `json:"lastMatchedAt"`
	Fields        []PoolField `json:"fields"`
}

// MatchResult 匹配结果结构
type MatchResult struct {
	PoolName   string            `json:"poolName"`
	TotalUsers int               `json:"totalUsers"`
	Pairs      []MatchPairResult `json:"pairs"`
	Timestamp  string            `json:"timestamp"`
}

// MatchPairResult 匹配配对结果结构
type MatchPairResult struct {
	Pair      int                    `json:"pair"`
	User1     string                 `json:"user1"`
	User2     string                 `json:"user2,omitempty"`
	User1Data map[string]interface{} `json:"user1Data"`
	User2Data map[string]interface{} `json:"user2Data,omitempty"`
}

// HistoryRecord 历史记录结构
type HistoryRecord struct {
	ID          uint   `json:"id"`
	PoolName    string `json:"poolName"`
	MatchDate   string `json:"matchDate"`
	TotalUsers  int    `json:"totalUsers"`
	PairsCount  int    `json:"pairsCount"`
	HasLoneUser bool   `json:"hasLoneUser"`
	Status      string `json:"status"`
}

// AdminLoginRequest 管理员登录请求
type AdminLoginRequest struct {
	Password string `json:"password" binding:"required"`
}
