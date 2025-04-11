/**
 * Срез хранилища для управления основным состоянием игры
 * (запуск/пауза/скорость/время)
 */
import { INITIAL_GAME_STATE, INITIAL_DATE } from '../../constants/gameConfig';

// Базовые состояния для обеспечения работоспособности, 
// даже если соответствующие константы не определены
const DEFAULT_INITIAL_GAME_STATE = {
  gameStarted: false,
  isPaused: true,
  gameSpeed: 1, // 1 = нормальная скорость, 2 = 2x, 4 = 4x
};

const DEFAULT_INITIAL_DATE = new Date(2004, 0, 1);

/**
 * Срез для управления базовыми игровыми настройками и состоянием
 */
const createGameStateSlice = (set, get) => ({
  // Начальное состояние
  ...(INITIAL_GAME_STATE || DEFAULT_INITIAL_GAME_STATE),
  currentDate: INITIAL_DATE || DEFAULT_INITIAL_DATE,
  
  // Для совместимости со старым интерфейсом
  activeView: 'dashboard',
  
  /**
   * Запускает игру с заданным именем компании
   * @param {string} companyName - Название компании игрока
   */
  startGame: (companyName) => {
    console.log('Запуск игры с компанией:', companyName);
    
    // Пытаемся вызвать generateCompetitors, если функция доступна
    if (typeof get().generateCompetitors === 'function') {
      get().generateCompetitors();
    }
    
    set({
      gameStarted: true,
      isPaused: false, // Автоматический запуск игры
      company: {
        ...(get().company || {}),
        name: companyName,
      },
    });
  },
  
  /**
   * Переключает состояние паузы
   */
  togglePause: () => {
    console.log('Переключение паузы');
    set(state => ({ 
      isPaused: !state.isPaused 
    }));
  },
  
  /**
   * Устанавливает скорость игры
   * @param {number} speed - Множитель скорости (1, 2, 4)
   */
  setGameSpeed: (speed) => {
    console.log('Установка скорости игры:', speed);
    set({ 
      gameSpeed: speed 
    });
  },
  
  /**
   * Устанавливает активную вкладку (для совместимости)
   * @param {string} view - Название вкладки
   */
  setActiveView: (view) => {
    console.log('Переключение на вкладку:', view);
    set({ 
      activeView: view 
    });
  },
  
  /**
   * Обновляет текущую дату
   * @param {Date} newDate - Новая дата
   */
  setCurrentDate: (newDate) => set({
    currentDate: newDate
  }),
  
  /**
   * Простая реализация функции tick для обеспечения совместимости
   */
  tick: () => {
    console.log('Выполняется tick');
    set(state => {
      // Создаем новую дату, добавляя один месяц
      const newDate = new Date(state.currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      return {
        currentDate: newDate
      };
    });
  },
  
  /**
   * Сохраняет игру (заглушка для будущей реализации)
   */
  saveGame: () => {
    // Будущая реализация - можно сохранять в localStorage или на сервере
    const gameState = get();
    console.log('Игра сохранена', gameState);
  },
  
  /**
   * Загружает игру (заглушка для будущей реализации)
   * @param {Object} savedState - Сохраненное состояние игры
   */
  loadGame: (savedState) => {
    // Будущая реализация - загрузка из localStorage или с сервера
    if (savedState) {
      set(savedState);
    }
  },
  
  /**
   * Сбрасывает игру до начального состояния
   */
  resetGame: () => {
    set({
      ...(INITIAL_GAME_STATE || DEFAULT_INITIAL_GAME_STATE),
      currentDate: new Date(INITIAL_DATE || DEFAULT_INITIAL_DATE),
      // Другие поля будут сброшены в их соответствующих срезах
    });
  }
});

export default createGameStateSlice;
