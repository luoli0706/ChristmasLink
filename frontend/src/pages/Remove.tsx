import React, { useState } from 'react';
import '../styles/Remove.css';

const Remove: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleSearch = async () => {
    if (!identifier.trim()) return;
    
    // 模拟查找用户
    setTimeout(() => {
      setUserInfo({
        name: '用户示例',
        email: identifier,
        registeredDate: '2024-12-01',
        status: 'active'
      });
    }, 500);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    
    // 模拟移除过程
    setTimeout(() => {
      setIsRemoved(true);
      setIsRemoving(false);
    }, 1500);
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
            <label>请输入注册时使用的邮箱或联系方式:</label>
            <div className="search-input-group">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="邮箱、微信号或QQ号"
              />
              <button 
                className="search-btn"
                onClick={handleSearch}
                disabled={!identifier.trim()}
              >
                查找
              </button>
            </div>
          </div>
        </div>

        {userInfo && (
          <div className="user-info-section">
            <h3>找到以下用户信息:</h3>
            <div className="user-card">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <h4>{userInfo.name}</h4>
                <p>联系方式: {userInfo.email}</p>
                <p>注册时间: {userInfo.registeredDate}</p>
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
                    onClick={() => setUserInfo(null)}
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
