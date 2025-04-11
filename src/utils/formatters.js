/**
 * Utility functions for formatting data in the UI
 */

// Format currency (USD)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  
  const absAmount = Math.abs(amount);
  let formattedAmount;
  
  if (absAmount >= 1000000000) {
    formattedAmount = `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (absAmount >= 1000000) {
    formattedAmount = `$${(amount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    formattedAmount = `$${(amount / 1000).toFixed(1)}K`;
  } else {
    formattedAmount = `$${amount.toFixed(2)}`;
  }
  
  return formattedAmount;
};

// Format large numbers (users, etc.)
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  const absNumber = Math.abs(number);
  let formattedNumber;
  
  if (absNumber >= 1000000000) {
    formattedNumber = `${(number / 1000000000).toFixed(1)}B`;
  } else if (absNumber >= 1000000) {
    formattedNumber = `${(number / 1000000).toFixed(1)}M`;
  } else if (absNumber >= 1000) {
    formattedNumber = `${(number / 1000).toFixed(1)}K`;
  } else {
    formattedNumber = number.toString();
  }
  
  return formattedNumber;
};

// Format date as YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Format date as Month Year (e.g., January 2004)
export const formatMonthYear = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Get a CSS class based on product quality
export const getQualityClass = (quality) => {
  if (quality >= 8) return 'quality-high';
  if (quality >= 5) return 'quality-medium';
  return 'quality-low';
};

// Get a text label based on product quality
export const getQualityLabel = (quality) => {
  if (quality >= 8) return 'Excellent';
  if (quality >= 6) return 'Good';
  if (quality >= 4) return 'Average';
  if (quality >= 2) return 'Poor';
  return 'Terrible';
};

// Calculate how many employees are needed for a given product
export const calculateRequiredEmployees = (product) => {
  if (!product) return 0;
  
  // Base employees for product support (1 per 2000 users)
  const supportEmployees = Math.ceil(product.users / 2000);
  
  // Additional employees for product development/updates
  return supportEmployees + (product.employees || 0);
};

// Calculate total monthly expenses breakdown
export const calculateExpenses = (company) => {
  const employeeExpenses = company.employees * 10000;
  const serverExpenses = company.servers * 10;
  const marketingExpenses = company.marketingBudget || 0;
  const taxExpenses = company.monthlyTaxes || 0;
  
  return {
    employees: employeeExpenses,
    servers: serverExpenses,
    marketing: marketingExpenses,
    taxes: taxExpenses,
    total: employeeExpenses + serverExpenses + marketingExpenses + taxExpenses
  };
};
