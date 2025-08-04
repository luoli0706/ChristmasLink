import React, { useState } from 'react';
import { useNavigate } from '../components/SimpleRouter';
import '../styles/Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [entryType, setEntryType] = useState<'pool' | 'user' | null>(null);

  if (entryType === null) {
    return (
      <div className="register-container">
        <h2>选择注册类型</h2>
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
          onClick={() => navigate('/')}
        >
          返回首页
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
  const navigate = useNavigate();
  const [poolForm, setPoolForm] = useState({
    name: '',
    validUntil: '',
    description: '',
    fields: [
      { name: 'cn', label: 'CN名称', type: 'text', required: true },
      { name: 'filename', label: '文件名', type: 'text', required: true }
    ]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const addField = () => {
    setPoolForm(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', label: '', type: 'text', required: false }]
    }));
  };

  const updateField = (index: number, field: any) => {
    setPoolForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? field : f)
    }));
  };

  const removeField = (index: number) => {
    if (poolForm.fields.length > 2) { // 保留必须的cn和filename字段
      setPoolForm(prev => ({
        ...prev,
        fields: prev.fields.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模拟提交过程
    setTimeout(() => {
      setIsCreated(true);
      setIsSubmitting(false);
    }, 1500);
  };

  if (isCreated) {
    return (
      <div className="register-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>匹配池创建成功！</h2>
          <p>匹配池 "{poolForm.name}" 已成功创建</p>
          <p>用户现在可以加入这个匹配池了</p>
          <div className="button-group">
            <button 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              返回首页
            </button>
            <button 
              className="primary-btn"
              onClick={() => navigate('/register')}
            >
              继续创建
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <h2>创建匹配池</h2>
      <form className="pool-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>基本信息</h3>
          
          <div className="form-group">
            <label>匹配池名称 *</label>
            <input
              type="text"
              value={poolForm.name}
              onChange={(e) => setPoolForm(prev => ({...prev, name: e.target.value}))}
              required
              placeholder="请输入匹配池名称"
            />
          </div>
          
          <div className="form-group">
            <label>有效时间 *</label>
            <input
              type="datetime-local"
              value={poolForm.validUntil}
              onChange={(e) => setPoolForm(prev => ({...prev, validUntil: e.target.value}))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>匹配池描述</label>
            <textarea
              value={poolForm.description}
              onChange={(e) => setPoolForm(prev => ({...prev, description: e.target.value}))}
              placeholder="描述这个匹配池的用途和规则..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>用户字段配置</h3>
          <p className="section-note">定义用户加入匹配池时需要填写的字段</p>
          
          {poolForm.fields.map((field, index) => (
            <div key={index} className="field-config">
              <div className="field-header">
                <h4>字段 {index + 1}</h4>
                {index >= 2 && (
                  <button 
                    type="button" 
                    className="remove-field-btn"
                    onClick={() => removeField(index)}
                  >
                    删除
                  </button>
                )}
              </div>
              
              <div className="field-row">
                <div className="form-group">
                  <label>字段名</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, {...field, name: e.target.value})}
                    placeholder="字段标识符"
                    disabled={index < 2} // cn和filename字段不可修改
                  />
                </div>
                
                <div className="form-group">
                  <label>显示标签</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(index, {...field, label: e.target.value})}
                    placeholder="用户看到的字段名"
                  />
                </div>
                
                <div className="form-group">
                  <label>字段类型</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, {...field, type: e.target.value})}
                  >
                    <option value="text">文本</option>
                    <option value="textarea">多行文本</option>
                    <option value="number">数字</option>
                    <option value="email">邮箱</option>
                    <option value="url">链接</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, {...field, required: e.target.checked})}
                      disabled={index < 2} // cn和filename必须为必填
                    />
                    必填字段
                  </label>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-field-btn"
            onClick={addField}
          >
            + 添加字段
          </button>
        </div>

        <div className="button-group">
          <button type="button" className="back-btn" onClick={onBack}>
            返回
          </button>
          <button 
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !poolForm.name || !poolForm.validUntil}
          >
            {isSubmitting ? '创建中...' : '创建匹配池'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 加入匹配池表单组件
const JoinPoolForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [userForm, setUserForm] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // 模拟匹配池列表
  const mockPools = [
    {
      id: 1,
      name: '圣诞音乐分享',
      description: '分享你最喜欢的圣诞音乐',
      validUntil: '2024-12-25T23:59',
      fields: [
        { name: 'cn', label: 'CN名称', type: 'text', required: true },
        { name: 'filename', label: '音乐文件名', type: 'text', required: true },
        { name: 'bgm', label: 'BGM链接', type: 'url', required: false },
        { name: 'genre', label: '音乐类型', type: 'text', required: true }
      ]
    },
    {
      id: 2,
      name: '圣诞祝福卡片',
      description: '交换圣诞祝福卡片',
      validUntil: '2024-12-24T18:00',
      fields: [
        { name: 'cn', label: 'CN名称', type: 'text', required: true },
        { name: 'filename', label: '卡片文件名', type: 'text', required: true },
        { name: 'message', label: '祝福语', type: 'textarea', required: true }
      ]
    }
  ];

  const handlePoolSelect = (pool: any) => {
    setSelectedPool(pool);
    const initialForm: Record<string, any> = {};
    pool.fields.forEach((field: any) => {
      initialForm[field.name] = '';
    });
    setUserForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模拟提交过程
    setTimeout(() => {
      setIsJoined(true);
      setIsSubmitting(false);
    }, 1500);
  };

  if (isJoined) {
    return (
      <div className="register-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>成功加入匹配池！</h2>
          <p>你已成功加入 "{selectedPool.name}"</p>
          <p>等待管理员开始匹配</p>
          <div className="button-group">
            <button 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              返回首页
            </button>
            <button 
              className="primary-btn"
              onClick={() => navigate('/match')}
            >
              查看匹配
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPool) {
    return (
      <div className="register-container">
        <h2>选择匹配池</h2>
        <div className="pool-list">
          {mockPools.map(pool => (
            <div key={pool.id} className="pool-card" onClick={() => handlePoolSelect(pool)}>
              <h3>{pool.name}</h3>
              <p>{pool.description}</p>
              <div className="pool-meta">
                <span>截止时间: {new Date(pool.validUntil).toLocaleString()}</span>
                <span>字段数: {pool.fields.length}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button className="back-btn" onClick={onBack}>
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="register-container">
      <h2>加入匹配池: {selectedPool.name}</h2>
      <div className="pool-info">
        <p>{selectedPool.description}</p>
        <p>截止时间: {new Date(selectedPool.validUntil).toLocaleString()}</p>
      </div>
      
      <form className="user-form" onSubmit={handleSubmit}>
        {selectedPool.fields.map((field: any) => (
          <div key={field.name} className="form-group">
            <label>
              {field.label} {field.required && '*'}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={userForm[field.name] || ''}
                onChange={(e) => setUserForm(prev => ({...prev, [field.name]: e.target.value}))}
                required={field.required}
                placeholder={`请输入${field.label}`}
                rows={4}
              />
            ) : (
              <input
                type={field.type}
                value={userForm[field.name] || ''}
                onChange={(e) => setUserForm(prev => ({...prev, [field.name]: e.target.value}))}
                required={field.required}
                placeholder={`请输入${field.label}`}
              />
            )}
          </div>
        ))}
        
        <div className="button-group">
          <button type="button" className="back-btn" onClick={() => setSelectedPool(null)}>
            返回池列表
          </button>
          <button 
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '加入中...' : '加入匹配池'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
