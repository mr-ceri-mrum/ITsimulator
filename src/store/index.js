/**
 * Основной файл хранилища, объединяющий все срезы (slices)
 */
import { create } from 'zustand';
import createGameStateSlice from './slices/gameStateSlice';
import createCompanySlice from './slices/companySlice';
import createMarketSlice from './slices/marketSlice';
import createUISlice from './slices/uiSlice';
import createTickSlice from './slices/tickSlice';

/**
 * Создает единое глобальное хранилище, объединяя все срезы (slices)
 * Примечание: в Zustand используется композиционный подход вместо комбинации редьюсеров как в Redux
 */
export const useGameStore = create((set, get) => ({
  /**
   * Объединяем все срезы (slices) из разных файлов для создания единого хранилища
   */
  ...createGameStateSlice(set, get),
  ...createCompanySlice(set, get),
  ...createMarketSlice(set, get),
  ...createUISlice(set, get),
  ...createTickSlice(set, get),
}));

export default useGameStore;
