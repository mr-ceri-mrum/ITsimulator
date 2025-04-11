/**
 * Главный компонент игрового интерфейса
 */
import React from 'react';
import { useGameStore } from '../../store';
import useGameTick from '../../hooks/useGameTick';

// Импорт компонентов из их текущего местоположения
import Header from '../Header';
import Sidebar from '../Sidebar';
import Dashboard from '../Dashboard';
import Products from '../Products';
import Market from '../Market';
import Development from '../Development';
import Management from '../Management';
import Modal from '../Modal';
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
      {notifications && notifications.length > 0 && <Notifications notifications={notifications} />}
    </div>
  );
};

export default GameInterface;
