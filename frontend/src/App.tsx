import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { Router } from './components/Router';
import { routes } from './config/routes';
import Header from './components/Header';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <Router routes={routes} initialPath="/">
          <div className="app">
            <Header />
            <main>
              {/* 路由组件会由Router自动渲染 */}
            </main>
          </div>
        </Router>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
