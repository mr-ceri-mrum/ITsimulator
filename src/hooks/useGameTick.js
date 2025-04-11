/**
 * Хук для управления игровым циклом и интервалами
 */
import { useEffect, useCallback } from 'react';
import { GAME_TICK_INTERVAL } from '../constants/gameConfig';

/**
 * Хук для управления интервалом обновления игры
 * 
 * @param {Function} tickFunction - Функция, которая вызывается при каждом тике
 * @param {number} gameSpeed - Скорость игры (множитель)
 * @param {boolean} isPaused - Приостановлена ли игра
 * @returns {Object} - Объект с функциями управления
 */
export const useGameTick = (tickFunction, gameSpeed = 1, isPaused = false) => {
  // Создаем стабильную ссылку на функцию
  const tick = useCallback(() => {
    if (!isPaused) {
      tickFunction();
    }
  }, [tickFunction, isPaused]);

  // Настраиваем интервал для выполнения тика
  useEffect(() => {
    if (isPaused) return;
    
    // Рассчитываем интервал с учетом скорости
    const intervalTime = GAME_TICK_INTERVAL / gameSpeed;
    
    const tickInterval = setInterval(() => {
      tick();
    }, intervalTime);
    
    return () => clearInterval(tickInterval);
  }, [tick, gameSpeed, isPaused]);

  /**
   * Выполняет один тик игры (полезно для ручного обновления)
   */
  const executeTick = useCallback(() => {
    if (!isPaused) {
      tickFunction();
    }
  }, [tickFunction, isPaused]);

  return {
    executeTick,
  };
};

export default useGameTick;
