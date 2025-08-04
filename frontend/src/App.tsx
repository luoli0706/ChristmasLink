import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SimpleRouter, Route, RouterContext } from './components/SimpleRouter';
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
          {({ navigate }) => (
            <div className="app">
              <Header onNavigate={navigate} />
              <main>
                <Route path="/" component={Home} />
                <Route path="/match" component={Match} />
                <Route path="/register" component={Register} />
                <Route path="/remove" component={Remove} />
                <Route path="/history" component={History} />
              </main>
            </div>
          )}
        </RouterContext.Consumer>
      </SimpleRouter>
    </ThemeProvider>
  );
}

export default App;
