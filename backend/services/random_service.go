package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"
)

// RandomService 随机数服务
type RandomService struct {
	client   *http.Client
	apiKey   string
	fallback *rand.Rand
}

// RandomOrgResponse random.org API 响应结构
type RandomOrgResponse struct {
	Result struct {
		Random struct {
			Data           []int  `json:"data"`
			CompletionTime string `json:"completionTime"`
		} `json:"random"`
		BitsUsed      int `json:"bitsUsed"`
		BitsLeft      int `json:"bitsLeft"`
		RequestsLeft  int `json:"requestsLeft"`
		AdvisoryDelay int `json:"advisoryDelay"`
	} `json:"result"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    string `json:"data"`
	} `json:"error"`
}

// RandomOrgRequest random.org API 请求结构
type RandomOrgRequest struct {
	JSONRPC string `json:"jsonrpc"`
	Method  string `json:"method"`
	Params  struct {
		APIKey                    string      `json:"apiKey"`
		N                         int         `json:"n"`
		Min                       int         `json:"min"`
		Max                       int         `json:"max"`
		Replacement               bool        `json:"replacement"`
		Base                      int         `json:"base"`
		PregeneratedRandomization interface{} `json:"pregeneratedRandomization"`
	} `json:"params"`
	ID int `json:"id"`
}

// NewRandomService 创建随机数服务实例
func NewRandomService() *RandomService {
	return &RandomService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		apiKey:   "", // 可以从环境变量获取
		fallback: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

// GenerateRandomIntegers 生成随机整数序列
func (rs *RandomService) GenerateRandomIntegers(count, min, max int) ([]int, error) {
	// 先尝试使用 random.org
	if integers, err := rs.fetchFromRandomOrg(count, min, max); err == nil {
		log.Printf("🎲 从 random.org 获取 %d 个随机数", count)
		return integers, nil
	}

	// 如果 random.org 失败，使用本地随机数生成器
	log.Printf("⚠️ random.org 不可用，使用本地随机数生成器")
	return rs.generateLocalRandom(count, min, max), nil
}

// fetchFromRandomOrg 从 random.org 获取随机数
func (rs *RandomService) fetchFromRandomOrg(count, min, max int) ([]int, error) {
	request := RandomOrgRequest{
		JSONRPC: "2.0",
		Method:  "generateIntegers",
		ID:      1,
	}

	request.Params.APIKey = rs.apiKey
	request.Params.N = count
	request.Params.Min = min
	request.Params.Max = max
	request.Params.Replacement = true
	request.Params.Base = 10

	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("序列化请求失败: %v", err)
	}

	// 修复：使用 bytes.NewBuffer 创建 io.Reader
	resp, err := rs.client.Post("https://api.random.org/json-rpc/2/invoke", "application/json",
		bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("请求 random.org 失败: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("random.org 返回状态码: %d", resp.StatusCode)
	}

	var response RandomOrgResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("解析响应失败: %v", err)
	}

	if response.Error != nil {
		return nil, fmt.Errorf("random.org 错误: %s", response.Error.Message)
	}

	return response.Result.Random.Data, nil
}

// generateLocalRandom 生成本地随机数
func (rs *RandomService) generateLocalRandom(count, min, max int) []int {
	integers := make([]int, count)
	for i := 0; i < count; i++ {
		integers[i] = rs.fallback.Intn(max-min+1) + min
	}
	return integers
}

// ShuffleSlice 使用 Fisher-Yates 算法打乱切片
func (rs *RandomService) ShuffleSlice(slice []interface{}) error {
	n := len(slice)
	if n <= 1 {
		return nil
	}

	// 获取随机索引序列
	randomIndices, err := rs.GenerateRandomIntegers(n, 0, n-1)
	if err != nil {
		return err
	}

	// 使用 Fisher-Yates 算法打乱
	for i := n - 1; i > 0; i-- {
		j := randomIndices[i] % (i + 1)
		slice[i], slice[j] = slice[j], slice[i]
	}

	return nil
}

// GenerateRandomOrder 生成随机排序的索引数组
func (rs *RandomService) GenerateRandomOrder(length int) ([]int, error) {
	if length <= 0 {
		return []int{}, nil
	}

	// 创建有序索引数组
	indices := make([]interface{}, length)
	for i := 0; i < length; i++ {
		indices[i] = i
	}

	// 打乱数组
	if err := rs.ShuffleSlice(indices); err != nil {
		return nil, err
	}

	// 转换回 int 数组
	result := make([]int, length)
	for i, v := range indices {
		result[i] = v.(int)
	}

	return result, nil
}
