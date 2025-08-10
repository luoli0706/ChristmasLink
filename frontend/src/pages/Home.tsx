import React from 'react';
import '../styles/Home.css';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🎄 圣诞链接</h1>
        <p className="hero-subtitle">你将在此链接他人并与他人链接</p>
      </div>

      <div className="action-cards">
        <div className="action-card" onClick={() => onNavigate('/match')}>
          <div className="card-icon">🎯</div>
          <h3>开始匹配</h3>
          <p>选择匹配池并开始智能匹配</p>
        </div>

        <div className="action-card" onClick={() => onNavigate('/register')}>
          <div className="card-icon">📝</div>
          <h3>创建/加入匹配池</h3>
          <p>创建新匹配池或加入现有匹配池</p>
        </div>

        <div className="action-card" onClick={() => onNavigate('/history')}>
          <div className="card-icon">📜</div>
          <h3>历史匹配记录</h3>
          <p>查看过往的匹配池匹配记录</p>
        </div>

        <div className="action-card" onClick={() => onNavigate('/remove')}>
          <div className="card-icon">🗑️</div>
          <h3>移除用户</h3>
          <p>从匹配池中移除用户资料</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
