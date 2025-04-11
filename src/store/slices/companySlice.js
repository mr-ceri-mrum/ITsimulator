/**
 * Срез хранилища для управления компанией игрока
 */
import { INITIAL_COMPANY_STATE, COSTS } from '../../constants/gameConfig';
import { createCompany, createAcquiredCompany } from '../../models/Company';
import { createProduct, calculateProductQuality } from '../../models/Product';
import { getProductRequirements } from '../../utils/productRequirements';

/**
 * Создает срез для управления компанией игрока
 */
const createCompanySlice = (set, get) => ({
  // Начальное состояние компании
  company: createCompany(INITIAL_COMPANY_STATE),
  
  /**
   * Нанимает указанное количество сотрудников
   * @param {number} count - Количество сотрудников для найма
   * @returns {boolean} - Успешно ли выполнена операция
   */
  hireEmployees: (count) => {
    const { company } = get();
    const cost = count * COSTS.EMPLOYEE_COST;
    
    if (company.cash >= cost) {
      set({
        company: {
          ...company,
          employees: company.employees + count,
          cash: company.cash - cost,
        }
      });
      return true;
    }
    return false; // Недостаточно наличных
  },
  
  /**
   * Добавляет указанное количество серверов
   * @param {number} count - Количество серверов для добавления
   * @returns {boolean} - Успешно ли выполнена операция
   */
  addServers: (count) => {
    const { company } = get();
    const cost = count * COSTS.SERVER_COST;
    
    if (company.cash >= cost) {
      set({
        company: {
          ...company,
          servers: company.servers + count,
          cash: company.cash - cost,
        }
      });
      return true;
    }
    return false; // Недостаточно наличных
  },
  
  /**
   * Устанавливает бюджет на маркетинг
   * @param {number} budget - Размер бюджета на маркетинг
   */
  setMarketingBudget: (budget) => {
    set(state => ({
      company: {
        ...state.company,
        marketingBudget: budget
      }
    }));
  },
  
  /**
   * Приобретает компанию-конкурента
   * @param {string} competitorId - ID компании-конкурента
   * @returns {boolean} - Успешно ли выполнена операция
   */
  acquireCompany: (competitorId) => {
    const { company, competitors } = get();
    
    // Находим конкурента для приобретения
    const competitorIndex = competitors.findIndex(c => c.id === competitorId);
    if (competitorIndex === -1) return false; // Конкурент не найден
    
    const competitor = competitors[competitorIndex];
    
    // Рассчитываем стоимость приобретения (2x оценки)
    const acquisitionCost = competitor.valuation * COSTS.ACQUISITION_MULTIPLIER;
    
    // Проверяем, достаточно ли у компании наличных
    if (company.cash < acquisitionCost) {
      return false; // Недостаточно наличных для приобретения
    }
    
    // Создаем копию конкурентов без приобретенного
    const updatedCompetitors = [
      ...competitors.slice(0, competitorIndex),
      ...competitors.slice(competitorIndex + 1)
    ];
    
    // Добавляем продукты конкурента в компанию игрока
    const updatedProducts = [
      ...company.products,
      ...competitor.products.map(product => ({
        ...product,
        name: `${product.name} (Приобретен)` // Помечаем как приобретенный
      }))
    ];
    
    // Записываем информацию о приобретении
    const acquiredCompany = createAcquiredCompany(
      competitor, 
      get().currentDate, 
      acquisitionCost
    );
    
    set({
      competitors: updatedCompetitors,
      company: {
        ...company,
        cash: company.cash - acquisitionCost,
        products: updatedProducts,
        acquiredCompanies: [...company.acquiredCompanies, acquiredCompany]
      }
    });
    
    return true;
  },
  
  /**
   * Начинает разработку нового продукта
   * @param {string} productType - Тип продукта
   * @param {string} name - Название продукта
   * @param {Object} resources - Ресурсы для разработки
   * @returns {string} - ID созданного продукта
   */
  startProductDevelopment: (productType, name, resources) => {
    const { company } = get();
    const product = createProduct(productType, name, resources);
    
    set({
      company: {
        ...company,
        products: [...company.products, product],
      }
    });
    
    return product.id;
  },
  
  /**
   * Обновляет прогресс разработки продукта
   * @param {string} productId - ID продукта
   * @param {number} progress - Величина прогресса для добавления
   */
  updateProductDevelopment: (productId, progress) => {
    set(state => {
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            developmentProgress: Math.min(100, product.developmentProgress + progress)
          };
        }
        return product;
      });
      
      return {
        company: {
          ...state.company,
          products: updatedProducts
        }
      };
    });
  },
  
  /**
   * Запускает готовый продукт на рынок
   * @param {string} productId - ID продукта
   * @returns {boolean} - Успешно ли выполнен запуск
   */
  launchProduct: (productId) => {
    const { currentDate } = get();
    
    set(state => {
      const productRequirements = getProductRequirements();
      
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId && product.developmentProgress >= 100) {
          // Рассчитываем качество продукта
          const idealDistribution = productRequirements[product.type] || { 
            backend: 20, frontend: 20, infra: 20, ai: 20, db: 20 
          };
          
          const quality = calculateProductQuality(product, idealDistribution);
          
          return {
            ...product,
            isInDevelopment: false,
            launchDate: new Date(currentDate),
            quality,
            employees: Math.ceil(5 + (Math.random() * 5)), // Начальная команда для поддержки продукта
          };
        }
        return product;
      });
      
      return {
        company: {
          ...state.company,
          products: updatedProducts
        }
      };
    });
    
    return true;
  },
  
  /**
   * Обновляет существующий продукт
   * @param {string} productId - ID продукта
   * @param {string} updateType - Тип обновления (maintain|minor|major)
   */
  updateProduct: (productId, updateType) => {
    const { currentDate } = get();
    
    set(state => {
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId && !product.isInDevelopment) {
          let qualityIncrease = 0;
          let requiredEmployees = 0;
          
          if (updateType === 'maintain') {
            qualityIncrease = 0; // Только предотвращает деградацию
            requiredEmployees = Math.ceil(product.users / 2000 * 0.3); // На 30% больше базового уровня
          } else if (updateType === 'minor') {
            qualityIncrease = 1;
            requiredEmployees = Math.ceil(product.users / 2000 * 0.5); // На 50% больше базового уровня
          } else if (updateType === 'major') {
            qualityIncrease = 2;
            requiredEmployees = Math.ceil(product.users / 2000 * 0.8); // На 80% больше базового уровня
          }
          
          return {
            ...product,
            quality: Math.min(10, product.quality + qualityIncrease),
            employees: product.employees + requiredEmployees,
            lastUpdated: new Date(currentDate)
          };
        }
        return product;
      });
      
      return {
        company: {
          ...state.company,
          products: updatedProducts
        }
      };
    });
  },
  
  /**
   * Обновляет информацию о компании
   * @param {Object} updates - Объект с обновляемыми полями
   */
  updateCompany: (updates) => {
    set(state => ({
      company: {
        ...state.company,
        ...updates
      }
    }));
  }
});

export default createCompanySlice;
