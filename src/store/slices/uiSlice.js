/**
 * Срез хранилища для управления интерфейсом пользователя
 */

/**
 * Создает срез для управления UI состоянием (активные вкладки, модальные окна и т.д.)
 */
const createUISlice = (set, get) => ({
  // Начальное состояние UI
  activeView: 'dashboard',
  modalContent: null,
  notifications: [],
  
  /**
   * Устанавливает активную вкладку
   * @param {string} view - Название активной вкладки
   */
  setActiveView: (view) => set({ activeView: view }),
  
  /**
   * Открывает модальное окно с заданным содержимым
   * @param {*} content - Содержимое модального окна (React компонент, строка или объект)
   */
  openModal: (content) => set({ modalContent: content }),
  
  /**
   * Закрывает модальное окно
   */
  closeModal: () => set({ modalContent: null }),
  
  /**
   * Добавляет новое уведомление
   * @param {Object} notification - Объект с данными уведомления
   * @param {string} notification.type - Тип уведомления (info, success, warning, error)
   * @param {string} notification.message - Текст уведомления
   * @param {number} notification.duration - Длительность отображения в мс (по умолчанию 5000)
   */
  addNotification: (notification) => {
    const id = Date.now(); // Уникальный ID для уведомления
    const defaultDuration = 5000; // 5 секунд по умолчанию
    
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || defaultDuration,
      timestamp: new Date()
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Автоматически удаляем уведомление после окончания его времени жизни
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id; // Возвращаем ID для возможного ручного удаления
  },
  
  /**
   * Удаляет уведомление по ID
   * @param {number} id - ID уведомления для удаления
   */
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  /**
   * Очищает все уведомления
   */
  clearAllNotifications: () => {
    set({ notifications: [] });
  },
  
  /**
   * Отображает уведомление об успешном действии
   * @param {string} message - Текст уведомления
   * @param {number} duration - Длительность отображения (опционально)
   */
  showSuccessNotification: (message, duration) => {
    get().addNotification({
      type: 'success',
      message,
      duration
    });
  },
  
  /**
   * Отображает уведомление об ошибке
   * @param {string} message - Текст уведомления
   * @param {number} duration - Длительность отображения (опционально)
   */
  showErrorNotification: (message, duration) => {
    get().addNotification({
      type: 'error',
      message,
      duration
    });
  }
});

export default createUISlice;
