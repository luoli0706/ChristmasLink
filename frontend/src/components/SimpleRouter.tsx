import React, { useState } from 'react';

interface SimpleRouterProps {
  children: React.ReactNode;
}

interface RouteProps {
  path: string;
  component: React.ComponentType;
}

// 简单的路由上下文
export const RouterContext = React.createContext<{
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}>({
  currentPath: '/',
  navigate: () => {},
  params: {}
});

// 简单的路由器组件
export const SimpleRouter: React.FC<SimpleRouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = (path: string, routeParams?: Record<string, string>) => {
    setCurrentPath(path);
    setParams(routeParams || {});
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};

// 路由组件
export const Route: React.FC<RouteProps> = ({ path, component: Component }) => {
  const { currentPath } = React.useContext(RouterContext);
  
  if (currentPath === path) {
    return <Component />;
  }
  
  return null;
};

// 自定义导航hook
export const useNavigate = () => {
  const { navigate } = React.useContext(RouterContext);
  return navigate;
};

// 获取路由参数hook
export const useParams = () => {
  const { params } = React.useContext(RouterContext);
  return params;
};
