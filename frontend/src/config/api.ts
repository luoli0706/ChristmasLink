// API 配置
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// 根据环境确定API基础URL
export const API_BASE_URL = (() => {
  // 优先使用环境变量配置
  if (import.meta.env.VITE_API_BASE_URL !== undefined) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 回退到默认配置
  if (isDevelopment) {
    // 开发环境：使用代理
    return '';
  } else if (isProduction) {
    // 生产环境：使用云服务器公网IP
    return 'http://117.72.61.26:7776';
  } else {
    // 预览模式：使用本地服务器
    return 'http://127.0.0.1:7776';
  }
})();

// 调试信息
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Environment:', isDevelopment ? 'development' : isProduction ? 'production' : 'preview');
}

// API 端点
export const API_ENDPOINTS = {
  // 匹配池管理
  POOLS: '/api/pools',
  POOL_BY_ID: (id: string) => `/api/pools/${id}`,
  JOIN_POOL: '/api/pools/join',
  
  // 匹配功能
  START_MATCH: '/api/match',
  
  // 历史记录
  HISTORY: '/api/history',
  HISTORY_BY_ID: (id: string) => `/api/history/${id}`,
  
  // 用户管理
  SEARCH_USER: '/api/users/search',
  REMOVE_USER: (id: string) => `/api/users/${id}`,
} as const;

// HTTP 请求辅助函数
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// API 方法
export const api = {
  // 匹配池管理
  createPool: (data: any) => 
    apiRequest(API_ENDPOINTS.POOLS, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getPools: () => 
    apiRequest(API_ENDPOINTS.POOLS),
    
  getPoolById: (id: string) => 
    apiRequest(API_ENDPOINTS.POOL_BY_ID(id)),
    
  joinPool: (data: any) => 
    apiRequest(API_ENDPOINTS.JOIN_POOL, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 匹配功能
  startMatch: (data: any) => 
    apiRequest(API_ENDPOINTS.START_MATCH, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 历史记录
  getHistory: () => 
    apiRequest(API_ENDPOINTS.HISTORY),
    
  getHistoryById: (id: string) => 
    apiRequest(API_ENDPOINTS.HISTORY_BY_ID(id)),

  // 用户管理
  searchUser: (contactInfo: string) => 
    apiRequest(API_ENDPOINTS.SEARCH_USER, {
      method: 'POST',
      body: JSON.stringify({ contactInfo }),
    }),
    
  removeUser: (id: string) => 
    apiRequest(API_ENDPOINTS.REMOVE_USER(id), {
      method: 'DELETE',
    }),
};
