import React from 'react';
import { useGameStore } from '../store/gameStore';

const Modal = ({ content }) => {
  const closeModal = useGameStore(state => state.closeModal);
  
  // If no content is provided, don't render the modal
  if (!content) return null;
  
  // Extract title and component from content
  const { title, component } = content;
  
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        
        <div className="modal-body">
          {component}
        </div>
      </div>
    </div>
  );
};

export default Modal;
