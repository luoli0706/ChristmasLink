import type { RouteConfig } from '../components/Router';
import Home from '../pages/Home';
import Match from '../pages/Match';
import Register from '../pages/Register';
import History from '../pages/History';
import Remove from '../pages/Remove';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Home,
    title: '首页',
  },
  {
    path: '/match',
    component: Match,
    title: '开始匹配',
  },
  {
    path: '/register',
    component: Register,
    title: '创建/加入匹配池',
  },
  {
    path: '/history',
    component: History,
    title: '历史记录',
  },
  {
    path: '/remove',
    component: Remove,
    title: '移除用户',
  },
];

// 导航菜单配置
export const navigationMenu = [
  {
    path: '/',
    label: '首页',
    icon: '🏠',
  },
  {
    path: '/match',
    label: '开始匹配',
    icon: '🎯',
  },
  {
    path: '/register',
    label: '创建/加入',
    icon: '📝',
  },
  {
    path: '/history',
    label: '历史记录',
    icon: '📜',
  },
  {
    path: '/remove',
    label: '移除用户',
    icon: '🗑️',
  },
];
