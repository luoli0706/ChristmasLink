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
  onNavigate: (page: string) => void;
}

const Match: React.FC<MatchProps> = ({ onNavigate }) => {
  const [pools, setPools] = useState<MatchPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<MatchPool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPools();
      // 只显示活跃且有用户的匹配池
      const activePools = response.filter((pool: MatchPool) => 
        pool.status === 'active' && pool.userCount > 0
      );
      setPools(activePools);
    } catch (error) {
      console.error('获取匹配池列表失败:', error);
      setMessage({ 
        type: 'error', 
        text: '获取匹配池列表失败，请重试' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMatch = async () => {
    if (!selectedPool) return;
    
    setIsMatching(true);
    setMessage(null);
    
    try {
      const result = await api.startMatch({ poolId: selectedPool.id });
      setMatchResult(result);
      setMessage({ type: 'success', text: '匹配完成！' });
      
      // 刷新匹配池列表（状态可能已变更）
      await loadPools();
      
    } catch (error) {
      console.error('匹配失败:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '匹配失败，请重试' 
      });
    } finally {
      setIsMatching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'expired': return '#dc3545';
      case 'matched': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'expired': return '已过期';
      case 'matched': return '已匹配';
      default: return '未知';
    }
  };

  if (matchResult) {
    return (
      <div className="match-container">
        <div className="match-result">
          <h2>🎉 匹配完成！</h2>
          <div className="result-header">
            <h3>{matchResult.poolName}</h3>
            <p>总参与人数: {matchResult.totalUsers}</p>
            <p>匹配时间: {matchResult.timestamp}</p>
          </div>
          
          <div className="pairs-list">
            {matchResult.pairs.map((pair: any) => (
              <div key={pair.pair} className="pair-card">
                <div className="pair-header">
                  <h4>配对 {pair.pair}</h4>
                </div>
                <div className="pair-content">
                  <div className="user-info">
                    <h5>{pair.user1}</h5>
                    <div className="user-data">
                      <p>CN: {pair.user1Data.cn}</p>
                      <p>文件: {pair.user1Data.filename}</p>
                    </div>
                  </div>
                  
                  {pair.user2 ? (
                    <>
                      <div className="pair-arrow">↔️</div>
                      <div className="user-info">
                        <h5>{pair.user2}</h5>
                        <div className="user-data">
                          <p>CN: {pair.user2Data.cn}</p>
                          <p>文件: {pair.user2Data.filename}</p>
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
          
          <div className="result-actions">
            <button 
              className="primary-btn"
              onClick={() => {
                setMatchResult(null);
                setSelectedPool(null);
              }}
            >
              重新选择匹配池
            </button>
            <button 
              className="secondary-btn"
              onClick={() => {
                // 这里可以实现导出功能
                console.log('导出匹配结果', matchResult);
              }}
            >
              导出结果
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
                <span 
                  className="pool-status"
                  style={{ backgroundColor: getStatusColor(pool.status) }}
                >
                  {getStatusText(pool.status)}
                </span>
              </div>
              <p className="pool-description">{pool.description}</p>
              <div className="pool-meta">
                <div className="meta-item">
                  <span className="meta-label">参与人数:</span>
                  <span className="meta-value">{pool.userCount}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">截止时间:</span>
                  <span className="meta-value">
                    {new Date(pool.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedPool && (
        <div className="match-section">
          <div className="selected-pool-info">
            <h3>已选择匹配池: {selectedPool.name}</h3>
            <p>参与人数: {selectedPool.userCount} 人</p>
            <p>
              {selectedPool.userCount % 2 === 1 
                ? `将产生 ${Math.floor(selectedPool.userCount / 2)} 对匹配，1 人轮空`
                : `将产生 ${selectedPool.userCount / 2} 对匹配`
              }
            </p>
          </div>
          
          <button 
            className="match-btn"
            onClick={handleStartMatch}
            disabled={isMatching}
          >
            {isMatching ? (
              <>
                <div className="loading-spinner"></div>
                匹配中...
              </>
            ) : (
              '🎯 开始匹配'
            )}
          </button>
        </div>
      )}
      
      {isMatching && (
        <div className="matching-process">
          <h4>正在进行匹配...</h4>
          <p>🎲 生成随机数字中</p>
          <p>🔄 执行不放回匹配算法</p>
          <p>💾 保存匹配记录到数据库</p>
        </div>
      )}
    </div>
  );
};

export default Match;
