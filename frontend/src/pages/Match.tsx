import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import '../styles/Match.css';

interface MatchPool {
  id: number;
  name: string;
  description: string;
  userCount: number;
  validUntil: string;
  status: 'active' | 'expired' | 'matched';
  cooldownTime?: number;
  lastMatchedAt?: string;
}

interface MatchPair {
  pair: number;
  user1: string;
  user2?: string;
  user1Data: Record<string, any>;
  user2Data?: Record<string, any>;
}

interface MatchResult {
  poolName: string;
  totalUsers: number;
  pairs: MatchPair[];
  timestamp: string;
}

interface UserResult {
  name: string;
  cn: string;
  data: Record<string, any>;
  partnerId?: string;
  partnerData?: Record<string, any>;
  isAlone?: boolean;
}

interface MatchProps {
  onNavigate?: (page: string) => void;
  onGoBack?: () => void;
}

const Match: React.FC<MatchProps> = () => {
  const [pools, setPools] = useState<MatchPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<MatchPool | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const response = await api.getPools();
      
      // 检查响应格式并提取data字段
      let poolsData = response;
      if (response && typeof response === 'object' && 'data' in response) {
        poolsData = response.data;
      }
      
      // 检查poolsData是否为数组
      if (Array.isArray(poolsData)) {
        const activePools = poolsData.filter((pool: MatchPool) => 
          pool.userCount > 0 // 移除status检查，显示所有有用户的池子
        );
        setPools(activePools);
      } else {
        console.error('API响应格式错误:', response);
        setPools([]);
      }
    } catch (error) {
      console.error('获取匹配池列表失败:', error);
      setPools([]);
    }
  };

  const handleStartMatch = async () => {
    if (!selectedPool) return;
    
    setIsMatching(true);
    
    try {
      const response = await api.startMatch({ poolId: selectedPool.id });
      
      // 检查响应格式并提取data字段
      let matchData = response;
      if (response && typeof response === 'object' && 'data' in response) {
        matchData = response.data;
      }
      
      console.log('匹配响应数据:', matchData);
      setMatchResult(matchData);
      
      // 重新加载匹配池列表以更新状态
      await loadPools();
    } catch (error) {
      console.error('匹配失败:', error);
      
      // 显示具体的错误信息
      if (error instanceof Error && error.message.includes('冷却')) {
        alert(error.message);
      } else if (error instanceof Error && error.message.includes('状态不可用')) {
        alert('匹配池当前不可用，可能需要等待冷却时间');
      } else {
        alert('匹配失败，请稍后重试');
      }
      
      // 重新加载匹配池列表
      await loadPools();
    } finally {
      setIsMatching(false);
    }
  };

  // 将配对结果转换为单人显示的数据结构
  const processMatchResults = (matchResult: MatchResult): UserResult[] => {
    const users: UserResult[] = [];

    matchResult.pairs.forEach(pair => {
      // 添加用户1
      users.push({
        name: pair.user1,
        cn: pair.user1Data.cn || pair.user1,
        data: pair.user1Data,
        partnerId: pair.user2 || undefined,
        partnerData: pair.user2Data || undefined,
        isAlone: !pair.user2
      });

      // 添加用户2（如果存在）
      if (pair.user2 && pair.user2Data) {
        users.push({
          name: pair.user2,
          cn: pair.user2Data.cn || pair.user2,
          data: pair.user2Data,
          partnerId: pair.user1,
          partnerData: pair.user1Data,
          isAlone: false
        });
      }
    });

    // 按照cn首字符的ASCII码排序
    return users.sort((a, b) => {
      const aFirstChar = a.cn.charAt(0);
      const bFirstChar = b.cn.charAt(0);
      return aFirstChar.charCodeAt(0) - bFirstChar.charCodeAt(0);
    });
  };

  if (matchResult) {
    const processedUsers = processMatchResults(matchResult);
    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = processedUsers.slice(startIndex, endIndex);

    return (
      <div className="match-container">
        <div className="match-result">
          <div className="result-header">
            <h2>🎉 匹配完成！</h2>
            <div className="result-stats">
              <div className="stat">
                <span className="stat-label">匹配池:</span>
                <span className="stat-value">{matchResult.poolName}</span>
              </div>
              <div className="stat">
                <span className="stat-label">参与人数:</span>
                <span className="stat-value">{matchResult.totalUsers}</span>
              </div>
              <div className="stat">
                <span className="stat-label">配对数量:</span>
                <span className="stat-value">{matchResult.pairs?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="users-result">
            <h3>匹配用户列表</h3>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>我的信息</th>
                    <th>匹配对象信息</th>
                    <th>匹配状态</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr key={`${user.name}-${index}`}>
                      <td>
                        <div className="user-info">
                          <strong>{user.cn}</strong>
                        </div>
                      </td>
                      <td>
                        {user.partnerId && user.partnerData ? (
                          <div className="partner-info">
                            <div className="partner-details">
                              {Object.entries(user.partnerData)
                                .filter(([key]) => key !== 'cn') // 过滤掉cn字段以保持匿名性
                                .map(([key, value]) => (
                                <div key={key} className="detail-item">
                                  <span className="detail-key">{key}:</span>
                                  <span className="detail-value">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="anonymity-notice">
                              <small>🎭 对方姓名已隐藏以保持匿名</small>
                            </div>
                          </div>
                        ) : (
                          <span className="no-partner">-</span>
                        )}
                      </td>
                      <td>
                        <div className="user-status">
                          {user.isAlone ? (
                            <span className="status-alone">🎄 轮空</span>
                          ) : (
                            <span className="status-paired">🤝 已匹配</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  第 {currentPage} 页，共 {totalPages} 页 (总计 {processedUsers.length} 人)
                </div>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="result-actions">
            <button 
              className="new-match-btn"
              onClick={() => {
                setMatchResult(null);
                setSelectedPool(null);
                setCurrentPage(1);
                loadPools();
              }}
            >
              进行新匹配
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-container">
      <h2>开始匹配</h2>
      
      <div className="pool-selection">
        <h3>选择匹配池</h3>
        <div className="pools-grid">
          {pools.map(pool => {
            // 计算冷却状态
            const calculateCooldownStatus = (pool: MatchPool) => {
              if (pool.status !== 'matched' || !pool.lastMatchedAt) {
                return { isInCooldown: false, remainingTime: 0 };
              }
              
              const lastMatchTime = new Date(pool.lastMatchedAt).getTime();
              const currentTime = new Date().getTime();
              const cooldownMs = (pool.cooldownTime || 5) * 1000;
              const elapsed = currentTime - lastMatchTime;
              
              if (elapsed >= cooldownMs) {
                return { isInCooldown: false, remainingTime: 0 };
              }
              
              return { 
                isInCooldown: true, 
                remainingTime: Math.ceil((cooldownMs - elapsed) / 1000) 
              };
            };

            const cooldownStatus = calculateCooldownStatus(pool);
            const canMatch = pool.status === 'active' || !cooldownStatus.isInCooldown;

            return (
              <div 
                key={pool.id} 
                className={`pool-card ${selectedPool?.id === pool.id ? 'selected' : ''} ${!canMatch ? 'disabled' : ''}`}
                onClick={() => canMatch && setSelectedPool(pool)}
              >
                <div className="pool-header">
                  <h4>{pool.name}</h4>
                  <span className={`pool-status ${pool.status}`}>
                    {pool.status === 'active' ? '活跃' : 
                     pool.status === 'matched' ? 
                       (cooldownStatus.isInCooldown ? `冷却中 ${cooldownStatus.remainingTime}s` : '可重新匹配') : 
                     '已过期'}
                  </span>
                </div>
                
                <div className="pool-info">
                  <p className="pool-description">{pool.description}</p>
                  <div className="pool-stats">
                    <div className="stat">
                      <span className="stat-icon">👥</span>
                      <span>{pool.userCount} 人</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">⏰</span>
                      <span>{new Date(pool.validUntil).toLocaleDateString()}</span>
                    </div>
                    {pool.cooldownTime && (
                      <div className="stat">
                        <span className="stat-icon">🔄</span>
                        <span>冷却 {pool.cooldownTime}s</span>
                      </div>
                    )}
                  </div>
                  
                  {cooldownStatus.isInCooldown && (
                    <div className="cooldown-notice">
                      <span className="cooldown-icon">❄️</span>
                      <span>冷却中，还需 {cooldownStatus.remainingTime} 秒</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {pools.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>暂无可匹配的池</h3>
            <p>目前没有活跃的匹配池，请先创建一个匹配池</p>
          </div>
        )}
      </div>

      {selectedPool && (
        <div className="match-action">
          <div className="selected-pool-info">
            <h4>已选择: {selectedPool.name}</h4>
            <p>参与人数: {selectedPool.userCount}</p>
          </div>
          
          <button 
            className="start-match-btn"
            onClick={handleStartMatch}
            disabled={isMatching || selectedPool.userCount < 2}
          >
            {isMatching ? '匹配中...' : '开始匹配'}
          </button>
          
          {selectedPool.userCount < 2 && (
            <p className="warning">至少需要2个用户才能开始匹配</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Match;
