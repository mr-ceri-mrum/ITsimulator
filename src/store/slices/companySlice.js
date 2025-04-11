/**
 * Срез хранилища для управления компанией игрока
 */
import { INITIAL_COMPANY_STATE, COMPANY } from '../../constants/gameConfig';
import { createProduct, calculateProductQuality } from '../../models/Product';
import { getProductRequirements } from '../../utils/productRequirements';

/**
 * Создает срез для управления компанией игрока
 */
const createCompanySlice = (set, get) => ({
  // Начальное состояние компании
  company: INITIAL_COMPANY_STATE || COMPANY || {
    name: '',
    founded: new Date(2004, 0, 1),
    cash: 1000000,
    valuation: 1000000,
    employees: 0,
    servers: 0,
    products: [],
    monthlyIncome: 0,
    monthlyExpenses: 0,
    marketingBudget: 0,
    acquiredCompanies: [],
    taxesPaid: 0,
    monthlyTaxes: 0,
  },
  
  /**
   * Нанимает указанное количество сотрудников
   * @param {number} count - Количество сотрудников для найма
   * @returns {boolean} - Успешно ли выполнена операция
   */
  hireEmployees: (count) => {
    console.log('Найм сотрудников:', count);
    const { company } = get();
    const cost = count * 10000; // $10k per employee
    
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
    console.log('Добавление серверов:', count);
    const { company } = get();
    const cost = count * 1000; // $1k per server initially
    
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
    console.log('Установка маркетингового бюджета:', budget);
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
    console.log('Приобретение компании:', competitorId);
    const { company, competitors } = get();
    
    // Находим конкурента для приобретения
    const competitorIndex = competitors.findIndex(c => c.id === competitorId);
    if (competitorIndex === -1) return false; // Конкурент не найден
    
    const competitor = competitors[competitorIndex];
    
    // Рассчитываем стоимость приобретения (2x оценки)
    const acquisitionCost = competitor.valuation * 2;
    
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
    const acquiredCompany = {
      id: competitor.id,
      name: competitor.name,
      acquisitionDate: new Date(get().currentDate),
      acquisitionPrice: acquisitionCost,
      valuation: competitor.valuation,
      productCount: competitor.products.length
    };
    
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
    console.log('Начинается разработка продукта:', name, productType, resources);
    const { company } = get();
    
    // Создает новый продукт
    const product = {
      id: Date.now(),
      type: productType,
      name,
      developmentProgress: 0,
      developmentResources: resources,
      launchDate: null,
      quality: 0,
      users: 0,
      employees: 0,
      isInDevelopment: true,
    };
    
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
    console.log('Обновление прогресса разработки:', productId, progress);
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
    console.log('Запуск продукта:', productId);
    const { currentDate } = get();
    
    set(state => {
      const productRequirements = getProductRequirements();
      
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId && product.developmentProgress >= 100) {
          // Рассчитываем качество продукта
          const idealDistribution = productRequirements[product.type] || { 
            backend: 20, frontend: 20, infra: 20, ai: 20, db: 20 
          };
          
          let matchScore = 0;
          const resourceTypes = ['backend', 'frontend', 'infra', 'ai', 'db'];
          
          resourceTypes.forEach(type => {
            // Расчет насколько близко распределение ресурсов к идеальному
            const diff = Math.abs(product.developmentResources[type] - idealDistribution[type]);
            const typeScore = Math.max(0, 100 - diff * 2); // 0-100 шкала
            matchScore += typeScore;
          });
          
          // Средний показатель по всем ресурсам
          const avgMatchScore = matchScore / resourceTypes.length;
          
          // Конвертация в шкалу качества 0-10
          const quality = Math.round(avgMatchScore / 10);
          
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
    console.log('Обновление продукта:', productId, updateType);
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
    console.log('Обновление компании:', updates);
    set(state => ({
      company: {
        ...state.company,
        ...updates
      }
    }));
  }
});

export default createCompanySlice;
