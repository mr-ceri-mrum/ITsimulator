/**
 * Глобальные константы и настройки игры
 */

// Максимальное глобальное население
export const MAX_GLOBAL_POPULATION = 8000000000; // 8 миллиардов людей

// Налоговая ставка
export const CORPORATE_TAX_RATE = 0.23; // 23% корпоративный налог

// Начальные параметры игры
export const INITIAL_GAME_STATE = {
  gameStarted: false,
  isPaused: true,
  gameSpeed: 1, // 1 = нормальная скорость, 2 = 2x, 4 = 4x
};

// Начальные параметры компании
export const INITIAL_COMPANY_STATE = {
  name: '',
  founded: new Date(2004, 0, 1),
  cash: 1000000, // Начальные $1M
  valuation: 1000000,
  employees: 0,
  servers: 0,
  products: [],
  monthlyIncome: 0,
  monthlyExpenses: 0,
  marketingBudget: 0,
  acquiredCompanies: [], // Список приобретенных компаний
  taxesPaid: 0, // Отслеживание уплаченных налогов
  monthlyTaxes: 0, // Ежемесячные налоги
};

// Начальная дата
export const INITIAL_DATE = new Date(2004, 0, 1); // 1 января 2004

// Количество потенциальных пользователей в начале игры
export const INITIAL_POTENTIAL_USERS = 5000000000; // 5 миллиардов

// Цены и стоимость
export const COSTS = {
  EMPLOYEE_COST: 10000, // $10,000 за сотрудника
  SERVER_COST: 10,      // $10 за сервер
  ACQUISITION_MULTIPLIER: 2, // Множитель стоимости при приобретении
};

// Показатели бизнеса
export const BUSINESS_METRICS = {
  REVENUE_PER_USER: 15, // $15 дохода от пользователя в месяц
  USERS_PER_EMPLOYEE: 2000, // Количество пользователей на сотрудника
  USERS_PER_SERVER: 300,   // Количество пользователей на сервер
  VALUATION_PER_USER: 20, // $20 в оценке компании за пользователя
  VALUATION_CASH_MULTIPLIER: 2, // Множитель наличных денег в оценке
  VALUATION_QUALITY_MULTIPLIER: 10000000, // $10M за средний балл качества
};

// Интервал обновления в игре
export const GAME_TICK_INTERVAL = 10000; // 10 секунд на месяц в нормальной скорости

// Рыночные параметры
export const MARKET_PARAMS = {
  MAX_PLAYER_MARKET_SHARE: 0.4, // Максимальная доля рынка игрока (40%)
  MAX_AI_MARKET_SHARE: 0.3,     // Максимальная доля рынка ИИ-компаний (30%)
  MONTHLY_USER_GROWTH: 20800000, // Месячный рост потенциальных пользователей
};

// Параметры ИИ-компаний
export const AI_COMPANY_CONFIG = {
  INITIAL_COUNT: 300, // Начальное количество ИИ-компаний
  ACQUISITION_PROBABILITY: 0.05, // 5% шанс на попытку приобретения
  PRODUCT_IMPROVEMENT_CHANCE: 0.1, // 10% шанс на улучшение продукта
  PRODUCT_DEGRADATION_CHANCE: 0.05, // 5% шанс на деградацию продукта
  NEW_PRODUCT_CHANCE: 0.01, // 1% шанс на создание нового продукта
  TOP_ACQUIRER_PERCENTAGE: 0.1, // Топ 10% компаний могут приобретать другие
  BOTTOM_ACQUISITION_TARGET_PERCENTAGE: 0.5, // Нижние 50% компаний могут быть приобретены
};

// Типы продуктов
export const PRODUCT_TYPES = [
  'search', 'video', 'social', 'mobileOS', 'desktopOS', 
  'smartphone', 'console', 'cloud', 'ridesharing', 'ecommerce',
  'ai', 'messenger', 'office', 'antivirus', 'database', 'devtools'
];

// Добавим компанию для совместимости
export const COMPANY = {
  name: '',
  founded: new Date(2004, 0, 1),
  cash: 1000000,
  valuation: 1000000,
  employees: 0,
  servers: 0,
  products: [],
  monthlyIncome: 0,
  monthlyExpenses: 0,
  marketingBudget: 0
};
