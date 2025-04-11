/**
 * Компонент заголовка игры
 */
import React from 'react';
import { useGameStore } from '../../store';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

/**
 * Компонент заголовка с основной информацией о компании и управлением скоростью
 */
const Header = () => {
  // Получаем необходимые данные и функции из хранилища
  const { 
    company, 
    currentDate, 
    gameSpeed, 
    isPaused, 
    togglePause, 
    setGameSpeed, 
    saveGame 
  } = useGameStore((state) => ({
    company: state.company,
    currentDate: state.currentDate,
    gameSpeed: state.gameSpeed,
    isPaused: state.isPaused,
    togglePause: state.togglePause,
    setGameSpeed: state.setGameSpeed,
    saveGame: state.saveGame
  }));
  
  /**
   * Возвращает класс кнопки скорости в зависимости от текущей скорости
   * @param {number} speed - Значение скорости для сравнения
   * @returns {string} - CSS класс
   */
  const getSpeedButtonClass = (speed) => {
    return gameSpeed === speed ? 'speed-button active' : 'speed-button';
  };
  
  return (
    <header className="game-header">
      <div className="company-info">
        <h1 className="company-name">{company.name}</h1>
        <div className="company-founded">
          Основана: {formatDate(company.founded)}
        </div>
      </div>
      
      <div className="company-stats">
        <div className="stat">
          <div className="stat-label">Наличные</div>
          <div className="stat-value">{formatCurrency(company.cash)}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Оценка</div>
          <div className="stat-value">{formatCurrency(company.valuation)}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Доход/мес</div>
          <div className="stat-value">{formatCurrency(company.monthlyIncome)}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Расходы/мес</div>
          <div className="stat-value">{formatCurrency(company.monthlyExpenses)}</div>
        </div>
        
        <div className="stat">
          <div className="stat-label">Сотрудники</div>
          <div className="stat-value">{formatNumber(company.employees)}</div>
        </div>
      </div>
      
      <div className="game-controls">
        <div className="date-display">
          {formatDate(currentDate, 'long')}
        </div>
        
        <div className="speed-controls">
          <button 
            className="pause-button" 
            onClick={togglePause}
            title={isPaused ? "Продолжить" : "Пауза"}
          >
            {isPaused ? "▶" : "⏸"}
          </button>
          
          <button 
            className={getSpeedButtonClass(1)} 
            onClick={() => setGameSpeed(1)}
            title="Нормальная скорость"
          >
            1x
          </button>
          
          <button 
            className={getSpeedButtonClass(2)} 
            onClick={() => setGameSpeed(2)}
            title="Быстрая скорость"
          >
            2x
          </button>
          
          <button 
            className={getSpeedButtonClass(4)} 
            onClick={() => setGameSpeed(4)}
            title="Очень быстрая скорость"
          >
            4x
          </button>
        </div>
        
        <button 
          className="save-button" 
          onClick={saveGame}
          title="Сохранить игру"
        >
          Сохранить
        </button>
      </div>
    </header>
  );
};

export default Header;
