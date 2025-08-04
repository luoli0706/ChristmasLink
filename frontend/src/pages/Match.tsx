import React, { useState } from 'react';
import '../styles/Match.css';

interface MatchPool {
  id: number;
  name: string;
  description: string;
  userCount: number;
  validUntil: string;
  status: 'active' | 'expired' | 'matched';
}

const Match: React.FC = () => {
  const [selectedPool, setSelectedPool] = useState<MatchPool | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // 模拟匹配池列表
  const mockPools: MatchPool[] = [
    {
      id: 1,
      name: '圣诞音乐分享',
      description: '分享你最喜欢的圣诞音乐',
      userCount: 12,
      validUntil: '2024-12-25T23:59',
      status: 'active'
    },
    {
      id: 2,
      name: '圣诞祝福卡片',
      description: '交换圣诞祝福卡片',
      userCount: 8,
      validUntil: '2024-12-24T18:00',
      status: 'active'
    },
    {
      id: 3,
      name: '圣诞礼物交换',
      description: '秘密圣诞老人礼物交换',
      userCount: 15,
      validUntil: '2024-12-20T00:00',
      status: 'expired'
    }
  ];

  const handleStartMatch = async () => {
    if (!selectedPool) return;
    
    setIsMatching(true);
    
    // 模拟匹配过程
    setTimeout(() => {
      // 模拟匹配结果
      const pairs = [];
      const userCount = selectedPool.userCount;
      const isOdd = userCount % 2 === 1;
      
      for (let i = 0; i < Math.floor(userCount / 2); i++) {
        pairs.push({
          pair: i + 1,
          user1: `用户${i * 2 + 1}`,
          user2: `用户${i * 2 + 2}`,
          user1Data: { cn: `CN${i * 2 + 1}`, filename: `file${i * 2 + 1}.mp3` },
          user2Data: { cn: `CN${i * 2 + 2}`, filename: `file${i * 2 + 2}.mp3` }
        });
      }
      
      if (isOdd) {
        pairs.push({
          pair: pairs.length + 1,
          user1: `用户${userCount}`,
          user2: null,
          user1Data: { cn: `CN${userCount}`, filename: `file${userCount}.mp3` },
          user2Data: null
        });
      }
      
      setMatchResult({
        poolName: selectedPool.name,
        totalUsers: userCount,
        pairs: pairs,
        timestamp: new Date().toLocaleString()
      });
      setIsMatching(false);
    }, 3000);
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
          {mockPools.map(pool => (
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
