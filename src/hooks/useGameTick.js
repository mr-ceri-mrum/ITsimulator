/**
 * Хук для управления игровым циклом и интервалами
 */
import { useEffect, useCallback } from 'react';

/**
 * Хук для управления интервалом обновления игры
 * 
 * @param {Function} tickFunction - Функция, которая вызывается при каждом тике
 * @param {number} gameSpeed - Скорость игры (множитель)
 * @param {boolean} isPaused - Приостановлена ли игра
 * @returns {Object} - Объект с функциями управления
 */
const useGameTick = (tickFunction, gameSpeed = 1, isPaused = false) => {
  // Создаем стабильную ссылку на функцию
  const tick = useCallback(() => {
    if (!isPaused && typeof tickFunction === 'function') {
      tickFunction();
    }
  }, [tickFunction, isPaused]);

  // Настраиваем интервал для выполнения тика
  useEffect(() => {
    if (isPaused || typeof tickFunction !== 'function') return;
    
    // Рассчитываем интервал с учетом скорости
    const intervalTime = 10000 / gameSpeed; // 10 секунд по умолчанию
    
    const tickInterval = setInterval(() => {
      tick();
    }, intervalTime);
    
    return () => clearInterval(tickInterval);
  }, [tick, gameSpeed, isPaused, tickFunction]);

  /**
   * Выполняет один тик игры (полезно для ручного обновления)
   */
  const executeTick = useCallback(() => {
    if (!isPaused && typeof tickFunction === 'function') {
      tickFunction();
    }
  }, [tickFunction, isPaused]);

  return {
    executeTick,
  };
};

export default useGameTick;
