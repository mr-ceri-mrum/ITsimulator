/**
 * Утилиты для форматирования различных типов данных
 */

/**
 * Проверяет, является ли значение действительным числом
 * @param {any} value - Проверяемое значение
 * @returns {number} - 0, если значение не является числом, иначе само значение
 */
const ensureNumeric = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return Number(value);
};

/**
 * Форматирует число как валюту (доллары)
 * @param {number} amount - Сумма для форматирования
 * @param {boolean} short - Использовать сокращенный формат (K, M, B, T)
 * @returns {string} - Отформатированная строка
 */
export const formatCurrency = (amount, short = false) => {
  // Обеспечиваем, что amount - действительное число
  const safeAmount = ensureNumeric(amount);
  
  if (short || Math.abs(safeAmount) >= 1000) {
    if (Math.abs(safeAmount) >= 1000000000000) { // Trillion
      return `$${(safeAmount / 1000000000000).toFixed(1)}T`;
    } else if (Math.abs(safeAmount) >= 1000000000) { // Billion
      return `$${(safeAmount / 1000000000).toFixed(1)}B`;
    } else if (Math.abs(safeAmount) >= 1000000) { // Million
      return `$${(safeAmount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(safeAmount) >= 1000) { // Thousand
      return `$${(safeAmount / 1000).toFixed(1)}K`;
    }
  }
  
  // Стандартный формат для небольших чисел или если short = false
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(safeAmount);
};

/**
 * Форматирует число с разделителями тысяч
 * @param {number} number - Число для форматирования
 * @param {boolean} short - Использовать сокращенный формат (K, M, B, T)
 * @returns {string} - Отформатированная строка
 */
export const formatNumber = (number, short = false) => {
  // Обеспечиваем, что number - действительное число
  const safeNumber = ensureNumeric(number);
  
  if (short || Math.abs(safeNumber) >= 1000) {
    if (Math.abs(safeNumber) >= 1000000000000) { // Trillion
      return `${(safeNumber / 1000000000000).toFixed(1)}T`;
    } else if (Math.abs(safeNumber) >= 1000000000) { // Billion
      return `${(safeNumber / 1000000000).toFixed(1)}B`;
    } else if (Math.abs(safeNumber) >= 1000000) { // Million
      return `${(safeNumber / 1000000).toFixed(1)}M`;
    } else if (Math.abs(safeNumber) >= 1000) { // Thousand
      return `${(safeNumber / 1000).toFixed(1)}K`;
    }
  }
  
  // Стандартный формат с разделителями
  return new Intl.NumberFormat('en-US').format(safeNumber);
};

/**
 * Всегда форматирует число в короткой форме (k, M, B)
 * @param {number} number - Число для форматирования
 * @returns {string} - Отформатированная строка
 */
export const formatShortNumber = (number) => {
  return formatNumber(number, true);
};

/**
 * Всегда форматирует валюту в короткой форме ($k, $M, $B)
 * @param {number} amount - Сумма для форматирования
 * @returns {string} - Отформатированная строка
 */
export const formatShortCurrency = (amount) => {
  return formatCurrency(amount, true);
};

/**
 * Форматирует дату
 * @param {Date|string} date - Дата для форматирования
 * @param {string} style - Стиль форматирования ('short', 'medium', 'long')
 * @returns {string} - Отформатированная строка
 */
export const formatDate = (date, style = 'medium') => {
  if (!date) {
    return 'N/A';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Базовая проверка на валидность даты
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return 'Invalid Date';
  }
  
  // Форматы в зависимости от стиля
  switch (style) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'numeric', 
        year: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    case 'full':
      return dateObj.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    case 'medium':
    default:
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
  }
};

/**
 * Форматирует процент
 * @param {number} value - Число для форматирования (0.1 = 10%)
 * @param {number} decimals - Количество знаков после запятой
 * @returns {string} - Отформатированная строка
 */
export const formatPercent = (value, decimals = 1) => {
  // Обеспечиваем, что value - действительное число
  const safeValue = ensureNumeric(value);
  
  return `${(safeValue * 100).toFixed(decimals)}%`;
};

/**
 * Рассчитывает общие расходы 
 * @param {Object} company - Объект компании
 * @returns {Object} - Объект с разбивкой расходов
 */
export const calculateExpenses = (company) => {
  if (!company) return { employees: 0, servers: 0, marketing: 0, total: 0 };
  
  // Базовые расходы на сотрудников
  const employeeCost = ensureNumeric(company.employees) * 10000;
  
  // Расходы на сервера
  const serverCost = ensureNumeric(company.servers) * 10;
  
  // Маркетинговый бюджет
  const marketingCost = ensureNumeric(company.marketingBudget);
  
  // Общие расходы без учета налогов
  const total = employeeCost + serverCost + marketingCost;
  
  return {
    employees: employeeCost,
    servers: serverCost,
    marketing: marketingCost,
    total: total
  };
};

/**
 * Возвращает CSS-класс на основе качества продукта
 * @param {number} quality - Качество продукта (0-10)
 * @returns {string} - CSS-класс
 */
export const getQualityClass = (quality) => {
  if (quality === undefined || quality === null || isNaN(quality)) {
    return 'quality-unknown';
  }
  
  if (quality >= 9) return 'quality-excellent';
  if (quality >= 7) return 'quality-good';
  if (quality >= 5) return 'quality-average';
  if (quality >= 3) return 'quality-poor';
  return 'quality-bad';
};

/**
 * Возвращает текстовую метку для качества продукта
 * @param {number} quality - Качество продукта (0-10)
 * @returns {string} - Текстовая метка
 */
export const getQualityLabel = (quality) => {
  if (quality === undefined || quality === null || isNaN(quality)) {
    return 'Unknown';
  }
  
  if (quality >= 9) return 'Excellent';
  if (quality >= 7) return 'Good';
  if (quality >= 5) return 'Average';
  if (quality >= 3) return 'Poor';
  return 'Bad';
};
