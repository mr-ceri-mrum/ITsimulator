/**
 * Компонент стартового экрана игры
 */
import React, { useState } from 'react';
import { useGameStore } from '../../store';

/**
 * Компонент для начала новой игры
 * Позволяет ввести название компании и начать игру
 */
const StartGame = () => {
  // Состояние для хранения имени компании
  const [companyName, setCompanyName] = useState('');
  
  // Получаем функцию для начала игры из хранилища
  const { startGame } = useGameStore((state) => ({
    startGame: state.startGame,
  }));
  
  /**
   * Обработчик отправки формы
   * @param {Event} e - Событие отправки формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем, что имя компании не пустое
    if (!companyName.trim()) {
      alert('Пожалуйста, введите название вашей компании');
      return;
    }
    
    // Начинаем игру с указанным именем компании
    startGame(companyName.trim());
  };
  
  return (
    <div className="start-game-container">
      <div className="start-game-card">
        <h1 className="start-game-title">IT Simulator</h1>
        <p className="start-game-description">
          Создайте собственную IT-империю, развивайте продукты, конкурируйте с 
          техногигантами и достигните мирового господства в IT-индустрии!
        </p>
        
        <form className="start-game-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Название вашей компании:</label>
            <input
              type="text"
              id="companyName"
              className="form-control"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Например: TechNova, Quantum Software..."
              maxLength={30}
            />
          </div>
          
          <div className="difficulty-selection">
            <h3>Уровень сложности:</h3>
            <div className="difficulty-options">
              <div className="difficulty-option selected">
                <input 
                  type="radio" 
                  id="normal" 
                  name="difficulty"
                  defaultChecked
                />
                <label htmlFor="normal">Нормальный</label>
                <p>Сбалансированная игра для большинства игроков.</p>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="start-game-button"
          >
            Начать игру
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartGame;
