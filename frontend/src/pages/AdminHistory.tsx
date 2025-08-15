import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
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

const AdminHistory: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<MatchRecord | null>(null);
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, adminToken, logout } = useAdmin();
  const { navigate } = useRouter();

  // 如果不是管理员，跳转到登录页面
  useEffect(() => {
    if (!isAdmin || !adminToken) {
      navigate('/admin-login');
      return;
    }
  }, [isAdmin, adminToken, navigate]);

  // 解析时间字符串的辅助函数
  const parseDateTime = (dateTimeStr: string): Date => {
    const isoString = dateTimeStr.replace(' ', 'T');
    return new Date(isoString);
  };

  useEffect(() => {
    if (isAdmin && adminToken) {
      fetchAdminHistory();
    }
  }, [isAdmin, adminToken]);

  const fetchAdminHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7776'}/api/admin/history`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
      } else {
        setError(data.message || '获取管理员历史记录失败');
      }
    } catch (error) {
      console.error('获取管理员历史记录错误:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async (recordId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7776'}/api/history/${recordId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success && data.data) {
        setMatchDetails(data.data);
      } else {
        setError(data.message || '获取匹配详情失败');
      }
    } catch (error) {
      console.error('获取匹配详情错误:', error);
      setError('获取匹配详情失败');
    }
  };

  const handleRecordClick = async (record: MatchRecord) => {
    setSelectedRecord(record);
    setMatchDetails(null);
    await fetchMatchDetails(record.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  if (!isAdmin || !adminToken) {
    return null; // 等待重定向
  }

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>管理员历史记录</h2>
        <div className="admin-controls">
          <span className="admin-badge">管理员模式</span>
          <button onClick={handleLogout} className="logout-button">
            退出管理员
          </button>
          <button 
            onClick={() => navigate('/history')} 
            className="secondary-button"
          >
            查看普通模式
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="history-content">
        <div className="history-list">
          <h3>匹配记录列表 ({records.length} 条)</h3>
          
          {records.length === 0 ? (
            <div className="empty-state">
              <p>暂无历史记录</p>
            </div>
          ) : (
            <div className="records-grid">
              {records.map((record) => (
                <div
                  key={record.id}
                  className={`record-card ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                  onClick={() => handleRecordClick(record)}
                >
                  <div className="record-header">
                    <h4>{record.poolName}</h4>
                    <span className="record-date">
                      {parseDateTime(record.matchDate).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="record-stats">
                    <span>总用户: {record.totalUsers}</span>
                    <span>配对数: {record.pairsCount}</span>
                    {record.hasLoneUser && <span className="lone-user">有单独用户</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedRecord && (
          <div className="history-details">
            <div className="details-header">
              <h3>{selectedRecord.poolName} - 匹配详情</h3>
              <span className="admin-notice">（管理员完整视图）</span>
            </div>

            {matchDetails ? (
              <div className="match-results">
                <h4>匹配结果</h4>
                {matchDetails.pairs.map((pair, index) => (
                  <div key={index} className="pair-card admin-pair">
                    <div className="pair-header">
                      <h5>配对 {pair.pair}</h5>
                    </div>
                    <div className="pair-users">
                      <div className="user-info">
                        <h6>用户1: {pair.user1}</h6>
                        <div className="user-data">
                          {Object.entries(pair.user1Data).map(([key, value]) => (
                            <div key={key} className="data-item">
                              <span className="data-key">{key}:</span>
                              <span className="data-value">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {pair.user2 && pair.user2Data && (
                        <div className="user-info">
                          <h6>用户2: {pair.user2}</h6>
                          <div className="user-data">
                            {Object.entries(pair.user2Data).map(([key, value]) => (
                              <div key={key} className="data-item">
                                <span className="data-key">{key}:</span>
                                <span className="data-value">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="loading">加载匹配详情中...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistory;
