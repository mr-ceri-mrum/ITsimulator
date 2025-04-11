/**
 * Главный компонент игрового интерфейса
 */
import React from 'react';
import { useGameStore } from '../../store';
import useGameTick from '../../hooks/useGameTick';

// Импорт компонентов
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Dashboard from '../dashboard/Dashboard';
import Products from '../products/Products';
import Market from '../market/Market';
import Development from '../development/Development';
import Management from '../management/Management';
import Modal from '../common/Modal';
import Notifications from '../common/Notifications';

/**
 * Основной игровой интерфейс, который отображается после начала игры
 */
const GameInterface = () => {
  // Получаем необходимые данные и функции из хранилища
  const { 
    activeView, 
    modalContent, 
    tick, 
    gameSpeed, 
    isPaused, 
    notifications 
  } = useGameStore(state => ({
    activeView: state.activeView,
    modalContent: state.modalContent,
    tick: state.tick,
    gameSpeed: state.gameSpeed,
    isPaused: state.isPaused,
    notifications: state.notifications
  }));
  
  // Используем хук для управления игровым циклом
  useGameTick(tick, gameSpeed, isPaused);
  
  /**
   * Отображает активную вкладку на основе выбранного представления
   * @returns {JSX.Element} - Компонент для активной вкладки
   */
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'market':
        return <Market />;
      case 'development':
        return <Development />;
      case 'management':
        return <Management />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="game-interface">
      <Header />
      
      <div className="main-content">
        <Sidebar />
        
        <div className="main-panel">
          {renderView()}
        </div>
      </div>
      
      {/* Отображаем модальное окно, если оно есть */}
      {modalContent && <Modal content={modalContent} />}
      
      {/* Компонент для отображения уведомлений */}
      {notifications.length > 0 && <Notifications notifications={notifications} />}
    </div>
  );
};

export default GameInterface;
