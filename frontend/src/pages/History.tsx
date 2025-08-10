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

const History: React.FC = () => {
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
        const data = await response.json();
        setRecords(data);
      } else {
        setError('��ȡ��ʷ��¼ʧ��');
      }
    } catch (err) {
      setError('����������Ժ�����');
      console.error('��ȡ��ʷ��¼ʧ��:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async (recordId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${recordId}/details`);
      if (response.ok) {
        const data = await response.json();
        setMatchDetails(data);
      } else {
        console.error('��ȡ����ʧ��');
        setMatchDetails({ pairs: [] });
      }
    } catch (err) {
      console.error('��ȡƥ������ʧ��:', err);
      setMatchDetails({ pairs: [] });
    }
  };

  const handleViewDetails = async (record: MatchRecord) => {
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
    
    // ����������JSON�ļ�
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
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
          <h3>������...</h3>
          <p>���ڻ�ȡ��ʷ��¼</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-state">
          <div className="error-icon"></div>
          <h3>����ʧ��</h3>
          <p>{error}</p>
          <button onClick={fetchHistory} className="retry-btn">����</button>
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
             �����б�
          </button>
          <h2>{selectedRecord.pool_name} - ƥ������</h2>
          <button 
            className="export-btn"
            onClick={() => exportRecord(selectedRecord)}
          >
             ������¼
          </button>
        </div>
        
        <div className="detail-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">ƥ��ʱ��:</span>
              <span className="info-value">{new Date(selectedRecord.match_date).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">��������:</span>
              <span className="info-value">{selectedRecord.total_users}</span>
            </div>
            <div className="info-item">
              <span className="info-label">�������:</span>
              <span className="info-value">{selectedRecord.pairs_count}</span>
            </div>
            <div className="info-item">
              <span className="info-label">�ֿ����:</span>
              <span className="info-value">{selectedRecord.has_lone_user ? '���ֿ�' : '���ֿ�'}</span>
            </div>
          </div>
        </div>
        
        <div className="pairs-detail">
          <h3>�������</h3>
          {matchDetails ? (
            <div className="pairs-list">
              {matchDetails.pairs.map((pair) => (
                <div key={pair.pair_number} className="pair-detail-card">
                  <div className="pair-header">
                    <h4>��� {pair.pair_number}</h4>
                  </div>
                  <div className="pair-content">
                    <div className="user-detail">
                      <h5>{pair.user1_name}</h5>
                      <div className="user-data">
                        <p><strong>CN:</strong> {pair.user1_cn}</p>
                        <p><strong>�ļ�:</strong> {pair.user1_filename}</p>
                      </div>
                    </div>
                    
                    {pair.user2_name ? (
                      <>
                        <div className="pair-arrow"></div>
                        <div className="user-detail">
                          <h5>{pair.user2_name}</h5>
                          <div className="user-data">
                            <p><strong>CN:</strong> {pair.user2_cn}</p>
                            <p><strong>�ļ�:</strong> {pair.user2_filename}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="user-alone">
                        <span> �ֿ� (����������)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>�������������...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>��ʷƥ���¼</h2>
      
      <div className="records-list">
        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>����ƥ���¼</h3>
            <p>��û�н��й��κ�ƥ��</p>
          </div>
        ) : (
          <div className="records-grid">
            {records.map(record => (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <h3>{record.pool_name}</h3>
                  <span className={`record-status ${record.status}`}>
                    {record.status === 'completed' ? '�����' : '������'}
                  </span>
                </div>
                
                <div className="record-info">
                  <div className="info-row">
                    <span className="info-label">ƥ��ʱ��:</span>
                    <span className="info-value">
                      {new Date(record.match_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">��������:</span>
                    <span className="info-value">{record.total_users}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">�������:</span>
                    <span className="info-value">
                      {record.pairs_count} {record.has_lone_user && '(���ֿ�)'}
                    </span>
                  </div>
                </div>
                
                <div className="record-actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewDetails(record)}
                  >
                    �鿴����
                  </button>
                  <button 
                    className="export-btn"
                    onClick={() => exportRecord(record)}
                  >
                    ����
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
