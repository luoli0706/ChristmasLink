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
