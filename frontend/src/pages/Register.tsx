import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import '../styles/Register.css';

interface PoolField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'url';
  required: boolean;
}

interface MatchPool {
  id: number;
  name: string;
  description: string;
  userCount: number;
  validUntil: string;
  status: 'active' | 'expired' | 'matched';
  fields: PoolField[];
}

interface RegisterProps {
  onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [entryType, setEntryType] = useState<'pool' | 'user' | null>(null);

  if (entryType === null) {
    return (
      <div className="register-container">
        <h2>选择操作类型</h2>
        <div className="entry-selection">
          <div className="entry-card" onClick={() => setEntryType('pool')}>
            <div className="entry-icon">🏊‍♀️</div>
            <h3>创建匹配池</h3>
            <p>设置新的匹配池，定义匹配规则和要求</p>
          </div>
          
          <div className="entry-card" onClick={() => setEntryType('user')}>
            <div className="entry-icon">👤</div>
            <h3>加入匹配池</h3>
            <p>选择现有匹配池并填写个人信息</p>
          </div>
        </div>
        
        <button 
          className="back-btn"
          onClick={() => window.history.back()}
        >
          返回
        </button>
      </div>
    );
  }

  if (entryType === 'pool') {
    return <CreatePoolForm onBack={() => setEntryType(null)} />;
  }

  return <JoinPoolForm onBack={() => setEntryType(null)} />;
};

// 创建匹配池表单组件
const CreatePoolForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [poolForm, setPoolForm] = useState({
    name: '',
    validUntil: '',
    description: '',
    fields: [] as PoolField[]
  });
  
  const [newField, setNewField] = useState<PoolField>({
    name: '',
    label: '',
    type: 'text' as const,
    required: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const addField = () => {
    if (!newField.name.trim() || !newField.label.trim()) {
      setMessage({ type: 'error', text: '字段名称和标签不能为空' });
      return;
    }

    if (poolForm.fields.some(field => field.name === newField.name)) {
      setMessage({ type: 'error', text: '字段名称不能重复' });
      return;
    }

    setPoolForm(prev => ({
      ...prev,
      fields: [...prev.fields, { ...newField }]
    }));

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false
    });

    setMessage(null);
  };

  const removeField = (index: number) => {
    setPoolForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poolForm.name.trim()) {
      setMessage({ type: 'error', text: '匹配池名称不能为空' });
      return;
    }
    
    if (!poolForm.validUntil) {
      setMessage({ type: 'error', text: '请选择截止时间' });
      return;
    }
    
    if (poolForm.fields.length === 0) {
      setMessage({ type: 'error', text: '至少需要添加一个字段' });
      return;
    }

    const validUntilDate = new Date(poolForm.validUntil);
    if (validUntilDate <= new Date()) {
      setMessage({ type: 'error', text: '截止时间必须在未来' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await api.createPool(poolForm);
      setMessage({ type: 'success', text: `匹配池 "${poolForm.name}" 创建成功！` });
      
      // 重置表单
      setPoolForm({
        name: '',
        validUntil: '',
        description: '',
        fields: []
      });
      
    } catch (error) {
      console.error('创建匹配池失败:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '创建匹配池失败，请重试' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>创建匹配池</h2>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <h3>基本信息</h3>
            
            <div className="form-group">
              <label htmlFor="name">匹配池名称 *</label>
              <input
                type="text"
                id="name"
                value={poolForm.name}
                onChange={(e) => setPoolForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入匹配池名称"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">描述</label>
              <textarea
                id="description"
                value={poolForm.description}
                onChange={(e) => setPoolForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入匹配池描述（可选）"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="validUntil">截止时间 *</label>
              <input
                type="datetime-local"
                id="validUntil"
                value={poolForm.validUntil}
                onChange={(e) => setPoolForm(prev => ({ ...prev, validUntil: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>字段配置</h3>
            
            <div className="field-form">
              <div className="field-form-row">
                <div className="form-group">
                  <label>字段名称</label>
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="如: name, email"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>显示标签</label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="如: 姓名, 邮箱"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>字段类型</label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField(prev => ({ 
                      ...prev, 
                      type: e.target.value as PoolField['type'] 
                    }))}
                    disabled={isSubmitting}
                  >
                    <option value="text">文本</option>
                    <option value="textarea">多行文本</option>
                    <option value="number">数字</option>
                    <option value="email">邮箱</option>
                    <option value="url">链接</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                      disabled={isSubmitting}
                    />
                    必填
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addField}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  添加字段
                </button>
              </div>
            </div>

            {poolForm.fields.length > 0 && (
              <div className="fields-list">
                <h4>已添加的字段</h4>
                {poolForm.fields.map((field, index) => (
                  <div key={index} className="field-item">
                    <div className="field-info">
                      <span className="field-name">{field.name}</span>
                      <span className="field-label">({field.label})</span>
                      <span className="field-type">[{field.type}]</span>
                      {field.required && <span className="field-required">*必填</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="btn btn-danger btn-sm"
                      disabled={isSubmitting}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              返回
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '创建中...' : '创建匹配池'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 加入匹配池表单组件
const JoinPoolForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pools, setPools] = useState<MatchPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<MatchPool | null>(null);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [contactInfo, setContactInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPools();
      const activePools = response.filter((pool: MatchPool) => pool.status === 'active');
      setPools(activePools);
    } catch (error) {
      console.error('获取匹配池列表失败:', error);
      setMessage({ 
        type: 'error', 
        text: '获取匹配池列表失败，请重试' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePoolSelect = async (pool: MatchPool) => {
    try {
      const poolDetail = await api.getPoolById(pool.id.toString());
      setSelectedPool(poolDetail);
      setUserData({});
    } catch (error) {
      console.error('获取匹配池详情失败:', error);
      setMessage({ 
        type: 'error', 
        text: '获取匹配池详情失败，请重试' 
      });
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setUserData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPool) return;
    
    // 验证必填字段
    for (const field of selectedPool.fields) {
      if (field.required && !userData[field.name]) {
        setMessage({ type: 'error', text: `${field.label} 是必填字段` });
        return;
      }
    }
    
    if (!contactInfo.trim()) {
      setMessage({ type: 'error', text: '联系信息不能为空' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await api.joinPool({
        poolId: selectedPool.id,
        userData,
        contactInfo
      });
      
      setMessage({ type: 'success', text: `成功加入匹配池 "${selectedPool.name}"！` });
      
      // 重置表单
      setSelectedPool(null);
      setUserData({});
      setContactInfo('');
      
    } catch (error) {
      console.error('加入匹配池失败:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '加入匹配池失败，请重试' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="register-container">
        <div className="loading">加载匹配池列表中...</div>
      </div>
    );
  }

  if (!selectedPool) {
    return (
      <div className="register-container">
        <div className="register-card">
          <h2>选择匹配池</h2>
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          {pools.length === 0 ? (
            <div className="empty-state">
              <p>当前没有可用的匹配池</p>
              <button onClick={loadPools} className="btn btn-primary">
                刷新
              </button>
            </div>
          ) : (
            <div className="pools-list">
              {pools.map(pool => (
                <div
                  key={pool.id}
                  className="pool-card"
                  onClick={() => handlePoolSelect(pool)}
                >
                  <h3>{pool.name}</h3>
                  <p>{pool.description}</p>
                  <div className="pool-meta">
                    <span>👥 {pool.userCount} 人已加入</span>
                    <span>⏰ {new Date(pool.validUntil).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button onClick={onBack} className="btn btn-secondary">
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>加入匹配池: {selectedPool.name}</h2>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <h3>填写信息</h3>
            
            {selectedPool.fields.map(field => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name}>
                  {field.label} {field.required && '*'}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    value={userData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    value={userData[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            ))}
            
            <div className="form-group">
              <label htmlFor="contactInfo">联系信息 *</label>
              <input
                type="text"
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="用于移除时查找，如邮箱或手机号"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setSelectedPool(null)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              返回选择
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '加入中...' : '加入匹配池'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
