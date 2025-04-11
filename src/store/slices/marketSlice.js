/**
 * Срез хранилища для управления рынком и конкурентами
 */
import { 
  INITIAL_POTENTIAL_USERS, 
  AI_COMPANY_CONFIG, 
  BUSINESS_METRICS, 
  PRODUCT_TYPES,
  MAX_GLOBAL_POPULATION
} from '../../constants/gameConfig';
import { generateRandomCompanies, getProductTypes } from '../../utils/aiCompanies';
import { 
  createAIProduct, 
  calculateUserGrowthRate, 
  calculateQualityDegradation 
} from '../../models/Product';
import { getProductRequirements } from '../../utils/productRequirements';

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
    console.log('Обновление конкурентов:', updatedCompetitors.length);
    set({ competitors: updatedCompetitors });
  },
  
  /**
   * Обрабатывает стратегию ИИ-компаний
   * @returns {Array} - Обновленный массив конкурентов
   */
  processAIBehavior: () => {
    console.log('Обработка поведения ИИ-конкурентов');
    const { competitors, currentDate, potentialUsers } = get();
    const updatedCompetitors = [...competitors];
    
    // Получим все типы продуктов и требования к ним
    const productTypes = getProductTypes();
    const productRequirements = getProductRequirements();
    
    // Сортируем компании по их оценке для определения топов и аутсайдеров
    updatedCompetitors.sort((a, b) => b.valuation - a.valuation);
    
    // Топ 10% компаний, которые могут приобретать другие
    const topCompanyCount = Math.max(1, Math.floor(updatedCompetitors.length * AI_COMPANY_CONFIG.TOP_ACQUIRER_PERCENTAGE));
    
    // Нижние 50% компаний, которые могут быть приобретены
    const bottomCompanyStartIdx = Math.floor(updatedCompetitors.length * (1 - AI_COMPANY_CONFIG.BOTTOM_ACQUISITION_TARGET_PERCENTAGE));
    
    // Цикл по всем компаниям-конкурентам
    for (let i = 0; i < updatedCompetitors.length; i++) {
      const competitor = updatedCompetitors[i];
      
      // 1. Обновление существующих продуктов
      competitor.products = competitor.products.map(product => {
        // Обновляем качество продукта (возможная деградация со временем)
        const updatedQuality = calculateQualityDegradation(product, currentDate);
        
        // Рассчитываем изменение пользователей
        const isBillionUsers = product.users > 1000000000;
        const growthRate = calculateUserGrowthRate({ ...product, quality: updatedQuality }, isBillionUsers);
        
        // Шанс улучшения продукта компанией
        let qualityBoost = 0;
        if (Math.random() < AI_COMPANY_CONFIG.PRODUCT_IMPROVEMENT_CHANCE) {
          // Топовые компании чаще улучшают продукты сильнее
          qualityBoost = i < topCompanyCount ? 
            Math.floor(Math.random() * 3) + 1 : // +1-3 для топовых компаний
            Math.floor(Math.random() * 2) + 1;  // +1-2 для обычных компаний
          
          // Обновление даты последнего улучшения
          product.lastUpdated = new Date(currentDate);
        }
        
        // Ограничение пользователей
        const maxUsersForType = potentialUsers * 0.3; // максимально 30% пользователей на тип продукта
        const newUsers = Math.min(
          maxUsersForType,
          Math.max(0, product.users * (1 + growthRate))
        );
        
        return {
          ...product,
          quality: Math.min(10, updatedQuality + qualityBoost),
          users: Math.floor(newUsers)
        };
      });
      
      // 2. Возможное создание нового продукта
      if (Math.random() < AI_COMPANY_CONFIG.NEW_PRODUCT_CHANCE * (i < topCompanyCount ? 3 : 1)) {
        // Выбор случайного типа продукта, которого еще нет у компании
        const existingTypes = new Set(competitor.products.map(p => p.type));
        const availableTypes = productTypes.filter(type => !existingTypes.has(type));
        
        if (availableTypes.length > 0) {
          const newProductType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
          
          // Топовые компании создают продукты лучшего качества
          const qualityRange = i < topCompanyCount ? [4, 8] : [2, 6];
          const usersRange = i < topCompanyCount ? [10000, 500000] : [0, 100000];
          
          // Создаем новый продукт
          const newProduct = createAIProduct(
            competitor.name, 
            newProductType, 
            currentDate, 
            { 
              initialQuality: qualityRange,
              initialUsers: usersRange
            }
          );
          
          competitor.products.push(newProduct);
        }
      }
      
      // 3. Попытка приобретения других компаний (только для топ компаний)
      if (i < topCompanyCount && Math.random() < AI_COMPANY_CONFIG.ACQUISITION_PROBABILITY) {
        // Выбираем случайную компанию из нижнего списка для приобретения
        const targetIdx = bottomCompanyStartIdx + Math.floor(Math.random() * (updatedCompetitors.length - bottomCompanyStartIdx));
        
        // Проверяем, что индекс не указывает на текущую компанию и цель существует
        if (targetIdx !== i && targetIdx < updatedCompetitors.length) {
          const targetCompany = updatedCompetitors[targetIdx];
          
          // Стоимость приобретения = 2x оценки компании
          const acquisitionPrice = targetCompany.valuation * 2;
          
          // Проверка, что компания может позволить себе приобретение
          // (предположим, что у AI-компаний всегда есть наличные в размере 20% их оценки)
          const estimatedCash = competitor.valuation * 0.2;
          
          if (estimatedCash >= acquisitionPrice) {
            // Создаем запись о приобретении
            if (!competitor.acquiredCompanies) {
              competitor.acquiredCompanies = [];
            }
            
            competitor.acquiredCompanies.push({
              id: targetCompany.id,
              name: targetCompany.name,
              acquisitionDate: new Date(currentDate),
              acquisitionPrice: acquisitionPrice,
              valuation: targetCompany.valuation,
              productCount: targetCompany.products.length
            });
            
            // Добавляем продукты приобретенной компании
            competitor.products = [
              ...competitor.products,
              ...targetCompany.products.map(product => ({
                ...product,
                name: `${product.name} (Acquired)`
              }))
            ];
            
            // Увеличиваем оценку поглощающей компании
            competitor.valuation += targetCompany.valuation * 0.5;
            
            // Удаляем поглощенную компанию из списка
            updatedCompetitors.splice(targetIdx, 1);
            
            // Корректируем индекс цикла, если нужно
            if (i > targetIdx) {
              i--;
            }
          }
        }
      }
      
      // 4. Пересчет оценки компании на основе ее продуктов
      const totalUsers = competitor.products.reduce((sum, product) => sum + product.users, 0);
      const totalQuality = competitor.products.reduce((sum, product) => sum + product.quality, 0);
      const avgQuality = competitor.products.length > 0 ? totalQuality / competitor.products.length : 0;
      
      // Используем те же метрики, что и для компании игрока
      competitor.valuation = Math.max(
        1000000, // Минимальная оценка в $1M
        totalUsers * BUSINESS_METRICS.VALUATION_PER_USER + 
        avgQuality * BUSINESS_METRICS.VALUATION_QUALITY_MULTIPLIER
      );
    }
    
    // Возвращаем обновленный список конкурентов
    return updatedCompetitors;
  }
});

export default createMarketSlice;
