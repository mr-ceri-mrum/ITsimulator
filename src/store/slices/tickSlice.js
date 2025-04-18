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
import {
  calculateUserGrowthRate,
  calculateQualityDegradation,
  calculateMinEmployeesForUsers
} from '../../models/Product';

// Порог в 1 миллиард пользователей для применения особых правил роста
const BILLION_USERS_THRESHOLD = 1000000000;

/**
 * Создает срез для управления логикой игрового тика
 */
const createTickSlice = (set, get) => ({
  // Добавим флаг необходимости обновления сотрудников
  requiresEmployeeUpdate: false,
  
  // Добавим вычисленное количество необходимых сотрудников для информативных целей
  calculatedRequiredEmployees: 0,
  
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
        MAX_GLOBAL_POPULATION, 
        (state.potentialUsers || 5000000000) + (MARKET_PARAMS?.MONTHLY_USER_GROWTH || 20800000)
      );

      // Получим текущую компанию и ее продукты
      const company = state.company || { products: [] };
      
      // Рассчитаем общее необходимое количество сотрудников для всех продуктов
      let totalCalculatedRequired = 0;
      
      // Подсчитаем общее количество сотрудников в продуктах (product.employees)
      let totalProductTeamSize = 0;
      
      // Проверим общее количество пользователей в мире
      const calculateTotalWorldUsers = () => {
        let totalWorldUsers = 0;
        
        // Пользователи в продуктах игрока
        (company.products || []).forEach(product => {
          if (!product.isInDevelopment) {
            totalWorldUsers += (product.users || 0);
          }
        });
        
        // Пользователи в продуктах конкурентов
        (state.competitors || []).forEach(competitor => {
          (competitor.products || []).forEach(product => {
            totalWorldUsers += (product.users || 0);
          });
        });
        
        return totalWorldUsers;
      };
      
      // Общее количество пользователей в мире
      const totalWorldUsers = calculateTotalWorldUsers();
      
      // Рассчитаем масштабный коэффициент для ограничения роста, если мир перенаселен
      // Если общее количество пользователей превышает потенциальных пользователей,
      // все приросты должны быть пропорционально уменьшены
      const worldUserScaleFactor = totalWorldUsers > newPotentialUsers 
        ? Math.max(0.5, newPotentialUsers / Math.max(1, totalWorldUsers)) 
        : 1;
      
      // 3. Обработка разработки продуктов
      const updatedProducts = (company.products || []).map(product => {
        if (product.isInDevelopment) {
          // Прогресс разработки увеличивается на 5-15% в месяц
          const progress = 5 + Math.random() * 10;
          return {
            ...product,
            developmentProgress: Math.min(100, (product.developmentProgress || 0) + progress)
          };
        } else {
          // Для выпущенных продуктов обновляем пользователей
          let newUsers = product.users || 0;
          
          // Проверяем деградацию качества со временем
          const currentQuality = calculateQualityDegradation(product, newDate);
          
          // Добавляем количество сотрудников в общий счетчик
          totalProductTeamSize += product.employees || 0;
          
          // Рассчитываем необходимое количество сотрудников для этого продукта
          const requiredEmployeesForProduct = calculateMinEmployeesForUsers(newUsers);
          totalCalculatedRequired += requiredEmployeesForProduct;
          
          // Базовый рост пользователей в зависимости от качества
          // В зависимости от количества пользователей используем разную логику роста
          const isBillionUsers = newUsers >= BILLION_USERS_THRESHOLD;
          let growthRate = calculateUserGrowthRate(
            { ...product, quality: currentQuality }, 
            isBillionUsers
          );
          
          // ШТРАФ ЗА НЕДОСТАТОК СОТРУДНИКОВ
          // Если у продукта недостаточно сотрудников, применяем штраф к росту пользователей
          const currentProductEmployees = product.employees || 0;
          const employeeShortageRatio = Math.min(1, currentProductEmployees / Math.max(1, requiredEmployeesForProduct));
          
          // Если есть нехватка сотрудников, рост пользователей снижается или отток усиливается
          // Чем больше нехватка, тем больше штраф
          if (employeeShortageRatio < 1) {
            // Например, если у нас только 50% от необходимых сотрудников:
            // 1. Если рост положительный, он уменьшается на до 70%
            // 2. Если рост отрицательный, отток усиливается до 30%
            if (growthRate > 0) {
              // Снижение положительного роста
              growthRate *= employeeShortageRatio * 0.7 + 0.3; // Минимум 30% от исходного роста
            } else {
              // Усиление оттока (умножаем отрицательное значение на коэффициент > 1)
              growthRate *= 1 + (1 - employeeShortageRatio) * 0.3; // Усиление оттока до 30%
            }
            
            // Если сотрудников критически мало (менее 50%), добавляем дополнительный штраф к качеству
            if (employeeShortageRatio < 0.5 && currentQuality > 1) {
              // Симулируем временное ухудшение качества из-за недостатка сотрудников
              const qualityPenalty = Math.ceil((1 - employeeShortageRatio) * 2);
              const effectiveQuality = Math.max(1, currentQuality - qualityPenalty);
              
              // Пересчитываем рост с учетом штрафа к качеству
              growthRate = calculateUserGrowthRate(
                { ...product, quality: effectiveQuality }, 
                isBillionUsers
              );
            }
          }
          
          // ВАЖНО: Применяем коэффициент масштабирования мира, если общее количество 
          // пользователей превышает потенциальное население
          if (worldUserScaleFactor < 1 && growthRate > 0) {
            // Уменьшаем положительный рост
            growthRate *= worldUserScaleFactor;
          }
          
          // Применяем коэффициент роста с учетом всех корректировок
          newUsers = Math.floor(newUsers * (1 + growthRate));
          
          // Добавляем пользователей от маркетинга, если есть бюджет
          if (company.marketingBudget > 0) {
            // Стоимость привлечения одного пользователя
            const acquisitionCost = newUsers > 100000000 ? 20 : 5;
            
            // Новые пользователи от маркетинга
            // Если не хватает сотрудников, эффективность маркетинга также снижается
            const marketingEfficiency = Math.min(1, employeeShortageRatio * 0.8 + 0.2); // Минимум 20% эффективности
            
            // Также применяем мировой масштабный коэффициент к маркетинговым приобретениям
            const worldAdjustedEfficiency = marketingEfficiency * (growthRate > 0 ? worldUserScaleFactor : 1);
            
            const marketingUsers = Math.floor(company.marketingBudget / acquisitionCost * worldAdjustedEfficiency);
            newUsers += marketingUsers;
          }
          
          // Ограничиваем максимальное количество пользователей для продукта
          // Ни один продукт не может иметь более 40% от потенциальных пользователей
          const maxUsersForProduct = newPotentialUsers * 0.4; 
          newUsers = Math.min(newUsers, maxUsersForProduct);
          
          // Предотвращаем отрицательное число пользователей
          newUsers = Math.max(0, newUsers);
          
          return {
            ...product,
            quality: currentQuality,
            users: newUsers
          };
        }
      });
      
      // 4. Расчет финансов
      let monthlyIncome = 0;
      let requiredServers = 0;
      
      // Считаем доходы и ресурсы для каждого продукта
      updatedProducts.forEach(product => {
        if (!product.isInDevelopment) {
          // Базовый доход на пользователя
          let revenuePerUser = BUSINESS_METRICS?.REVENUE_PER_USER || 15;
          
          // Уменьшаем доход, если не хватает сотрудников (аналогично влиянию на рост)
          const requiredEmployeesForProduct = calculateMinEmployeesForUsers(product.users || 0);
          const currentProductEmployees = product.employees || 0;
          const employeeShortageRatio = Math.min(1, currentProductEmployees / Math.max(1, requiredEmployeesForProduct));
          
          if (employeeShortageRatio < 1) {
            // При нехватке сотрудников, доход на пользователя снижается
            // Например, если у нас 70% от нужных сотрудников, доход будет 85% от нормального
            revenuePerUser *= employeeShortageRatio * 0.5 + 0.5; // Минимум 50% от базового дохода
          }
          
          // Рассчитываем доход для продукта
          const productRevenue = (product.users || 0) * revenuePerUser;
          monthlyIncome += productRevenue;
          
          // Требуемые серверы: 1 на каждые 300 пользователей (серверы автоматически обновляются)
          const productServers = Math.ceil((product.users || 0) / (BUSINESS_METRICS?.USERS_PER_SERVER || 300));
          requiredServers += productServers;
        }
      });
      
      // Проверка, есть ли необходимость в обновлении количества сотрудников
      const needsMoreEmployees = totalCalculatedRequired > (company.employees || 0);
      
      // Используем фактическое количество сотрудников, а не требуемое (не автоматическое увеличение)
      const currentEmployees = company.employees || 0;
      
      // ВАЖНО: Расходы на персонал теперь должны включать и сотрудников продуктов
      // Базовая стоимость сотрудника
      const employeeCostBase = COSTS?.EMPLOYEE_COST || 10000;
      
      // Расходы на сотрудников компании (основной штат)
      const companyEmployeesCost = currentEmployees * employeeCostBase;
      
      // Расходы на команды продуктов (product.employees)
      const productTeamsCost = totalProductTeamSize * employeeCostBase;
      
      // Общие расходы на персонал
      const totalEmployeeCost = companyEmployeesCost + productTeamsCost;
      
      // Остальные расходы
      const serverCost = requiredServers * (COSTS?.SERVER_COST || 10);
      const marketingCost = company.marketingBudget || 0;
      
      // Общие расходы без налогов
      const preTaxExpenses = totalEmployeeCost + serverCost + marketingCost;
      
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
          
          // После обновления конкурентов, проверяем, не превышает ли общее количество
          // пользователей в мире допустимый предел
          const checkTotalUsers = () => {
            let total = 0;
            
            // Учитываем пользователей игрока
            updatedProducts.forEach(product => {
              if (!product.isInDevelopment) {
                total += product.users || 0;
              }
            });
            
            // Учитываем пользователей конкурентов
            updatedCompetitors.forEach(competitor => {
              (competitor.products || []).forEach(product => {
                total += product.users || 0;
              });
            });
            
            return total;
          };
          
          const updatedTotalUsers = checkTotalUsers();
          
          // Если после обновления конкурентов превышен лимит пользователей
          if (updatedTotalUsers > MAX_GLOBAL_POPULATION) {
            // Применяем корректировку ко всем конкурентам, пропорционально уменьшая
            // количество пользователей для всех продуктов
            const correctionFactor = MAX_GLOBAL_POPULATION / updatedTotalUsers;
            
            updatedCompetitors = updatedCompetitors.map(competitor => {
              const correctedProducts = (competitor.products || []).map(product => ({
                ...product,
                users: Math.floor((product.users || 0) * correctionFactor)
              }));
              
              return {
                ...competitor,
                products: correctedProducts
              };
            });
          }
        } catch (err) {
          console.error('Ошибка при обработке поведения ИИ:', err);
        }
      }
      
      // Показ уведомления о необходимости нанять больше сотрудников
      if (needsMoreEmployees && typeof get().showWarningNotification === 'function') {
        const additionalEmployeesNeeded = totalCalculatedRequired - currentEmployees;
        if (additionalEmployeesNeeded > 5) { // Показываем только если нужно больше 5 новых сотрудников
          get().showWarningNotification(
            `Требуется нанять еще ${additionalEmployeesNeeded} сотрудников для поддержки продуктов!`,
            8000
          );
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
          // Не обновляем сотрудников автоматически
          // employees: requiredEmployees, <-- удаляем эту строку
          servers: requiredServers,
          monthlyIncome: monthlyIncome,
          monthlyExpenses: totalExpenses,
          monthlyTaxes: taxAmount,
          taxesPaid: (company.taxesPaid || 0) + taxAmount
        },
        competitors: updatedCompetitors,
        requiresEmployeeUpdate: needsMoreEmployees,
        calculatedRequiredEmployees: totalCalculatedRequired
      };
    });
  }
});

export default createTickSlice;