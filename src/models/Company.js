/**
 * Модель данных компании (игрока или ИИ-компании)
 */

import { INITIAL_COMPANY_STATE } from '../constants/gameConfig';

/**
 * Создает новую компанию с заданными параметрами
 * @param {Object} props - Свойства для создания компании
 * @returns {Object} - Объект компании
 */
export const createCompany = (props = {}) => {
  return {
    ...INITIAL_COMPANY_STATE,
    ...props
  };
};

/**
 * Создает объект приобретенной компании для истории
 * @param {Object} competitor - Объект компании-конкурента
 * @param {Date} acquisitionDate - Дата приобретения
 * @param {number} acquisitionPrice - Стоимость приобретения
 * @returns {Object} - Объект приобретенной компании
 */
export const createAcquiredCompany = (competitor, acquisitionDate, acquisitionPrice) => {
  return {
    id: competitor.id,
    name: competitor.name,
    acquisitionDate: acquisitionDate,
    acquisitionPrice: acquisitionPrice,
    valuation: competitor.valuation,
    productCount: competitor.products.length
  };
};

/**
 * Рассчитывает оценку стоимости компании на основе ее показателей
 * @param {Object} company - Объект компании
 * @param {Object} metrics - Метрики для расчета (валюация на пользователя, множитель для наличных, множитель качества)
 * @returns {number} - Оценка стоимости компании
 */
export const calculateValuation = (company, metrics) => {
  const totalUsers = company.products.reduce(
    (sum, product) => sum + (product.isInDevelopment ? 0 : product.users), 
    0
  );
  
  const productQualitySum = company.products.reduce(
    (sum, product) => sum + (product.isInDevelopment ? 0 : product.quality), 
    0
  );
  
  const activeProducts = company.products.filter(p => !p.isInDevelopment);
  const avgQuality = activeProducts.length > 0 ? productQualitySum / activeProducts.length : 0;
  
  return Math.max(
    0,
    totalUsers * metrics.VALUATION_PER_USER + 
    company.cash * metrics.VALUATION_CASH_MULTIPLIER + 
    avgQuality * metrics.VALUATION_QUALITY_MULTIPLIER
  );
};

/**
 * Рассчитывает финансовые показатели компании
 * @param {Object} company - Объект компании 
 * @param {Object} params - Параметры расчета (стоимость сотрудника, налоговая ставка и т.д.)
 * @returns {Object} - Рассчитанные финансовые показатели
 */
export const calculateFinancials = (company, params) => {
  // Доход от всех продуктов
  const income = company.products.reduce((sum, product) => {
    if (!product.isInDevelopment) {
      return sum + (product.users * params.REVENUE_PER_USER);
    }
    return sum;
  }, 0);
  
  // Расходы на сотрудников
  const employeeCost = company.employees * params.EMPLOYEE_COST;
  
  // Расходы на серверы
  const serverCost = company.servers * params.SERVER_COST;
  
  // Расходы на маркетинг
  const marketingCost = company.marketingBudget;
  
  // Общие расходы до налогов
  const preTaxExpenses = employeeCost + serverCost + marketingCost;
  
  // Прибыль до налогов
  const profitBeforeTax = income - preTaxExpenses;
  
  // Налоги (только если есть прибыль)
  const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * params.CORPORATE_TAX_RATE : 0;
  
  // Общие расходы с налогами
  const totalExpenses = preTaxExpenses + taxAmount;
  
  return {
    income,
    preTaxExpenses,
    profitBeforeTax,
    taxAmount,
    totalExpenses,
    netProfit: income - totalExpenses
  };
};
