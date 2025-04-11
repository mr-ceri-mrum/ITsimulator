import React from 'react';
import { useGameStore } from '../store';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

const Header = () => {
  const { company, currentDate, gameSpeed, isPaused, togglePause, setGameSpeed } = useGameStore(state => ({
    company: state.company,
    currentDate: state.currentDate,
    gameSpeed: state.gameSpeed,
    isPaused: state.isPaused,
    togglePause: state.togglePause,
    setGameSpeed: state.setGameSpeed
  }));
  
  // Проверка наличия объекта компании
  const companyName = company ? company.name : 'Unknown';
  const companyCash = company ? company.cash : 0;
  const companyValuation = company ? company.valuation : 0;
  const companyEmployees = company ? company.employees : 0;
  const companyIncome = company ? company.monthlyIncome : 0;
  const companyExpenses = company ? company.monthlyExpenses : 0;
  
  // Обработчики нажатия
  const handleTogglePause = () => {
    if (typeof togglePause === 'function') {
      togglePause();
    } else {
      console.warn('Функция togglePause не определена в хранилище');
    }
  };
  
  const handleSetSpeed = (speed) => {
    if (typeof setGameSpeed === 'function') {
      setGameSpeed(speed);
    } else {
      console.warn('Функция setGameSpeed не определена в хранилище');
    }
  };
  
  return (
    <div className="header">
      <div className="company-info">
        <h1>{companyName}</h1>
        <div className="game-date">{formatDate(currentDate, 'long')}</div>
      </div>
      
      <div className="financial-stats">
        <div className="stat">
          <span className="stat-label">Cash:</span>
          <span className="stat-value">{formatCurrency(companyCash)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Valuation:</span>
          <span className="stat-value">{formatCurrency(companyValuation)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Income:</span>
          <span className="stat-value">{formatCurrency(companyIncome)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Expenses:</span>
          <span className="stat-value">{formatCurrency(companyExpenses)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Employees:</span>
          <span className="stat-value">{formatNumber(companyEmployees)}</span>
        </div>
      </div>
      
      <div className="game-controls">
        <button onClick={handleTogglePause} className="control-button">
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        
        <div className="speed-controls">
          <button 
            onClick={() => handleSetSpeed(1)} 
            className={gameSpeed === 1 ? 'active' : ''}
          >
            1x
          </button>
          <button 
            onClick={() => handleSetSpeed(2)} 
            className={gameSpeed === 2 ? 'active' : ''}
          >
            2x
          </button>
          <button 
            onClick={() => handleSetSpeed(4)} 
            className={gameSpeed === 4 ? 'active' : ''}
          >
            4x
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
