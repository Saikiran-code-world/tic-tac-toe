
import React from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>✨ Blink Tac Toe ✨</h1>
      </header>
      <main>
        <Game />
      </main>
      <footer className="app-footer">
        <p>Enjoy the game! Built with React & Vite.</p>
      </footer>
    </div>
  );
}

export default App;