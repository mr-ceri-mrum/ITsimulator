/**
 * Срез хранилища для реализации игрового тика (шага игры)
 * Основная игровая логика, которая выполняется на каждом игровом шаге
 */
import { 
  MAX_GLOBAL_POPULATION, 
  MARKET_PARAMS, 
  BUSINESS_METRICS, 
  COSTS,
  CORPORATE_TAX_RATE
} from '../../constants/gameConfig';
import { calculateValuation } from '../../models/Company';
import { 
  calculateQualityDegradation, 
  calculateUserGrowthRate, 
  calculateRequiredResources 
} from '../../models/Product';

/**
 * Создает срез для управления логикой игрового тика
 */
const createTickSlice = (set, get) => ({
  /**
   * Основная функция обновления игры - выполняется каждый игровой тик
   * Симулирует прохождение одного месяца в игре
   */
  tick: () => {
    // Пропускаем, если игра на паузе
    if (get().isPaused) return;
    
    set(state => {
      // 1. Создаем новую дату, добавляя один месяц
      const newDate = new Date(state.currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // 2. Увеличиваем потенциальную пользовательскую базу, ограничивая максимумом
      const newPotentialUsers = Math.min(
        MAX_GLOBAL_POPULATION, 
        state.potentialUsers + MARKET_PARAMS.MONTHLY_USER_GROWTH
      );
      
      // 3. Обрабатываем логику конкурентов
      const updatedCompetitors = get().processAIBehavior();
      
      // 4. Обрабатываем обновление продуктов компании
      const updatedProducts = processCompanyProducts(
        state.company.products, 
        newDate, 
        state.company.marketingBudget,
        newPotentialUsers,
        state.potentialUsers
      );
      
      // 5. Рассчитываем финансовые показатели
      const { 
        monthlyIncome, 
        monthlyExpenses, 
        requiredEmployees, 
        requiredServers, 
        taxAmount 
      } = calculateFinancials(
        updatedProducts, 
        state.company.employees, 
        state.company.marketingBudget,
        state.company.servers
      );
      
      // 6. Обновляем кассу
      const newCash = state.company.cash + monthlyIncome - monthlyExpenses;
      
      // 7. Автоматически корректируем штат, если позволяют средства
      let newEmployees = state.company.employees;
      if (requiredEmployees > newEmployees && newCash > (requiredEmployees - newEmployees) * COSTS.EMPLOYEE_COST) {
        newEmployees = requiredEmployees;
      }
      
      // 8. Обновляем оценку компании
      const newValuation = calculateValuation(
        {
          ...state.company,
          cash: newCash,
          products: updatedProducts
        }, 
        BUSINESS_METRICS
      );
      
      // 9. Обновляем сумму уплаченных налогов
      const totalTaxesPaid = state.company.taxesPaid + taxAmount;
      
      // 10. Возвращаем обновленное состояние
      return {
        currentDate: newDate,
        potentialUsers: newPotentialUsers,
        company: {
          ...state.company,
          cash: newCash,
          valuation: newValuation,
          products: updatedProducts,
          employees: newEmployees,
          servers: requiredServers, // Автоматически регулируемые серверы
          monthlyIncome,
          monthlyExpenses,
          monthlyTaxes: taxAmount,
          taxesPaid: totalTaxesPaid
        },
        competitors: updatedCompetitors
      };
    });
  }
});

/**
 * Обрабатывает продукты компании, обновляя их состояние
 * @param {Array} products - Массив продуктов компании
 * @param {Date} currentDate - Текущая дата
 * @param {number} marketingBudget - Маркетинговый бюджет
 * @param {number} potentialUsers - Количество потенциальных пользователей
 * @param {number} previousPotentialUsers - Количество потенциальных пользователей на прошлом шаге
 * @returns {Array} - Обновленный массив продуктов
 */
function processCompanyProducts(products, currentDate, marketingBudget, potentialUsers, previousPotentialUsers) {
  // Подсчитываем насыщенность рынка
  const calculateTotalUsers = () => {
    return products.reduce((sum, product) => {
      if (!product.isInDevelopment) {
        return sum + product.users;
      }
      return sum;
    }, 0);
  };
  
  const totalUsers = calculateTotalUsers();
  
  return products.map(product => {
    if (product.isInDevelopment) {
      // Логика для продуктов в разработке
      const progress = 5 + Math.random() * 10; // 5-15% прогресса в месяц
      return {
        ...product,
        developmentProgress: Math.min(100, product.developmentProgress + progress)
      };
    } else {
      // Логика для выпущенных продуктов
      // 1. Обновляем качество продукта (деградация со временем)
      const updatedQuality = calculateQualityDegradation(product, currentDate);
      
      // 2. Рассчитываем рост пользователей на основе качества
      const isBillionUsers = product.users >= 1000000000;
      const monthlyGrowthRate = calculateUserGrowthRate(
        { ...product, quality: updatedQuality },
        isBillionUsers
      );
      
      // 3. Применяем коэффициент роста
      let newUsers = Math.floor(product.users * (1 + monthlyGrowthRate));
      
      // 4. Добавляем пользователей от маркетинга с убывающей отдачей
      if (marketingBudget > 0) {
        // Рассчитываем коэффициент насыщения рынка (0-1, где 1 означает отсутствие насыщения)
        const marketSaturation = 1 - Math.min(1, totalUsers / potentialUsers);
        
        // Рассчитываем стоимость привлечения пользователя
        const userAcquisitionCost = totalUsers > 100000000 ? 20 : 5;
        
        // Применяем снижение эффективности маркетинга на основе насыщения
        const marketingEffectiveness = userAcquisitionCost * marketSaturation;
        const newUsersFromMarketing = Math.floor(marketingBudget / marketingEffectiveness);
        
        newUsers += newUsersFromMarketing;
      }
      
      // 5. Ограничиваем рост пользователей доступным рынком
      // Каждый продукт может захватить максимум 40% потенциального рынка
      const productMarketCap = potentialUsers * MARKET_PARAMS.MAX_PLAYER_MARKET_SHARE;
      newUsers = Math.min(newUsers, productMarketCap);
      
      return {
        ...product,
        users: newUsers,
        quality: updatedQuality
      };
    }
  });
}

/**
 * Рассчитывает финансовые показатели компании
 * @param {Array} products - Массив продуктов компании
 * @param {number} employees - Количество сотрудников
 * @param {number} marketingBudget - Маркетинговый бюджет
 * @param {number} currentServers - Текущее количество серверов
 * @returns {Object} - Финансовые показатели
 */
function calculateFinancials(products, employees, marketingBudget, currentServers) {
  // 1. Рассчитываем доход от продуктов
  let monthlyIncome = 0;
  let requiredEmployees = 0;
  let requiredServers = 0;
  
  products.forEach(product => {
    if (!product.isInDevelopment) {
      // Доход от продукта
      const productRevenue = product.users * BUSINESS_METRICS.REVENUE_PER_USER;
      monthlyIncome += productRevenue;
      
      // Требуемые ресурсы
      const resources = calculateRequiredResources(product, BUSINESS_METRICS);
      requiredEmployees += resources.employees;
      requiredServers += resources.servers;
    }
  });
  
  // 2. Рассчитываем расходы
  const employeeCost = employees * COSTS.EMPLOYEE_COST;
  const serverCost = requiredServers * COSTS.SERVER_COST;
  const marketingCost = marketingBudget;
  
  // 3. Расходы до налогов
  const preTaxExpenses = employeeCost + serverCost + marketingCost;
  
  // 4. Прибыль до налогов
  const profitBeforeTax = monthlyIncome - preTaxExpenses;
  
  // 5. Рассчитываем налоги (только на прибыль, без налогов при убытке)
  const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * CORPORATE_TAX_RATE : 0;
  
  // 6. Общие расходы с учетом налогов
  const monthlyExpenses = preTaxExpenses + taxAmount;
  
  return {
    monthlyIncome,
    monthlyExpenses,
    requiredEmployees,
    requiredServers,
    taxAmount,
    netProfit: monthlyIncome - monthlyExpenses
  };
}

export default createTickSlice;
