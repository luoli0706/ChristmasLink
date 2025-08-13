import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import '../styles/History.css';

interface MatchRecord {
  id: number;
  pool_name: string;
  match_date: string;
  total_users: number;
  pairs_count: number;
  has_lone_user: boolean;
  status: 'completed' | 'in_progress';
}

interface MatchPair {
  pair_number: number;
  user1_name: string;
  user2_name?: string;
  user1_cn: string;
  user2_cn?: string;
  user1_filename: string;
  user2_filename?: string;
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
        
        // 检查响应格式并提取data字段
        let historyData = jsonData;
        if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
          historyData = jsonData.data;
        }
        
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
        
        // 检查响应格式并提取data字段
        let detailsData = jsonData;
        if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
          detailsData = jsonData.data;
        }
        
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
      poolName: record.pool_name,
      matchDate: record.match_date,
      totalUsers: record.total_users,
      pairs: matchDetails?.pairs || []
    };
    
    // 导出为JSON文件
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `match_record_${record.id}_${record.pool_name}.json`;
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
          <h2>{selectedRecord.pool_name} - 匹配详情</h2>
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
              <span className="info-value">{new Date(selectedRecord.match_date).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">参与人数:</span>
              <span className="info-value">{selectedRecord.total_users}</span>
            </div>
            <div className="info-item">
              <span className="info-label">配对数量:</span>
              <span className="info-value">{selectedRecord.pairs_count}</span>
            </div>
            <div className="info-item">
              <span className="info-label">单独用户:</span>
              <span className="info-value">{selectedRecord.has_lone_user ? '有单独' : '无单独'}</span>
            </div>
          </div>
        </div>
        
        <div className="pairs-detail">
          <h3>配对详情</h3>
          {matchDetails ? (
            <div className="pairs-list">
              {matchDetails.pairs.map((pair) => (
                <div key={pair.pair_number} className="pair-detail-card">
                  <div className="pair-header">
                    <h4>配对 {pair.pair_number}</h4>
                  </div>
                  <div className="pair-content">
                    <div className="user-detail">
                      <h5>{pair.user1_name}</h5>
                      <div className="user-data">
                        <p><strong>姓名:</strong> {pair.user1_cn}</p>
                        <p><strong>文件:</strong> {pair.user1_filename}</p>
                      </div>
                    </div>
                    
                    {pair.user2_name && (
                      <>
                        <div className="pair-connector">💝</div>
                        <div className="user-detail">
                          <h5>{pair.user2_name}</h5>
                          <div className="user-data">
                            <p><strong>姓名:</strong> {pair.user2_cn}</p>
                            <p><strong>文件:</strong> {pair.user2_filename}</p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {!pair.user2_name && (
                      <div className="lone-user">
                        <div className="lone-user-indicator">🎄</div>
                        <p>单独用户</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                <h3>{record.pool_name}</h3>
                <span className={`status-badge ${record.status}`}>
                  {record.status === 'completed' ? '已完成' : '进行中'}
                </span>
              </div>
              
              <div className="record-info">
                <div className="record-meta">
                  <span className="meta-item">
                    <span className="meta-icon">👥</span>
                    {record.total_users} 人参与
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">💝</span>
                    {record.pairs_count} 组配对
                  </span>
                  {record.has_lone_user && (
                    <span className="meta-item lone">
                      <span className="meta-icon">🎄</span>
                      有单独用户
                    </span>
                  )}
                </div>
                
                <div className="record-date">
                  <span className="date-icon">📅</span>
                  {new Date(record.match_date).toLocaleString()}
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
