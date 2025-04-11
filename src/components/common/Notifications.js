/**
 * Компонент для отображения системных уведомлений
 */
import React from 'react';
import { useGameStore } from '../../store';

/**
 * Компонент для отображения списка уведомлений
 * @param {Object} props - Свойства компонента
 * @param {Array} props.notifications - Массив уведомлений для отображения
 */
const Notifications = ({ notifications }) => {
  // Получаем функцию для удаления уведомлений
  const { removeNotification } = useGameStore((state) => ({
    removeNotification: state.removeNotification
  }));
  
  /**
   * Возвращает CSS-класс на основе типа уведомления
   * @param {string} type - Тип уведомления
   * @returns {string} - CSS-класс для данного типа
   */
  const getNotificationClass = (type) => {
    switch (type) {
      case 'error':
        return 'notification-error';
      case 'success':
        return 'notification-success';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };
  
  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification ${getNotificationClass(notification.type)}`}
        >
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notification.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
