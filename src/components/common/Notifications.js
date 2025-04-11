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
const Notifications = ({ notifications = [] }) => {
  // Проверяем, что notifications - это массив, и если нет, используем пустой массив
  const notificationArray = Array.isArray(notifications) ? notifications : [];
  
  // Получаем функцию для удаления уведомлений
  const { removeNotification } = useGameStore((state) => ({
    removeNotification: state.removeNotification || (() => console.log('removeNotification не найден'))
  }));
  
  // Если нет уведомлений, не рендерим компонент
  if (notificationArray.length === 0) {
    return null;
  }
  
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
  
  // Обработчик закрытия уведомления
  const handleClose = (id) => {
    if (typeof removeNotification === 'function') {
      removeNotification(id);
    } else {
      console.log('Функция удаления уведомления недоступна');
    }
  };
  
  return (
    <div className="notifications-container">
      {notificationArray.map((notification) => (
        <div 
          key={notification.id || Math.random()} 
          className={`notification ${getNotificationClass(notification.type)}`}
        >
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-close" 
            onClick={() => handleClose(notification.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
