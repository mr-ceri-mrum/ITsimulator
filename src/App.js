import React from 'react';
import StartGame from './components/StartGame';
import GameInterface from './components/GameInterface';
import { useGameStore } from './store/gameStore';

function App() {
  const { gameStarted } = useGameStore();

  return (
    <div className="app-container">
      {!gameStarted ? <StartGame /> : <GameInterface />}
    </div>
  );
}

export default App;
