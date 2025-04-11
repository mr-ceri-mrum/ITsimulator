/**
 * Срез хранилища для управления рынком и конкурентами
 */
import { 
  INITIAL_POTENTIAL_USERS, 
  AI_COMPANY_CONFIG, 
  PRODUCT_TYPES, 
  COSTS 
} from '../../constants/gameConfig';
import { generateRandomCompanies } from '../../utils/aiCompanies';
import { createAIProduct, calculateUserGrowthRate } from '../../models/Product';

/**
 * Создает срез для управления рынком и конкурентами
 */
const createMarketSlice = (set, get) => ({
  // Начальные данные рынка
  potentialUsers: INITIAL_POTENTIAL_USERS,
  competitors: [],
  
  /**
   * Генерирует конкурентов при запуске игры
   */
  generateCompetitors: () => {
    const competitors = generateRandomCompanies(AI_COMPANY_CONFIG.INITIAL_COUNT);
    set({ competitors });
  },
  
  /**
   * Обновляет количество потенциальных пользователей
   * @param {number} newPotentialUsers - Новое количество потенциальных пользователей
   */
  updatePotentialUsers: (newPotentialUsers) => {
    set({ potentialUsers: newPotentialUsers });
  },
  
  /**
   * Обновляет данные конкурентов
   * @param {Array} updatedCompetitors - Обновленный массив конкурентов
   */
  updateCompetitors: (updatedCompetitors) => {
    set({ competitors: updatedCompetitors });
  },
  
  /**
   * Обрабатывает стратегию ИИ-компаний
   * Обновляет продукты, качество, пользователей и пытается совершать приобретения
   * @returns {Array} - Обновленный массив конкурентов
   */
  processAIBehavior: () => {
    const { competitors, currentDate, potentialUsers } = get();
    
    // Обработка приобретений ИИ-компаний
    const processAIAcquisitions = () => {
      // Копируем массив конкурентов
      let updatedCompetitors = [...competitors];
      
      // Сортируем конкурентов по оценке (самые богатые первыми)
      const sortedCompetitors = [...updatedCompetitors].sort((a, b) => b.valuation - a.valuation);
      
      // Только верхние компании могут приобретать других
      const acquirerCount = Math.max(1, Math.floor(sortedCompetitors.length * AI_COMPANY_CONFIG.TOP_ACQUIRER_PERCENTAGE));
      const potentialAcquirers = sortedCompetitors.slice(0, acquirerCount);
      
      for (const acquirer of potentialAcquirers) {
        // Шанс на попытку приобретения
        if (Math.random() > AI_COMPANY_CONFIG.ACQUISITION_PROBABILITY) continue;
        
        // Находим меньшую компанию для приобретения (нижние компании)
        const targetIndex = Math.floor(Math.random() * Math.floor(sortedCompetitors.length * AI_COMPANY_CONFIG.BOTTOM_ACQUISITION_TARGET_PERCENTAGE)) + 
                            Math.floor(sortedCompetitors.length * (1 - AI_COMPANY_CONFIG.BOTTOM_ACQUISITION_TARGET_PERCENTAGE));
        
        if (targetIndex >= sortedCompetitors.length) continue;
        
        const target = sortedCompetitors[targetIndex];
        
        // Пропускаем, если пытаемся приобрести себя
        if (acquirer.id === target.id) continue;
        
        // Рассчитываем стоимость приобретения (2x оценки)
        const acquisitionPrice = target.valuation * COSTS.ACQUISITION_MULTIPLIER;
        
        // Проверяем, может ли приобретающая компания позволить себе это (нужно иметь минимум 3x оценки в наличных)
        if (acquirer.valuation < acquisitionPrice * 3) continue;
        
        // Выполняем приобретение
        const targetCompetitorIndex = updatedCompetitors.findIndex(c => c.id === target.id);
        
        if (targetCompetitorIndex !== -1) {
          // Удаляем целевую компанию из списка конкурентов
          const targetCompetitor = updatedCompetitors[targetCompetitorIndex];
          updatedCompetitors.splice(targetCompetitorIndex, 1);
          
          // Находим приобретающую компанию в обновленном списке
          const acquirerIndex = updatedCompetitors.findIndex(c => c.id === acquirer.id);
          
          if (acquirerIndex !== -1) {
            // Добавляем продукты целевой компании приобретающей
            const acquirerCompetitor = updatedCompetitors[acquirerIndex];
            
            // Записываем приобретение в историю
            const acquiredCompany = {
              id: targetCompetitor.id,
              name: targetCompetitor.name,
              acquisitionDate: new Date(currentDate),
              acquisitionPrice: acquisitionPrice,
              productCount: targetCompetitor.products.length
            };
            
            // Обновляем приобретающую компанию
            updatedCompetitors[acquirerIndex] = {
              ...acquirerCompetitor,
              products: [
                ...acquirerCompetitor.products,
                ...targetCompetitor.products.map(product => ({
                  ...product,
                  name: `${product.name} (Приобретен ${acquirerCompetitor.name})`
                }))
              ],
              acquiredCompanies: [
                ...(acquirerCompetitor.acquiredCompanies || []),
                acquiredCompany
              ]
            };
          }
        }
      }
      
      return updatedCompetitors;
    };
    
    // Обработка обычного поведения ИИ-конкурентов
    const processRegularAIBehavior = (competitors) => {
      return competitors.map(competitor => {
        // Обновляем продукты
        const updatedProducts = competitor.products.map(product => {
          // Случайный шанс улучшить продукт
          const shouldImprove = Math.random() < AI_COMPANY_CONFIG.PRODUCT_IMPROVEMENT_CHANCE;
          let quality = product.quality;
          
          if (shouldImprove) {
            quality = Math.min(10, quality + 1);
          } else if (Math.random() < AI_COMPANY_CONFIG.PRODUCT_DEGRADATION_CHANCE) {
            // Случайный шанс деградации
            quality = Math.max(1, quality - 1);
          }
          
          // Обновляем пользователей на основе качества
          const isBillionUsers = product.users >= 1000000000;
          const growthRate = calculateUserGrowthRate(
            { ...product, quality }, // Используем обновленное качество
            isBillionUsers
          );
          
          // Рассчитываем новых пользователей с коэффициентом роста
          let newUsers = Math.max(0, Math.floor(product.users * (1 + growthRate)));
          
          // Ограничиваем пользователей на уровне 30% потенциального рынка
          const aiMarketCap = potentialUsers * 0.3; 
          newUsers = Math.min(newUsers, aiMarketCap);
          
          return {
            ...product,
            quality,
            users: newUsers
          };
        });
        
        // Случайный шанс добавить новый продукт
        let finalProducts = [...updatedProducts];
        if (Math.random() < AI_COMPANY_CONFIG.NEW_PRODUCT_CHANCE) {
          const productType = PRODUCT_TYPES[Math.floor(Math.random() * PRODUCT_TYPES.length)];
          
          // Создаем новый продукт с меньшим количеством пользователей
          const newProduct = createAIProduct(competitor.name, productType, currentDate, {
            initialQuality: [2, 5],
            initialUsers: [0, 100000]
          });
          
          finalProducts.push(newProduct);
        }
        
        // Рассчитываем новую оценку
        const totalUsers = finalProducts.reduce((sum, product) => sum + product.users, 0);
        const avgQuality = finalProducts.length > 0 ? 
          finalProducts.reduce((sum, product) => sum + product.quality, 0) / finalProducts.length : 0;
        
        const newValuation = totalUsers * 20 + avgQuality * 10000000;
        
        return {
          ...competitor,
          products: finalProducts,
          valuation: newValuation,
          acquiredCompanies: competitor.acquiredCompanies || [] // Гарантируем наличие этого массива
        };
      });
    };
    
    // Выполняем обе части обработки
    let updatedCompetitors = processAIAcquisitions();
    updatedCompetitors = processRegularAIBehavior(updatedCompetitors);
    
    // Обновляем состояние
    set({ competitors: updatedCompetitors });
    
    return updatedCompetitors;
  }
});

export default createMarketSlice;
