import React from 'react';
import { useGameStore } from '../store/gameStore';

const Sidebar = () => {
  const { activeView, setActiveView } = useGameStore(state => ({
    activeView: state.activeView,
    setActiveView: state.setActiveView
  }));
  
  const handleNavigation = (view) => {
    setActiveView(view);
  };
  
  return (
    <div className="sidebar">
      <h3>Navigation</h3>
      
      <button 
        className={activeView === 'dashboard' ? 'active' : ''}
        onClick={() => handleNavigation('dashboard')}
      >
        Dashboard
      </button>
      
      <button 
        className={activeView === 'products' ? 'active' : ''}
        onClick={() => handleNavigation('products')}
      >
        Products
      </button>
      
      <button 
        className={activeView === 'development' ? 'active' : ''}
        onClick={() => handleNavigation('development')}
      >
        Development
      </button>
      
      <button 
        className={activeView === 'management' ? 'active' : ''}
        onClick={() => handleNavigation('management')}
      >
        Management
      </button>
      
      <button 
        className={activeView === 'market' ? 'active' : ''}
        onClick={() => handleNavigation('market')}
      >
        Market
      </button>
      
      <div className="sidebar-info">
        <h3>Info</h3>
        <div className="info-item">
          <p><strong>IT Empire Tycoon</strong></p>
          <p>Build your tech empire from a small startup to a global tech giant.</p>
          <p>Develop products, manage resources, and compete in the tech industry.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
