/**
 * Модель продукта для компаний
 */

/**
 * Создает новый продукт в разработке
 * @param {string} productType - Тип продукта
 * @param {string} name - Название продукта
 * @param {Object} resources - Ресурсы, выделенные на разработку ({backend, frontend, infra, ai, db})
 * @returns {Object} - Объект продукта в разработке
 */
export const createProduct = (productType, name, resources) => {
  return {
    id: Date.now(),
    type: productType,
    name,
    developmentProgress: 0,
    developmentResources: resources, // { backend: 0-100, frontend: 0-100, infra: 0-100, ai: 0-100, db: 0-100 }
    launchDate: null,
    quality: 0,
    users: 0,
    employees: 0,
    isInDevelopment: true,
  };
};

/**
 * Создает новый продукт для ИИ-компании
 * @param {string} companyName - Название компании
 * @param {string} productType - Тип продукта
 * @param {Date} currentDate - Текущая дата
 * @param {Object} options - Дополнительные опции
 * @returns {Object} - Объект продукта ИИ-компании
 */
export const createAIProduct = (companyName, productType, currentDate, options = {}) => {
  const { 
    initialQuality = [2, 5], // Диапазон для начального качества [мин, макс]
    initialUsers = [0, 100000], // Диапазон для начального количества пользователей [мин, макс]
  } = options;
  
  const quality = Math.floor(Math.random() * (initialQuality[1] - initialQuality[0] + 1)) + initialQuality[0];
  const users = Math.floor(Math.random() * (initialUsers[1] - initialUsers[0] + 1)) + initialUsers[0];
  
  return {
    id: Date.now() + Math.random(),
    type: productType,
    name: `${companyName} ${productType}`,
    quality,
    users,
    launchDate: new Date(currentDate)
  };
};

/**
 * Рассчитывает качество продукта на основе выделенных ресурсов и идеального распределения
 * @param {Object} product - Объект продукта
 * @param {Object} idealDistribution - Идеальное распределение ресурсов
 * @returns {number} - Качество продукта (0-10)
 */
export const calculateProductQuality = (product, idealDistribution) => {
  const defaultIdealDistribution = { 
    backend: 20, frontend: 20, infra: 20, ai: 20, db: 20 
  };
  
  const distribution = idealDistribution || defaultIdealDistribution;
  let matchScore = 0;
  const resourceTypes = ['backend', 'frontend', 'infra', 'ai', 'db'];
  
  resourceTypes.forEach(type => {
    // Расчет насколько близко распределение ресурсов к идеальному (100 = идеальное совпадение, 0 = полное несовпадение)
    const diff = Math.abs(product.developmentResources[type] - distribution[type]);
    const typeScore = Math.max(0, 100 - diff * 2); // Шкала 0-100
    matchScore += typeScore;
  });
  
  // Средний показатель по всем 5 типам ресурсов (0-100)
  const avgMatchScore = matchScore / resourceTypes.length;
  
  // Преобразование в шкалу качества 0-10
  return Math.round(avgMatchScore / 10);
};

/**
 * Рассчитывает рост пользователей продукта на основе его качества
 * @param {Object} product - Объект продукта
 * @param {boolean} isBillionUsers - Имеет ли продукт более миллиарда пользователей
 * @returns {number} - Месячный коэффициент роста
 */
export const calculateUserGrowthRate = (product, isBillionUsers = false) => {
  const quality = product.quality;
  
  if (isBillionUsers) {
    // Особые правила роста для продуктов с более чем 1 миллиардом пользователей
    switch (quality) {
      case 10: return 0.00083; // ~1% в год
      case 9: return 0;        // Стабильно
      case 8: return -0.00583; // ~-7% в год
      case 7: return -0.01;    // Быстрое снижение
      case 6: return -0.015;   // Еще быстрее
      default: return -0.02;   // Еще быстрее для качества < 6
    }
  } else {
    // Стандартные коэффициенты роста для продуктов с менее чем 1 миллиардом пользователей
    switch (quality) {
      case 10: return 0.1;
      case 9: return 0.08;
      case 8: return 0.06;
      case 7: return 0.04;
      case 6: return 0.01;
      case 5: return -0.01;
      case 4: return -0.05;
      case 3: return -0.1;
      case 2: return -0.15;
      case 1: return -0.2;
      default: return 0;
    }
  }
};

/**
 * Рассчитывает деградацию качества продукта с течением времени
 * @param {Object} product - Объект продукта
 * @param {Date} currentDate - Текущая дата
 * @returns {number} - Новое качество продукта
 */
export const calculateQualityDegradation = (product, currentDate) => {
  const lastUpdatedDate = product.lastUpdated ? new Date(product.lastUpdated) : new Date(product.launchDate);
  const fullYearsPassed = Math.floor((currentDate - lastUpdatedDate) / (1000 * 60 * 60 * 24 * 365));
  
  // Деградация качества происходит только если прошел полный год
  if (fullYearsPassed > 0) {
    return Math.max(1, product.quality - 2 * fullYearsPassed); // Снижение на 2 пункта в год
  }
  
  return product.quality;
};

/**
 * Рассчитывает необходимые ресурсы для поддержки продукта
 * @param {Object} product - Объект продукта
 * @param {Object} metrics - Метрики для расчета
 * @returns {Object} - Необходимые ресурсы {employees, servers}
 */
export const calculateRequiredResources = (product, metrics) => {
  if (product.isInDevelopment) {
    return { employees: 0, servers: 0 };
  }
  
  const employees = Math.ceil(product.users / metrics.USERS_PER_EMPLOYEE) + product.employees;
  const servers = Math.ceil(product.users / metrics.USERS_PER_SERVER);
  
  return { employees, servers };
};
