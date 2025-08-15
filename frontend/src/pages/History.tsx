import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useRouter } from '../components/Router';
import '../styles/History.css';

interface MatchRecord {
  id: number;
  poolName: string;
  matchDate: string;
  totalUsers: number;
  pairsCount: number;
  hasLoneUser: boolean;
  status: 'completed' | 'in_progress';
}

interface MatchPair {
  pair: number;
  user1: string;
  user2?: string;
  user1Data: { [key: string]: any };
  user2Data?: { [key: string]: any };
}

interface MatchDetails {
  pairs: MatchPair[];
}

interface HistoryProps {
  onNavigate?: (page: string) => void;
  onGoBack?: () => void;
}

const History: React.FC<HistoryProps> = () => {
  const [selectedRecord, setSelectedRecord] = useState<MatchRecord | null>(null);
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { navigate } = useRouter();

  // 解析时间字符串的辅助函数
  const parseDateTime = (dateTimeStr: string): Date => {
    // 后端返回格式: "2006-01-02 15:04:05"
    // 需要转换为ISO格式: "2006-01-02T15:04:05"
    const isoString = dateTimeStr.replace(' ', 'T');
    return new Date(isoString);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (response.ok) {
        const jsonData = await response.json();
        
        // 调试：打印原始响应
        console.log('历史记录原始响应:', jsonData);
        
        // 检查响应格式并提取data字段
        let historyData = jsonData;
        if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
          historyData = jsonData.data;
        }
        
        console.log('处理后的历史数据:', historyData);
        setRecords(historyData || []);
      } else {
        setError('获取历史记录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取历史记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async (recordId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${recordId}`);
      if (response.ok) {
        const jsonData = await response.json();
        
        // 调试：打印匹配详情响应
        console.log('匹配详情原始响应:', jsonData);
        
        // 检查响应格式并提取data字段
        let detailsData = jsonData;
        if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
          detailsData = jsonData.data;
        }
        
        console.log('处理后的详情数据:', detailsData);
        setMatchDetails(detailsData || { pairs: [] });
      } else {
        console.error('获取详情失败');
        setMatchDetails({ pairs: [] });
      }
    } catch (err) {
      console.error('获取匹配详情失败:', err);
      setMatchDetails({ pairs: [] });
    }
  };

  const handleRecordClick = async (record: MatchRecord) => {
    setSelectedRecord(record);
    await fetchMatchDetails(record.id);
  };

  const exportRecord = (record: MatchRecord) => {
    const exportData = {
      poolName: record.poolName,
      matchDate: record.matchDate,
      totalUsers: record.totalUsers,
      pairs: matchDetails?.pairs || []
    };
    
    // 导出为JSON文件
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `match_record_${record.id}_${record.poolName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>加载中...</h3>
          <p>正在获取历史记录</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-state">
          <div className="error-icon"></div>
          <h3>加载失败</h3>
          <p>{error}</p>
          <button onClick={fetchHistory} className="retry-btn">重试</button>
        </div>
      </div>
    );
  }

  if (selectedRecord) {
    return (
      <div className="history-container">
        <div className="detail-header">
          <button 
            className="back-btn"
            onClick={() => {
              setSelectedRecord(null);
              setMatchDetails(null);
            }}
          >
            ← 返回列表
          </button>
          <h2>{selectedRecord.poolName} - 匹配详情</h2>
          <button 
            className="export-btn"
            onClick={() => exportRecord(selectedRecord)}
          >
            📄 导出记录
          </button>
        </div>
        
        <div className="detail-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">匹配时间:</span>
              <span className="info-value">{parseDateTime(selectedRecord.matchDate).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">参与人数:</span>
              <span className="info-value">{selectedRecord.totalUsers}</span>
            </div>
            <div className="info-item">
              <span className="info-label">配对数量:</span>
              <span className="info-value">{selectedRecord.pairsCount}</span>
            </div>
            <div className="info-item">
              <span className="info-label">单独用户:</span>
              <span className="info-value">{selectedRecord.hasLoneUser ? '有单独' : '无单独'}</span>
            </div>
          </div>
        </div>
        
        <div className="pairs-detail">
          <h3>配对详情</h3>
          <div className="privacy-notice">
            <p>🎁 以cn为主视角显示匹配结果，对方身份信息已匿名化</p>
            <button 
              onClick={() => navigate('/admin-login')} 
              className="admin-link"
            >
              管理员登录
            </button>
          </div>
          {matchDetails ? (
            <div className="pairs-list">
              {matchDetails.pairs.map((pair) => {
                // 为每个用户创建一个视角
                const createUserView = (userName: string, userData: any, partnerName: string | undefined, partnerData: any) => {
                  if (!userData || !userData.cn) return null;
                  
                  return (
                    <div key={`${userName}-view`} className="user-view-card">
                      <div className="user-view-header">
                        <h5>👤 {userData.cn} 的匹配结果</h5>
                      </div>
                      <div className="match-info">
                        {partnerName && partnerData ? (
                          <div className="partner-info">
                            <h6>🎯 匹配对象信息：</h6>
                            <div className="partner-data">
                              {Object.entries(partnerData).map(([key, value]) => {
                                // 隐藏对方的cn字段，显示其他所有信息
                                if (key === 'cn') {
                                  return (
                                    <p key={key} className="hidden-field">
                                      <strong>{key}:</strong> ***（已隐藏）
                                    </p>
                                  );
                                }
                                return (
                                  <p key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </p>
                                );
                              })}
                            </div>
                            <div className="surprise-hint">
                              <small>🎄 对方姓名已隐藏以保持惊喜</small>
                            </div>
                          </div>
                        ) : (
                          <div className="no-match">
                            <p>🎄 单独用户，未匹配到对象</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };

                // 生成每个用户的视角
                const views = [];
                
                // 用户1的视角
                if (pair.user1Data?.cn) {
                  views.push(createUserView(
                    pair.user1, 
                    pair.user1Data, 
                    pair.user2, 
                    pair.user2Data
                  ));
                }
                
                // 用户2的视角（如果存在）
                if (pair.user2 && pair.user2Data?.cn) {
                  views.push(createUserView(
                    pair.user2, 
                    pair.user2Data, 
                    pair.user1, 
                    pair.user1Data
                  ));
                }

                return (
                  <div key={pair.pair} className="pair-detail-card anonymous">
                    <div className="pair-header">
                      <h4>配对 {pair.pair}</h4>
                    </div>
                    <div className="user-views">
                      {views}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="loading-pairs">
              <div className="loading-spinner small"></div>
              <p>正在加载配对详情...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📚 匹配历史</h2>
        <button onClick={fetchHistory} className="refresh-btn">
          🔄 刷新
        </button>
      </div>
      
      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>暂无匹配记录</h3>
          <p>还没有任何匹配记录，快去创建匹配池吧！</p>
        </div>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div 
              key={record.id} 
              className="record-card"
              onClick={() => handleRecordClick(record)}
            >
              <div className="record-header">
                <h3>{record.poolName}</h3>
                <span className={`status-badge ${record.status}`}>
                  {record.status === 'completed' ? '已完成' : '进行中'}
                </span>
              </div>
              
              <div className="record-info">
                <div className="record-meta">
                  <span className="meta-item">
                    <span className="meta-icon">👥</span>
                    {record.totalUsers} 人参与
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">💝</span>
                    {record.pairsCount} 组配对
                  </span>
                  {record.hasLoneUser && (
                    <span className="meta-item lone">
                      <span className="meta-icon">🎄</span>
                      有单独用户
                    </span>
                  )}
                </div>
                
                <div className="record-date">
                  <span className="date-icon">📅</span>
                  {parseDateTime(record.matchDate).toLocaleString()}
                </div>
              </div>
              
              <div className="record-actions">
                <span className="view-details">查看详情 →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
