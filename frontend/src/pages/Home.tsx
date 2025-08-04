import React from 'react';
import { useNavigate } from '../components/SimpleRouter';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">圣诞链接</h1>
        <p className="hero-subtitle">你将在此链接他人并与他人链接</p>
      </div>

      <div className="action-cards">
        <div className="action-card" onClick={() => navigate('/match')}>
          <div className="card-icon">🎯</div>
          <h3>开始匹配</h3>
          <p>选择匹配池并开始智能匹配</p>
        </div>

        <div className="action-card" onClick={() => navigate('/register')}>
          <div className="card-icon">📝</div>
          <h3>注册匹配池</h3>
          <p>创建匹配池或加入现有匹配池</p>
        </div>

        <div className="action-card" onClick={() => navigate('/history')}>
          <div className="card-icon">📜</div>
          <h3>历史匹配记录</h3>
          <p>查看过往的匹配池匹配记录</p>
        </div>

        <div className="action-card" onClick={() => navigate('/remove')}>
          <div className="card-icon">🗑️</div>
          <h3>移除匹配池</h3>
          <p>从匹配池中移除你的资料</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
