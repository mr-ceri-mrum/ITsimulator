/**
 * Компонент модального окна
 */
import React, { useEffect } from 'react';
import { useGameStore } from '../../store';

/**
 * Компонент для отображения модальных окон
 * @param {Object} props - Свойства компонента
 * @param {*} props.content - Содержимое модального окна (компонент, строка или объект)
 */
const Modal = ({ content }) => {
  // Получаем функцию для закрытия модального окна
  const { closeModal } = useGameStore((state) => ({
    closeModal: state.closeModal
  }));
  
  // Обработчик нажатия клавиши Escape для закрытия модального окна
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    // Добавляем обработчик при монтировании
    window.addEventListener('keydown', handleKeyDown);
    
    // Убираем обработчик при размонтировании
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal]);
  
  /**
   * Обработчик клика на фон (для закрытия модального окна)
   * @param {Event} e - Событие клика
   */
  const handleBackdropClick = (e) => {
    // Закрываем только если был клик именно на фон (не на содержимое)
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  
  // Определяем тип содержимого
  const renderContent = () => {
    // Если содержимое - React компонент
    if (React.isValidElement(content)) {
      return content;
    }
    
    // Если содержимое - объект с заголовком и текстом
    if (typeof content === 'object' && content !== null) {
      return (
        <>
          {content.title && <h2 className="modal-title">{content.title}</h2>}
          {content.body && <div className="modal-body">{content.body}</div>}
          {content.footer && <div className="modal-footer">{content.footer}</div>}
        </>
      );
    }
    
    // Если содержимое - простой текст
    return <div className="modal-body">{content}</div>;
  };
  
  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <button 
          className="modal-close-button" 
          onClick={closeModal}
          aria-label="Закрыть"
        >
          &times;
        </button>
        
        <div className="modal-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;
