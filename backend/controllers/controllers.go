package controllers

import (
	"christmas-link-backend/models"
	"christmas-link-backend/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PoolController 匹配池控制器
type PoolController struct {
	poolService *services.PoolService
}

// NewPoolController 创建匹配池控制器实例
func NewPoolController(db *gorm.DB) *PoolController {
	return &PoolController{
		poolService: services.NewPoolService(db),
	}
}

// CreatePool 创建匹配池
func (pc *PoolController) CreatePool(c *gin.Context) {
	var req models.CreatePoolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	pool, err := pc.poolService.CreatePool(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "创建匹配池失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "创建匹配池成功",
		"data":    pool,
	})
}

// GetPools 获取所有匹配池
func (pc *PoolController) GetPools(c *gin.Context) {
	pools, err := pc.poolService.GetPools()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取匹配池列表失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取匹配池列表成功",
		"data":    pools,
	})
}

// GetPoolByID 根据ID获取匹配池
func (pc *PoolController) GetPoolByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的匹配池ID",
			"data":    nil,
		})
		return
	}

	pool, err := pc.poolService.GetPoolByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "匹配池不存在",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取匹配池成功",
		"data":    pool,
	})
}

// JoinPool 加入匹配池
func (pc *PoolController) JoinPool(c *gin.Context) {
	var req models.JoinPoolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	err := pc.poolService.JoinPool(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "加入匹配池成功",
		"data":    nil,
	})
}

// StartMatch 开始匹配
func (pc *PoolController) StartMatch(c *gin.Context) {
	var req models.StartMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	result, err := pc.poolService.StartMatch(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "匹配完成",
		"data":    result,
	})
}

// HistoryController 历史记录控制器
type HistoryController struct {
	historyService *services.HistoryService
}

// NewHistoryController 创建历史记录控制器实例
func NewHistoryController(db *gorm.DB) *HistoryController {
	return &HistoryController{
		historyService: services.NewHistoryService(db),
	}
}

// GetHistory 获取匹配历史记录
func (hc *HistoryController) GetHistory(c *gin.Context) {
	history, err := hc.historyService.GetHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取历史记录失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取历史记录成功",
		"data":    history,
	})
}

// GetHistoryByID 根据ID获取历史记录详情
func (hc *HistoryController) GetHistoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的历史记录ID",
			"data":    nil,
		})
		return
	}

	record, err := hc.historyService.GetHistoryByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "历史记录不存在",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取历史记录详情成功",
		"data":    record,
	})
}

// GetStatistics 获取统计信息
func (hc *HistoryController) GetStatistics(c *gin.Context) {
	stats, err := hc.historyService.GetStatistics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取统计信息失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取统计信息成功",
		"data":    stats,
	})
}

// UserController 用户控制器
type UserController struct {
	userService *services.UserService
}

// NewUserController 创建用户控制器实例
func NewUserController(db *gorm.DB) *UserController {
	return &UserController{
		userService: services.NewUserService(db),
	}
}

// SearchUsers 搜索用户
func (uc *UserController) SearchUsers(c *gin.Context) {
	var req services.SearchUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	users, err := uc.userService.SearchUsers(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "搜索用户失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "搜索用户成功",
		"data":    users,
	})
}

// RemoveUser 移除用户
func (uc *UserController) RemoveUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的用户ID",
			"data":    nil,
		})
		return
	}

	if err := uc.userService.RemoveUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "移除用户失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "移除用户成功",
		"data":    nil,
	})
}

// AdminController 管理员控制器
type AdminController struct {
	historyService *services.HistoryService
}

// NewAdminController 创建管理员控制器实例
func NewAdminController(db *gorm.DB) *AdminController {
	return &AdminController{
		historyService: services.NewHistoryService(db),
	}
}

// AdminLogin 管理员登录验证
func (ac *AdminController) AdminLogin(c *gin.Context) {
	var req models.AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误",
			"data":    nil,
		})
		return
	}

	// 验证管理员密码
	if req.Password != "QiShiJi7776" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "密码错误",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "管理员登录成功",
		"data": gin.H{
			"isAdmin": true,
			"token":   "admin_authenticated", // 简单的令牌
		},
	})
}

// GetAdminHistory 获取管理员完整历史记录（包含所有用户信息）
func (ac *AdminController) GetAdminHistory(c *gin.Context) {
	// 验证管理员权限
	authHeader := c.GetHeader("Authorization")
	if authHeader != "Bearer admin_authenticated" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "需要管理员权限",
			"data":    nil,
		})
		return
	}

	// 获取完整历史记录
	history, err := ac.historyService.GetFullHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "获取历史记录失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取管理员历史记录成功",
		"data":    history,
	})
}
