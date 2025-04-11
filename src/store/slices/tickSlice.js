/**
 * Срез хранилища для реализации игрового тика (минимальная версия)
 * Основная игровая логика, которая выполняется на каждом игровом шаге
 */
import { MAX_GLOBAL_POPULATION, MARKET_PARAMS } from '../../constants/gameConfig';

/**
 * Создает срез для управления логикой игрового тика
 */
const createTickSlice = (set, get) => ({
  /**
   * Основная функция обновления игры - выполняется каждый игровой тик
   * Минимальная реализация для обеспечения совместимости
   */
  tick: () => {
    // Пропускаем, если игра на паузе
    if (get().isPaused) return;
    console.log('Выполняется тик игры (tickSlice)');
    
    set(state => {
      // 1. Создаем новую дату, добавляя один месяц
      const newDate = new Date(state.currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // 2. Увеличиваем потенциальную пользовательскую базу
      const newPotentialUsers = Math.min(
        MAX_GLOBAL_POPULATION || 8000000000, 
        (state.potentialUsers || 5000000000) + (MARKET_PARAMS?.MONTHLY_USER_GROWTH || 20800000)
      );
      
      // 3. Возвращаем обновленное состояние
      return {
        currentDate: newDate,
        potentialUsers: newPotentialUsers
      };
    });
  }
});

export default createTickSlice;
