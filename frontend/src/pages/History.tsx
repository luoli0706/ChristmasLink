import React, { useState } from 'react';
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

const History: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<MatchRecord | null>(null);

  // 模拟历史匹配记录
  const mockRecords: MatchRecord[] = [
    {
      id: 1,
      poolName: '圣诞音乐分享',
      matchDate: '2024-12-20T15:30:00',
      totalUsers: 12,
      pairsCount: 6,
      hasLoneUser: false,
      status: 'completed'
    },
    {
      id: 2,
      poolName: '圣诞祝福卡片',
      matchDate: '2024-12-19T09:15:00',
      totalUsers: 7,
      pairsCount: 3,
      hasLoneUser: true,
      status: 'completed'
    },
    {
      id: 3,
      poolName: '圣诞礼物交换',
      matchDate: '2024-12-18T14:45:00',
      totalUsers: 10,
      pairsCount: 5,
      hasLoneUser: false,
      status: 'completed'
    }
  ];

  // 模拟详细匹配结果
  const getMatchDetails = (recordId: number) => {
    // 这里应该从后端获取详细数据
    const mockDetails = {
      1: {
        pairs: [
          { pair: 1, user1: '小明', user2: '小红', user1Data: { cn: 'Ming', filename: 'jingle_bells.mp3' }, user2Data: { cn: 'Hong', filename: 'silent_night.mp3' } },
          { pair: 2, user1: '小李', user2: '小王', user1Data: { cn: 'Li', filename: 'christmas_tree.mp3' }, user2Data: { cn: 'Wang', filename: 'santa_claus.mp3' } },
          { pair: 3, user1: '小张', user2: '小刘', user1Data: { cn: 'Zhang', filename: 'joy_to_world.mp3' }, user2Data: { cn: 'Liu', filename: 'deck_the_halls.mp3' } },
          { pair: 4, user1: '小陈', user2: '小赵', user1Data: { cn: 'Chen', filename: 'white_christmas.mp3' }, user2Data: { cn: 'Zhao', filename: 'rudolf.mp3' } },
          { pair: 5, user1: '小孙', user2: '小周', user1Data: { cn: 'Sun', filename: 'let_it_snow.mp3' }, user2Data: { cn: 'Zhou', filename: 'winter_wonderland.mp3' } },
          { pair: 6, user1: '小吴', user2: '小郑', user1Data: { cn: 'Wu', filename: 'frosty.mp3' }, user2Data: { cn: 'Zheng', filename: 'carol_bells.mp3' } }
        ]
      },
      2: {
        pairs: [
          { pair: 1, user1: '用户A', user2: '用户B', user1Data: { cn: 'UserA', filename: 'card1.jpg' }, user2Data: { cn: 'UserB', filename: 'card2.jpg' } },
          { pair: 2, user1: '用户C', user2: '用户D', user1Data: { cn: 'UserC', filename: 'card3.jpg' }, user2Data: { cn: 'UserD', filename: 'card4.jpg' } },
          { pair: 3, user1: '用户E', user2: '用户F', user1Data: { cn: 'UserE', filename: 'card5.jpg' }, user2Data: { cn: 'UserF', filename: 'card6.jpg' } },
          { pair: 4, user1: '用户G', user2: null, user1Data: { cn: 'UserG', filename: 'card7.jpg' }, user2Data: null }
        ]
      },
      3: {
        pairs: [
          { pair: 1, user1: '参与者1', user2: '参与者2', user1Data: { cn: 'P1', filename: 'gift1.txt' }, user2Data: { cn: 'P2', filename: 'gift2.txt' } },
          { pair: 2, user1: '参与者3', user2: '参与者4', user1Data: { cn: 'P3', filename: 'gift3.txt' }, user2Data: { cn: 'P4', filename: 'gift4.txt' } },
          { pair: 3, user1: '参与者5', user2: '参与者6', user1Data: { cn: 'P5', filename: 'gift5.txt' }, user2Data: { cn: 'P6', filename: 'gift6.txt' } },
          { pair: 4, user1: '参与者7', user2: '参与者8', user1Data: { cn: 'P7', filename: 'gift7.txt' }, user2Data: { cn: 'P8', filename: 'gift8.txt' } },
          { pair: 5, user1: '参与者9', user2: '参与者10', user1Data: { cn: 'P9', filename: 'gift9.txt' }, user2Data: { cn: 'P10', filename: 'gift10.txt' } }
        ]
      }
    };
    return mockDetails[recordId as keyof typeof mockDetails] || { pairs: [] };
  };

  const handleViewDetails = (record: MatchRecord) => {
    setSelectedRecord(record);
  };

  const exportRecord = (record: MatchRecord) => {
    const details = getMatchDetails(record.id);
    const exportData = {
      poolName: record.poolName,
      matchDate: record.matchDate,
      totalUsers: record.totalUsers,
      pairs: details.pairs
    };
    
    // 创建并下载JSON文件
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `match_record_${record.id}_${record.poolName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (selectedRecord) {
    const details = getMatchDetails(selectedRecord.id);
    
    return (
      <div className="history-container">
        <div className="detail-header">
          <button 
            className="back-btn"
            onClick={() => setSelectedRecord(null)}
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
              <span className="info-value">{new Date(selectedRecord.matchDate).toLocaleString()}</span>
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
              <span className="info-label">轮空情况:</span>
              <span className="info-value">{selectedRecord.hasLoneUser ? '有轮空' : '无轮空'}</span>
            </div>
          </div>
        </div>
        
        <div className="pairs-detail">
          <h3>配对详情</h3>
          <div className="pairs-list">
            {details.pairs.map((pair: any) => (
              <div key={pair.pair} className="pair-detail-card">
                <div className="pair-header">
                  <h4>配对 {pair.pair}</h4>
                </div>
                <div className="pair-content">
                  <div className="user-detail">
                    <h5>{pair.user1}</h5>
                    <div className="user-data">
                      <p><strong>CN:</strong> {pair.user1Data.cn}</p>
                      <p><strong>文件:</strong> {pair.user1Data.filename}</p>
                    </div>
                  </div>
                  
                  {pair.user2 ? (
                    <>
                      <div className="pair-arrow">↔️</div>
                      <div className="user-detail">
                        <h5>{pair.user2}</h5>
                        <div className="user-data">
                          <p><strong>CN:</strong> {pair.user2Data.cn}</p>
                          <p><strong>文件:</strong> {pair.user2Data.filename}</p>
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
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>历史匹配记录</h2>
      
      <div className="records-list">
        {mockRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>暂无匹配记录</h3>
            <p>还没有进行过任何匹配</p>
          </div>
        ) : (
          <div className="records-grid">
            {mockRecords.map(record => (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <h3>{record.poolName}</h3>
                  <span className={`record-status ${record.status}`}>
                    {record.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
                
                <div className="record-info">
                  <div className="info-row">
                    <span className="info-label">匹配时间:</span>
                    <span className="info-value">
                      {new Date(record.matchDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">参与人数:</span>
                    <span className="info-value">{record.totalUsers}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">配对数量:</span>
                    <span className="info-value">
                      {record.pairsCount} {record.hasLoneUser && '(含轮空)'}
                    </span>
                  </div>
                </div>
                
                <div className="record-actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewDetails(record)}
                  >
                    查看详情
                  </button>
                  <button 
                    className="export-btn"
                    onClick={() => exportRecord(record)}
                  >
                    导出
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
