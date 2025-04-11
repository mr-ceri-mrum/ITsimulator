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
  const quality = product.quality || 0;
  
  if (isBillionUsers) {
    // Особые правила роста для продуктов с более чем 1 миллиардом пользователей
    // Для огромных продуктов рост замедляется
    // +1% для высшего качества в год означает ~+0.083% в месяц
    switch (quality) {
      case 10: return 0.00083;     // +1% в год (~0.083% в месяц)
      case 9: return 0;            // 0% в год (стабильно)
      case 8: return -0.00583;     // -7% в год (~-0.583% в месяц)
      case 7: return -0.01;        // -12% в год (~-1% в месяц)
      case 6: return -0.015;       // -18% в год (~-1.5% в месяц)
      case 5: return -0.02;        // -24% в год (~-2% в месяц)
      case 4: return -0.025;       // -30% в год (~-2.5% в месяц)
      case 3: return -0.03;        // -36% в год (~-3% в месяц)
      case 2: return -0.035;       // -42% в год (~-3.5% в месяц)
      case 1: return -0.04;        // -48% в год (~-4% в месяц)
      default: return -0.05;       // -60% в год (~-5% в месяц) для неизвестного качества
    }
  } else {
    // Обновленные правила согласно требованиям
    // * **Оценки продукта:**
    // * 10: +30% пользователей в месяц
    // * 9: +28% пользователей в месяц
    // * 8: +22% пользователей в месяц
    // * 7: +18% пользователей в месяц
    // * 6: +2% пользователей в месяц
    // * 5: -2% пользователей в месяц
    // * 4: -20% пользователей в месяц
    // * 3: -35% пользователей в месяц
    // * 2: -55% пользователей в месяц
    // * 1: -65% пользователей в месяц
    switch (quality) {
      case 10: return 0.30;    // +30% в месяц
      case 9: return 0.28;     // +28% в месяц
      case 8: return 0.22;     // +22% в месяц
      case 7: return 0.18;     // +18% в месяц
      case 6: return 0.02;     // +2% в месяц
      case 5: return -0.02;    // -2% в месяц
      case 4: return -0.20;    // -20% в месяц
      case 3: return -0.35;    // -35% в месяц
      case 2: return -0.55;    // -55% в месяц
      case 1: return -0.65;    // -65% в месяц
      default: return -0.70;   // -70% в месяц для неизвестного качества
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
  
  // Обновленное правило: на каждые 10к пользователей нужно 5 сотрудников
  const usersPerFiveEmployees = 10000;
  const employees = Math.ceil((product.users || 0) / usersPerFiveEmployees * 5) + (product.employees || 0);
  
  // Требуемые серверы: 1 на каждые 300 пользователей
  const servers = Math.ceil((product.users || 0) / (metrics.USERS_PER_SERVER || 300));
  
  return { employees, servers };
};

/**
 * Рассчитывает минимальное необходимое количество сотрудников для продукта
 * @param {number} users - Количество пользователей продукта
 * @returns {number} - Минимальное количество необходимых сотрудников
 */
export const calculateMinEmployeesForUsers = (users) => {
  if (!users || users <= 0) return 0;
  
  // На каждые 10,000 пользователей требуется 5 сотрудников
  return Math.ceil(users / 10000 * 5);
};
