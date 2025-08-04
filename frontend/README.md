# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 圣诞匹配池前端

## 项目介绍
这是一个圣诞匹配池的前端应用，使用 Vite + React + TypeScript 构建。

## 功能特性
- 🎯 **开始匹配**: 根据兴趣爱好和个人信息进行智能匹配
- 📝 **注册匹配池**: 创建个人资料，加入圣诞匹配系统
- 🗑️ **移除匹配池**: 从匹配池中移除个人信息
- 🌙 **深浅色主题**: 支持明暗主题切换
- 📱 **响应式设计**: 完美适配桌面端和移动端

## 技术栈
- React 19
- TypeScript
- Vite
- CSS3 (CSS Variables for theming)
- 自定义路由系统

## 安装依赖
```bash
npm install
```

## 启动开发服务器
```bash
npm run dev
```

## 构建生产版本
```bash
npm run build
```

## 项目结构
```
src/
├── components/          # 组件
│   ├── Header.tsx      # 头部组件
│   └── SimpleRouter.tsx # 简单路由系统
├── contexts/           # 上下文
│   └── ThemeContext.tsx # 主题上下文
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Match.tsx       # 匹配页面
│   ├── Register.tsx    # 注册页面
│   └── Remove.tsx      # 移除页面
├── styles/             # 样式文件
│   ├── globals.css     # 全局样式
│   ├── Header.css      # 头部样式
│   ├── Home.css        # 首页样式
│   ├── Match.css       # 匹配页面样式
│   ├── Register.css    # 注册页面样式
│   └── Remove.css      # 移除页面样式
└── App.tsx            # 主应用组件
```

## 使用说明

### 主题切换
点击右上角的主题切换按钮可以在明暗主题间切换。主题偏好会自动保存到本地存储。

### 匹配流程
1. 点击"开始匹配"
2. 填写个人信息和兴趣爱好
3. 系统会根据算法进行匹配
4. 显示匹配结果

### 注册流程
1. 点击"注册匹配池"
2. 填写完整的个人信息
3. 提交后加入匹配池

### 移除流程
1. 点击"移除匹配池"
2. 输入注册时的联系方式
3. 确认后从匹配池中移除

## 样式系统
项目使用 CSS Variables 实现主题系统，支持：
- 自动明暗主题切换
- 圣诞节主题色彩（红色、绿色、金色）
- 响应式布局
- 平滑动画过渡

## 待办事项
- [ ] 集成真实的后端 API
- [ ] 添加用户认证系统
- [ ] 实现实时聊天功能
- [ ] 添加更多匹配算法选项
- [ ] 国际化支持

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
