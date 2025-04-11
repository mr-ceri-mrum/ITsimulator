/**
 * Утилиты для форматирования различных типов данных
 */

/**
 * Форматирует число как валюту (доллары)
 * @param {number} amount - Сумма для форматирования
 * @param {boolean} short - Использовать сокращенный формат (K, M, B, T)
 * @returns {string} - Отформатированная строка
 */
export const formatCurrency = (amount, short = false) => {
  if (amount === undefined || amount === null) {
    return '$0';
  }
  
  if (short && Math.abs(amount) >= 1000) {
    if (Math.abs(amount) >= 1000000000000) { // Trillion
      return `$${(amount / 1000000000000).toFixed(1)}T`;
    } else if (Math.abs(amount) >= 1000000000) { // Billion
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (Math.abs(amount) >= 1000000) { // Million
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) { // Thousand
      return `$${(amount / 1000).toFixed(1)}K`;
    }
  }
  
  // Стандартный формат для небольших чисел или если short = false
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(amount);
};

/**
 * Форматирует число с разделителями тысяч
 * @param {number} number - Число для форматирования
 * @param {boolean} short - Использовать сокращенный формат (K, M, B, T)
 * @returns {string} - Отформатированная строка
 */
export const formatNumber = (number, short = false) => {
  if (number === undefined || number === null) {
    return '0';
  }
  
  if (short && Math.abs(number) >= 1000) {
    if (Math.abs(number) >= 1000000000000) { // Trillion
      return `${(number / 1000000000000).toFixed(1)}T`;
    } else if (Math.abs(number) >= 1000000000) { // Billion
      return `${(number / 1000000000).toFixed(1)}B`;
    } else if (Math.abs(number) >= 1000000) { // Million
      return `${(number / 1000000).toFixed(1)}M`;
    } else if (Math.abs(number) >= 1000) { // Thousand
      return `${(number / 1000).toFixed(1)}K`;
    }
  }
  
  // Стандартный формат с разделителями
  return new Intl.NumberFormat('en-US').format(number);
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
  if (value === undefined || value === null) {
    return '0%';
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Рассчитывает общие расходы 
 * @param {Object} company - Объект компании
 * @returns {number} - Сумма расходов
 */
export const calculateExpenses = (company) => {
  if (!company) return 0;
  
  // Базовые расходы на сотрудников
  const employeeCost = (company.employees || 0) * 10000;
  
  // Расходы на сервера
  const serverCost = (company.servers || 0) * 10;
  
  // Маркетинговый бюджет
  const marketingCost = company.marketingBudget || 0;
  
  // Общие расходы без учета налогов
  return employeeCost + serverCost + marketingCost;
};

/**
 * Возвращает CSS-класс на основе качества продукта
 * @param {number} quality - Качество продукта (0-10)
 * @returns {string} - CSS-класс
 */
export const getQualityClass = (quality) => {
  if (quality === undefined || quality === null) {
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
  if (quality === undefined || quality === null) {
    return 'Unknown';
  }
  
  if (quality >= 9) return 'Excellent';
  if (quality >= 7) return 'Good';
  if (quality >= 5) return 'Average';
  if (quality >= 3) return 'Poor';
  return 'Bad';
};
