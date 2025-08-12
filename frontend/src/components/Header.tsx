import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useCurrentPath } from './Router';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const currentPath = useCurrentPath();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleHomeClick}>
          <span className="logo-icon">🎄</span>
          <span className="logo-text">圣诞链接</span>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            🏠 首页
          </button>
          <button 
            className={`nav-item ${currentPath === '/match' ? 'active' : ''}`}
            onClick={() => navigate('/match')}
          >
            🎯 匹配
          </button>
          <button 
            className={`nav-item ${currentPath === '/register' ? 'active' : ''}`}
            onClick={() => navigate('/register')}
          >
            📝 注册
          </button>
          <button 
            className={`nav-item ${currentPath === '/history' ? 'active' : ''}`}
            onClick={() => navigate('/history')}
          >
            📜 历史
          </button>
        </nav>
        
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="切换主题"
          >
            <span className="theme-icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            <span className="theme-text">
              {theme === 'light' ? '深色' : '浅色'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
