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
            style={{ 
              fontWeight: 'bold', 
              backgroundColor: isPaused ? '#27ae60' : '#e74c3c',
              padding: '8px 16px',
              fontSize: '1em'
            }}
          >
            {isPaused ? '▶ Play' : '❚❚ Pause'}
          </button>
          
          <button 
            onClick={() => setGameSpeed(1)}
            className={gameSpeed === 1 ? 'active' : ''}
            style={{ 
              fontWeight: gameSpeed === 1 ? 'bold' : 'normal',
              backgroundColor: gameSpeed === 1 ? '#3498db' : '#95a5a6'
            }}
          >
            1x
          </button>
          
          <button 
            onClick={() => setGameSpeed(2)}
            className={gameSpeed === 2 ? 'active' : ''}
            style={{ 
              fontWeight: gameSpeed === 2 ? 'bold' : 'normal',
              backgroundColor: gameSpeed === 2 ? '#3498db' : '#95a5a6'
            }}
          >
            2x
          </button>
          
          <button 
            onClick={() => setGameSpeed(4)}
            className={gameSpeed === 4 ? 'active' : ''}
            style={{ 
              fontWeight: gameSpeed === 4 ? 'bold' : 'normal',
              backgroundColor: gameSpeed === 4 ? '#3498db' : '#95a5a6'
            }}
          >
            4x
          </button>
        </div>
        
        <div className="date-display" style={{ 
          fontSize: '1.2em', 
          fontWeight: 'bold',
          padding: '8px 16px',
          backgroundColor: '#34495e',
          borderRadius: '4px',
          color: 'white',
          marginLeft: '10px'
        }}>
          {formatMonthYear(currentDate)}
        </div>
      </div>
    </header>
  );
};

export default Header;
