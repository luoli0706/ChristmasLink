import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import '../styles/Remove.css';

interface User {
  id: number;
  name: string;
  contact_info: string;
  cn: string;
  filename: string;
  pool_id: number;
  pool_name: string;
  created_at: string;
}

interface RemoveProps {
  onNavigate?: (page: string) => void;
  onGoBack?: () => void;
}

const Remove: React.FC<RemoveProps> = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!identifier.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(identifier)}`);
      if (response.ok) {
        const users = await response.json();
        if (users && users.length > 0) {
          setUserInfo(users[0]); // 取第一个匹配的用户
        } else {
          setError('未找到匹配的用户信息');
        }
      } else if (response.status === 404) {
        setError('未找到匹配的用户信息');
      } else {
        setError('查找用户失败，请稍后重试');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('查找用户失败:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemove = async () => {
    if (!userInfo) return;
    
    try {
      setIsRemoving(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userInfo.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIsRemoved(true);
      } else {
        setError('移除失败，请稍后重试');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('移除用户失败:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isRemoved) {
    return (
      <div className="remove-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>移除成功！</h2>
          <p>你已成功从圣诞匹配池中移除</p>
          <p>如果需要重新加入，可以随时注册</p>
          <button 
            className="back-btn"
            onClick={() => {
              setIsRemoved(false);
              setUserInfo(null);
              setIdentifier('');
              setError(null);
              onNavigate?.('/');
            }}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="remove-container">
      <h2>移除匹配池</h2>
      
      <div className="remove-form">
        <div className="warning-box">
          <div className="warning-icon">⚠️</div>
          <div>
            <h3>注意事项</h3>
            <ul>
              <li>移除后将无法继续参与匹配</li>
              <li>已有的匹配记录将被清除</li>
              <li>如需重新参与，需要重新注册</li>
            </ul>
          </div>
        </div>

        <div className="search-section">
          <div className="form-group">
            <label>请输入注册时使用的姓名、邮箱或联系方式:</label>
            <div className="search-input-group">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="姓名、邮箱、微信号或QQ号"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="search-btn"
                onClick={handleSearch}
                disabled={!identifier.trim() || isSearching}
              >
                {isSearching ? '查找中...' : '查找'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <div className="error-icon">❌</div>
              <span>{error}</span>
            </div>
          )}
        </div>

        {userInfo && (
          <div className="user-info-section">
            <h3>找到以下用户信息:</h3>
            <div className="user-card">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <h4>{userInfo.name}</h4>
                <p>联系方式: {userInfo.contact_info}</p>
                <p>CN: {userInfo.cn}</p>
                <p>文件名: {userInfo.filename}</p>
                <p>所在池: {userInfo.pool_name}</p>
                <p>注册时间: {new Date(userInfo.created_at).toLocaleDateString()}</p>
                <p>状态: <span className="status active">活跃</span></p>
              </div>
            </div>

            <div className="confirm-section">
              <div className="confirm-box">
                <h4>确认移除</h4>
                <p>请确认这是你的账户信息，移除操作无法撤销。</p>
                <div className="button-group">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setUserInfo(null);
                      setError(null);
                    }}
                  >
                    取消
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={handleRemove}
                    disabled={isRemoving}
                  >
                    {isRemoving ? '移除中...' : '确认移除'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Remove;
