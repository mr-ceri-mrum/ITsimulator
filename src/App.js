/**
 * Корневой компонент приложения
 */
import React, { useEffect } from 'react';
import { useGameStore } from './store';
import StartGame from './components/game/StartGame';
import GameInterface from './components/game/GameInterface';

/**
 * Основной компонент приложения
 * Определяет, показывать стартовый экран или игровой интерфейс
 */
const App = () => {
  const { gameStarted, showSuccessNotification } = useGameStore((state) => ({
    gameStarted: state.gameStarted,
    showSuccessNotification: state.showSuccessNotification
  }));
  
  // При монтировании компонента показываем приветственное сообщение
  useEffect(() => {
    if (!gameStarted) {
      showSuccessNotification('Добро пожаловать в IT Simulator!', 5000);
    }
  }, []);
  
  return (
    <div className="app-container">
      {!gameStarted ? <StartGame /> : <GameInterface />}
    </div>
  );
};

export default App;
