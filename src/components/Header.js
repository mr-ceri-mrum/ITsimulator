import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, formatMonthYear } from '../utils/formatters';

const Header = () => {
  const { company, currentDate, togglePause, setGameSpeed, isPaused, gameSpeed } = useGameStore(state => ({
    company: state.company,
    currentDate: state.currentDate,
    togglePause: state.togglePause,
    setGameSpeed: state.setGameSpeed,
    isPaused: state.isPaused,
    gameSpeed: state.gameSpeed
  }));
  
  return (
    <header className="game-header">
      <div className="company-info">
        <h2>{company.name}</h2>
        <div className="company-stats">
          <span>Cash: {formatCurrency(company.cash)}</span>
          &nbsp;|&nbsp;
          <span>Valuation: {formatCurrency(company.valuation)}</span>
        </div>
      </div>
      
      <div className="game-controls">
        <div className="time-controls">
          <button 
            onClick={togglePause}
            className={isPaused ? 'play-button' : 'pause-button'}
          >
            {isPaused ? 'Play' : 'Pause'}
          </button>
          
          <button 
            onClick={() => setGameSpeed(1)}
            className={gameSpeed === 1 ? 'active' : ''}
          >
            1x
          </button>
          
          <button 
            onClick={() => setGameSpeed(2)}
            className={gameSpeed === 2 ? 'active' : ''}
          >
            2x
          </button>
          
          <button 
            onClick={() => setGameSpeed(4)}
            className={gameSpeed === 4 ? 'active' : ''}
          >
            4x
          </button>
        </div>
        
        <div className="date-display">
          {formatMonthYear(currentDate)}
        </div>
      </div>
    </header>
  );
};

export default Header;
