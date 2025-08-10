import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SimpleRouter, RouterContext } from './components/SimpleRouter';
import Header from './components/Header';
import Home from './pages/Home';
import Match from './pages/Match';
import Register from './pages/Register';
import Remove from './pages/Remove';
import History from './pages/History';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <SimpleRouter>
        <RouterContext.Consumer>
          {({ navigate, currentPath }) => {
            console.log('Current path:', currentPath);
            return (
            <div className="app">
              <Header onNavigate={navigate} />
              <main>
                {currentPath === '/' && <Home onNavigate={navigate} />}
                {currentPath === '/match' && <Match onNavigate={navigate} />}
                {currentPath === '/register' && <Register onNavigate={navigate} />}
                {currentPath === '/remove' && <Remove />}
                {currentPath === '/history' && <History />}
              </main>
            </div>
            );
          }}
        </RouterContext.Consumer>
      </SimpleRouter>
    </ThemeProvider>
  );
}

export default App;
