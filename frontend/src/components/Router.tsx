import React, { createContext, useContext, useState, useCallback } from 'react';

// 路由配置类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  title?: string;
  props?: any;
}

// 路由上下文类型
interface RouterContextType {
  currentPath: string;
  navigate: (path: string, state?: any) => void;
  goBack: () => void;
  state: any;
  isNavigating: boolean;
}

// 创建路由上下文
const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
  goBack: () => {},
  state: null,
  isNavigating: false,
});

// 路由历史堆栈
interface HistoryEntry {
  path: string;
  state?: any;
}

// 路由器组件属性
interface RouterProps {
  children: React.ReactNode;
  routes: RouteConfig[];
  initialPath?: string;
}

// 路由器组件
export const Router: React.FC<RouterProps> = ({ 
  children, 
  routes, 
  initialPath = '/' 
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [state, setState] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [historyStack, setHistoryStack] = useState<HistoryEntry[]>([{ path: initialPath }]);

  // 导航函数
  const navigate = useCallback((path: string, newState?: any) => {
    setIsNavigating(true);
    
    // 添加到历史记录
    setHistoryStack(prev => [...prev, { path, state: newState }]);
    setCurrentPath(path);
    setState(newState || null);
    
    // 更新页面标题
    const route = routes.find(r => r.path === path);
    if (route?.title) {
      document.title = `${route.title} - 圣诞链接`;
    }
    
    setTimeout(() => setIsNavigating(false), 100);
  }, [routes]);

  // 返回函数
  const goBack = useCallback(() => {
    if (historyStack.length > 1) {
      const newHistory = historyStack.slice(0, -1);
      const previousEntry = newHistory[newHistory.length - 1];
      setCurrentPath(previousEntry.path);
      setState(previousEntry.state || null);
      setHistoryStack(newHistory);
    }
  }, [historyStack]);

  // 获取当前路由组件
  const getCurrentComponent = () => {
    const route = routes.find(r => r.path === currentPath);
    if (route) {
      const Component = route.component;
      const props = {
        ...route.props,
        onNavigate: navigate,
        onGoBack: goBack,
        routeState: state,
      };
      return <Component {...props} />;
    }
    
    // 404 页面
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>页面未找到</h2>
        <p>路径 "{currentPath}" 不存在</p>
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    );
  };

  const contextValue: RouterContextType = {
    currentPath,
    navigate,
    goBack,
    state,
    isNavigating,
  };

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
      {getCurrentComponent()}
    </RouterContext.Provider>
  );
};

// 自定义 hooks
export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
};

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useGoBack = () => {
  const { goBack } = useRouter();
  return goBack;
};

export const useRouteState = () => {
  const { state } = useRouter();
  return state;
};

export const useCurrentPath = () => {
  const { currentPath } = useRouter();
  return currentPath;
};

// 导航链接组件
interface LinkProps {
  to: string;
  children: React.ReactNode;
  state?: any;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export const Link: React.FC<LinkProps> = ({ 
  to, 
  children, 
  state, 
  className = '', 
  activeClassName = '',
  onClick 
}) => {
  const { navigate, currentPath } = useRouter();
  
  const isActive = currentPath === to;
  const finalClassName = `${className} ${isActive ? activeClassName : ''}`.trim();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    navigate(to, state);
  };
  
  return (
    <a 
      href={to} 
      className={finalClassName}
      onClick={handleClick}
      data-active={isActive}
    >
      {children}
    </a>
  );
};

// 条件渲染组件
interface ConditionalRenderProps {
  when: string | string[];
  children: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({ when, children }) => {
  const { currentPath } = useRouter();
  
  const shouldRender = Array.isArray(when) 
    ? when.includes(currentPath)
    : currentPath === when;
    
  return shouldRender ? <>{children}</> : null;
};

// 路由守卫组件
interface RouteGuardProps {
  condition: () => boolean;
  fallbackPath: string;
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  condition, 
  fallbackPath, 
  children 
}) => {
  const { navigate } = useRouter();
  
  React.useEffect(() => {
    if (!condition()) {
      navigate(fallbackPath);
    }
  }, [condition, fallbackPath, navigate]);
  
  return condition() ? <>{children}</> : null;
};
