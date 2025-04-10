import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Products from './Products';
import Market from './Market';
import Development from './Development';
import Management from './Management';
import Modal from './Modal';

const GameInterface = () => {
  const { activeView, modalContent, tick, gameSpeed, isPaused } = useGameStore(state => ({
    activeView: state.activeView,
    modalContent: state.modalContent,
    tick: state.tick,
    gameSpeed: state.gameSpeed,
    isPaused: state.isPaused
  }));
  
  // Game loop - runs the tick function based on game speed
  useEffect(() => {
    if (isPaused) return;
    
    // 10 seconds per month at normal speed (10000ms), adjusted by gameSpeed
    const tickInterval = setInterval(() => {
      tick();
    }, 10000 / gameSpeed); 
    
    return () => clearInterval(tickInterval);
  }, [tick, gameSpeed, isPaused]);
  
  // Render the active view
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
    <>
      <Header />
      
      <div className="main-content">
        <Sidebar />
        
        <div className="main-panel">
          {renderView()}
        </div>
      </div>
      
      {modalContent && <Modal content={modalContent} />}
    </>
  );
};

export default GameInterface;
