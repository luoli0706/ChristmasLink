import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Header.css';

interface HeaderProps {
  onNavigate?: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();

  const handleHomeClick = () => {
    if (onNavigate) {
      onNavigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleHomeClick}>
          <span className="logo-icon">🎄</span>
          <span className="logo-text">圣诞链接</span>
        </div>
        
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
