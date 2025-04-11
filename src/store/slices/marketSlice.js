/**
 * Срез хранилища для управления рынком и конкурентами
 */
import { INITIAL_POTENTIAL_USERS, AI_COMPANY_CONFIG } from '../../constants/gameConfig';
import { generateRandomCompanies } from '../../utils/aiCompanies';

/**
 * Создает срез для управления рынком и конкурентами
 */
const createMarketSlice = (set, get) => ({
  // Начальные данные рынка
  potentialUsers: INITIAL_POTENTIAL_USERS || 5000000000,
  competitors: [],
  
  /**
   * Генерирует конкурентов при запуске игры
   */
  generateCompetitors: () => {
    console.log('Генерация конкурентов (200 компаний)');
    const competitors = generateRandomCompanies(200); // Генерируем 200 компаний
    set({ competitors });
  },
  
  /**
   * Обновляет количество потенциальных пользователей
   * @param {number} newPotentialUsers - Новое количество потенциальных пользователей
   */
  updatePotentialUsers: (newPotentialUsers) => {
    console.log('Обновление потенциальных пользователей:', newPotentialUsers);
    set({ potentialUsers: newPotentialUsers });
  },
  
  /**
   * Обновляет данные конкурентов
   * @param {Array} updatedCompetitors - Обновленный массив конкурентов
   */
  updateCompetitors: (updatedCompetitors) => {
    console.log('Обновление конкурентов:', updatedCompetitors);
    set({ competitors: updatedCompetitors });
  },
  
  /**
   * Обрабатывает стратегию ИИ-компаний
   */
  processAIBehavior: () => {
    console.log('Обработка поведения ИИ-конкурентов');
    return get().competitors;
  }
});

export default createMarketSlice;
