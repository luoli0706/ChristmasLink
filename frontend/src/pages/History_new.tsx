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

interface UserHistoryResult {
  name: string;
  cn: string;
  data: Record<string, any>;
  partnerId?: string;
  partnerData?: Record<string, any>;
  isAlone?: boolean;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { navigate } = useRouter();

  // 将配对结果转换为单人显示的数据结构
  const processHistoryResults = (matchDetails: MatchDetails): UserHistoryResult[] => {
    const users: UserHistoryResult[] = [];

    matchDetails.pairs.forEach(pair => {
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
        console.error('获取匹配详情失败');
      }
    } catch (err) {
      console.error('获取匹配详情失败:', err);
    }
  };

  const handleRecordClick = async (record: MatchRecord) => {
    setSelectedRecord(record);
    setCurrentPage(1); // 重置到第一页
    await fetchMatchDetails(record.id);
  };

  const exportRecord = (record: MatchRecord) => {
    const exportData = {
      poolName: record.poolName,
      matchDate: record.matchDate,
      totalUsers: record.totalUsers,
      pairsCount: record.pairsCount,
      hasLoneUser: record.hasLoneUser,
      matchDetails: matchDetails
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `match_record_${record.poolName}_${record.matchDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>正在加载历史记录...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
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
        <div className="history-detail">
          <div className="detail-header">
            <button 
              className="back-btn"
              onClick={() => {
                setSelectedRecord(null);
                setMatchDetails(null);
                setCurrentPage(1);
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
            <h3>匹配详情</h3>
            <div className="privacy-notice">
              <p>🎭 以你的视角显示匹配结果，对方姓名已隐藏以保持匿名性</p>
              <button 
                onClick={() => navigate('/admin-login')} 
                className="admin-link"
              >
                管理员登录
              </button>
            </div>
            {matchDetails ? (
              (() => {
                const processedUsers = processHistoryResults(matchDetails);
                const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentUsers = processedUsers.slice(startIndex, endIndex);

                return (
                  <div className="users-history-result">
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
                                      <small>🎭 对方姓名已隐藏以保持匿名性</small>
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
                );
              })()
            ) : (
              <div className="loading-pairs">
                <div className="loading-spinner small"></div>
                <p>正在加载配对详情...</p>
              </div>
            )}
          </div>
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
          <h3>暂无历史记录</h3>
          <p>还没有进行过匹配，快去创建匹配池开始匹配吧！</p>
        </div>
      ) : (
        <div className="records-list">
          <div className="records-grid">
            {records.map(record => (
              <div 
                key={record.id} 
                className="record-card"
                onClick={() => handleRecordClick(record)}
              >
                <div className="record-header">
                  <h3>{record.poolName}</h3>
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
        </div>
      )}
    </div>
  );
};

export default History;
