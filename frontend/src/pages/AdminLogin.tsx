import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useRouter } from '../components/Router';
import '../styles/Register.css'; // 重用注册页面样式

interface AdminLoginProps {
  onNavigate?: (page: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAdmin();
  const { navigate } = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('请输入管理员密码');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await login(password);
      if (success) {
        // 登录成功，跳转到管理员历史记录页面
        navigate('/admin-history');
      } else {
        setError('密码错误，请重试');
      }
    } catch (error) {
      setError('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>管理员登录</h2>
          <p>请输入管理员密码以访问完整数据</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="password">管理员密码:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理员密码"
              disabled={loading}
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="submit-button"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="register-footer">
          <button 
            type="button"
            onClick={() => navigate('/history')}
            className="secondary-button"
          >
            返回普通历史记录
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
