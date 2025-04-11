/**
 * Срез хранилища для реализации игрового тика
 * Основная игровая логика, которая выполняется на каждом игровом шаге
 */
import { 
  MAX_GLOBAL_POPULATION, 
  MARKET_PARAMS, 
  BUSINESS_METRICS, 
  COSTS,
  CORPORATE_TAX_RATE
} from '../../constants/gameConfig';

/**
 * Создает срез для управления логикой игрового тика
 */
const createTickSlice = (set, get) => ({
  /**
   * Основная функция обновления игры - выполняется каждый игровой тик
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

      // Получим текущую компанию и ее продукты
      const company = state.company || { products: [] };
      
      // 3. Обработка разработки продуктов
      const updatedProducts = (company.products || []).map(product => {
        if (product.isInDevelopment) {
          // Прогресс разработки увеличивается на 5-15% в месяц
          const progress = 5 + Math.random() * 10;
          return {
            ...product,
            developmentProgress: Math.min(100, product.developmentProgress + progress)
          };
        } else {
          // Для выпущенных продуктов обновляем пользователей
          let newUsers = product.users || 0;
          
          // Базовый рост пользователей в зависимости от качества
          let growthRate = 0;
          
          // Разные коэффициенты роста для разных уровней качества
          if (product.quality >= 9) growthRate = 0.1;     // 10% рост
          else if (product.quality >= 7) growthRate = 0.06; // 6% рост
          else if (product.quality >= 5) growthRate = 0.02; // 2% рост
          else if (product.quality >= 3) growthRate = -0.01; // 1% падение
          else growthRate = -0.05;                         // 5% падение
          
          // Применяем коэффициент роста
          newUsers = Math.floor(newUsers * (1 + growthRate));
          
          // Добавляем пользователей от маркетинга, если есть бюджет
          if (company.marketingBudget > 0) {
            // Стоимость привлечения одного пользователя
            const acquisitionCost = newUsers > 1000000 ? 20 : 5;
            
            // Новые пользователи от маркетинга
            const marketingUsers = Math.floor(company.marketingBudget / acquisitionCost);
            newUsers += marketingUsers;
          }
          
          // Ограничиваем максимальное количество пользователей
          const maxUsers = newPotentialUsers * 0.4; // 40% максимум от всех потенциальных
          newUsers = Math.min(newUsers, maxUsers);
          
          return {
            ...product,
            users: newUsers
          };
        }
      });
      
      // 4. Расчет финансов
      let monthlyIncome = 0;
      let requiredEmployees = 0;
      let requiredServers = 0;
      
      // Считаем доходы и ресурсы для каждого продукта
      updatedProducts.forEach(product => {
        if (!product.isInDevelopment) {
          // Доход: $15 за пользователя
          const productRevenue = (product.users || 0) * (BUSINESS_METRICS?.REVENUE_PER_USER || 15);
          monthlyIncome += productRevenue;
          
          // Требуемые сотрудники: 1 на каждые 2000 пользователей + текущие сотрудники продукта
          const productEmployees = Math.ceil((product.users || 0) / 2000) + (product.employees || 0);
          requiredEmployees += productEmployees;
          
          // Требуемые серверы: 1 на каждые 300 пользователей
          const productServers = Math.ceil((product.users || 0) / 300);
          requiredServers += productServers;
        }
      });
      
      // Расходы
      const employeeCost = requiredEmployees * (COSTS?.EMPLOYEE_COST || 10000);
      const serverCost = requiredServers * (COSTS?.SERVER_COST || 10);
      const marketingCost = company.marketingBudget || 0;
      
      // Общие расходы без налогов
      const preTaxExpenses = employeeCost + serverCost + marketingCost;
      
      // Прибыль до налогов
      const profitBeforeTax = monthlyIncome - preTaxExpenses;
      
      // Налоги
      const taxAmount = profitBeforeTax > 0 
        ? profitBeforeTax * (CORPORATE_TAX_RATE || 0.23) 
        : 0;
      
      // Общие расходы с налогами
      const totalExpenses = preTaxExpenses + taxAmount;
      
      // Обновление денег
      const newCash = (company.cash || 0) + monthlyIncome - totalExpenses;
      
      // Расчет валюации компании
      const totalUsers = updatedProducts.reduce((sum, product) => 
        sum + (product.isInDevelopment ? 0 : (product.users || 0)), 0);
      
      const activeProducts = updatedProducts.filter(p => !p.isInDevelopment);
      
      const avgQuality = activeProducts.length > 0 
        ? activeProducts.reduce((sum, p) => sum + (p.quality || 0), 0) / activeProducts.length 
        : 0;
      
      const newValuation = Math.max(
        0,
        totalUsers * (BUSINESS_METRICS?.VALUATION_PER_USER || 20) + 
        newCash * (BUSINESS_METRICS?.VALUATION_CASH_MULTIPLIER || 2) + 
        avgQuality * (BUSINESS_METRICS?.VALUATION_QUALITY_MULTIPLIER || 10000000)
      );
      
      // 5. Обновление конкурентов
      let updatedCompetitors = [...(state.competitors || [])];
      
      // Базовое обновление конкурентов
      if (typeof get().processAIBehavior === 'function') {
        try {
          updatedCompetitors = get().processAIBehavior();
        } catch (err) {
          console.error('Ошибка при обработке поведения ИИ:', err);
        }
      }
      
      // 6. Возвращаем обновленное состояние
      return {
        currentDate: newDate,
        potentialUsers: newPotentialUsers,
        company: {
          ...company,
          products: updatedProducts,
          cash: newCash,
          valuation: newValuation,
          employees: requiredEmployees,
          servers: requiredServers,
          monthlyIncome: monthlyIncome,
          monthlyExpenses: totalExpenses,
          monthlyTaxes: taxAmount,
          taxesPaid: (company.taxesPaid || 0) + taxAmount
        },
        competitors: updatedCompetitors
      };
    });
  }
});

export default createTickSlice;
