/**
 * Компонент боковой панели навигации
 */
import React from 'react';
import { useGameStore } from '../../store';

/**
 * Компонент боковой панели с навигацией по разделам игры
 */
const Sidebar = () => {
  // Получаем текущую активную вкладку и функцию установки вкладки
  const { activeView, setActiveView } = useGameStore((state) => ({
    activeView: state.activeView,
    setActiveView: state.setActiveView
  }));
  
  // Структура пунктов меню
  const menuItems = [
    { id: 'dashboard', label: 'Обзор', icon: '📊' },
    { id: 'products', label: 'Продукты', icon: '🚀' },
    { id: 'development', label: 'Разработка', icon: '👨‍💻' },
    { id: 'market', label: 'Рынок', icon: '🌎' },
    { id: 'management', label: 'Управление', icon: '👥' },
  ];
  
  /**
   * Возвращает CSS-класс для пункта меню в зависимости от текущей активной вкладки
   * @param {string} viewId - ID вкладки для проверки
   * @returns {string} - CSS-класс
   */
  const getMenuItemClass = (viewId) => {
    return viewId === activeView ? 'menu-item active' : 'menu-item';
  };
  
  return (
    <div className="sidebar">
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button 
                className={getMenuItemClass(item.id)} 
                onClick={() => setActiveView(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="version">v1.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
