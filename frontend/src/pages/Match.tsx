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

interface MatchProps {
  onNavigate?: (page: string) => void;
  onGoBack?: () => void;
}

const Match: React.FC<MatchProps> = () => {
  const [pools, setPools] = useState<MatchPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<MatchPool | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

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
    } catch (error) {
      console.error('匹配失败:', error);
    } finally {
      setIsMatching(false);
    }
  };

  if (matchResult) {
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

          <div className="pairs-result">
            <h3>配对结果</h3>
            <div className="pairs-list">
              {(matchResult.pairs || []).map((pair, index) => (
                <div key={index} className="pair-card">
                  <div className="pair-header">
                    <h4>配对 {pair.pair}</h4>
                  </div>
                  <div className="pair-users">
                    <div className="user">
                      <span className="user-name">{pair.user1}</span>
                      <div className="user-data">
                        {Object.entries(pair.user1Data).map(([key, value]) => (
                          <div key={key} className="data-item">
                            <span className="data-key">{key}:</span>
                            <span className="data-value">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {pair.user2 ? (
                      <>
                        <div className="pair-arrow">↔️</div>
                        <div className="user">
                          <span className="user-name">{pair.user2}</span>
                          <div className="user-data">
                            {pair.user2Data && Object.entries(pair.user2Data).map(([key, value]) => (
                              <div key={key} className="data-item">
                                <span className="data-key">{key}:</span>
                                <span className="data-value">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="user-alone">
                        <span>🎄 轮空 (奇数参与者)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-actions">
            <button 
              className="new-match-btn"
              onClick={() => {
                setMatchResult(null);
                setSelectedPool(null);
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
          {pools.map(pool => (
            <div 
              key={pool.id} 
              className={`pool-card ${selectedPool?.id === pool.id ? 'selected' : ''} ${pool.status !== 'active' ? 'disabled' : ''}`}
              onClick={() => pool.status === 'active' && setSelectedPool(pool)}
            >
              <div className="pool-header">
                <h4>{pool.name}</h4>
                <span className={`pool-status ${pool.status}`}>
                  {pool.status === 'active' ? '活跃' : 
                   pool.status === 'matched' ? '已匹配' : '已过期'}
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
                </div>
              </div>
            </div>
          ))}
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
