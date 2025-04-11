/**
 * Срез хранилища для управления основным состоянием игры
 * (запуск/пауза/скорость/время)
 */
import { INITIAL_GAME_STATE, INITIAL_DATE } from '../../constants/gameConfig';

/**
 * Срез для управления базовыми игровыми настройками и состоянием
 */
const createGameStateSlice = (set, get) => ({
  // Начальное состояние
  ...INITIAL_GAME_STATE,
  currentDate: INITIAL_DATE,
  
  /**
   * Запускает игру с заданным именем компании
   * @param {string} companyName - Название компании игрока
   */
  startGame: (companyName) => {
    const { generateCompetitors } = get();
    
    // Генерируем конкурентов перед запуском
    generateCompetitors();
    
    set({
      gameStarted: true,
      isPaused: false, // Автоматический запуск игры
      company: {
        ...get().company,
        name: companyName,
      },
    });
  },
  
  /**
   * Переключает состояние паузы
   */
  togglePause: () => set(state => ({ 
    isPaused: !state.isPaused 
  })),
  
  /**
   * Устанавливает скорость игры
   * @param {number} speed - Множитель скорости (1, 2, 4)
   */
  setGameSpeed: (speed) => set({ 
    gameSpeed: speed 
  }),
  
  /**
   * Обновляет текущую дату
   * @param {Date} newDate - Новая дата
   */
  setCurrentDate: (newDate) => set({
    currentDate: newDate
  }),
  
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
      ...INITIAL_GAME_STATE,
      currentDate: new Date(INITIAL_DATE),
      // Другие поля будут сброшены в их соответствующих срезах
    });
  }
});

export default createGameStateSlice;
