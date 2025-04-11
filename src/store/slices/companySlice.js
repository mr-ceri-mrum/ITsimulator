/**
 * Срез хранилища для управления компанией игрока (базовая версия)
 */
import { INITIAL_COMPANY_STATE, COMPANY } from '../../constants/gameConfig';

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
