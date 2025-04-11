import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { 
  formatCurrency, 
  formatNumber, 
  calculateExpenses,
  formatShortCurrency, 
  formatShortNumber 
} from '../utils/formatters';

const Management = () => {
  const { 
    company, 
    hireEmployees, 
    addServers, 
    setMarketingBudget, 
    calculatedRequiredEmployees, 
    requiresEmployeeUpdate 
  } = useGameStore(state => ({
    company: state.company,
    hireEmployees: state.hireEmployees,
    addServers: state.addServers,
    setMarketingBudget: state.setMarketingBudget,
    calculatedRequiredEmployees: state.calculatedRequiredEmployees || 0,
    requiresEmployeeUpdate: state.requiresEmployeeUpdate || false
  }));
  
  // Local state for form inputs
  const [employeeCount, setEmployeeCount] = useState(0);
  const [serverCount, setServerCount] = useState(0);
  const [marketingBudget, setMarketingBudgetLocal] = useState(company.marketingBudget || 0);
  const [employeeError, setEmployeeError] = useState('');
  const [serverError, setServerError] = useState('');
  
  // Update local state when company data changes
  useEffect(() => {
    setMarketingBudgetLocal(company.marketingBudget || 0);
  }, [company.marketingBudget]);
  
  // Calculate expenses
  const expenses = calculateExpenses(company);
  
  // Calculate total users across all products
  const totalUsers = company.products.reduce((sum, product) => {
    if (!product.isInDevelopment) {
      return sum + (product.users || 0);
    }
    return sum;
  }, 0);
  
  // Calculate required resources based on the 5 employees per 10,000 users rule
  const requiredEmployeesForUsers = Math.ceil(totalUsers / 10000 * 5);
  
  // Calculate required servers (1 per 300 users)
  const requiredServers = Math.ceil(totalUsers / 300);
  
  // Additional employees for product development/updates
  const additionalEmployees = company.products.reduce((sum, product) => {
    if (!product.isInDevelopment && product.employees) {
      return sum + product.employees;
    }
    return sum;
  }, 0);
  
  // Use the calculated required employees from the game state or compute it if not available
  const totalRequiredEmployees = calculatedRequiredEmployees || (requiredEmployeesForUsers + additionalEmployees);
  
  // Calculate the employee shortfall
  const employeeShortfall = Math.max(0, totalRequiredEmployees - (company.employees || 0));
  
  // Automatically suggest the shortfall for hire count
  useEffect(() => {
    if (requiresEmployeeUpdate && employeeShortfall > 0 && employeeCount === 0) {
      setEmployeeCount(employeeShortfall);
    }
  }, [requiresEmployeeUpdate, employeeShortfall, employeeCount]);
  
  // Calculate expected costs
  const calculateCosts = () => {
    const employeeCost = employeeCount * 10000;
    const serverCost = serverCount * 10;
    
    return {
      employees: employeeCost,
      servers: serverCost,
      total: employeeCost + serverCost
    };
  };
  
  const costs = calculateCosts();
  
  // Handle hiring employees
  const handleHireEmployees = () => {
    if (employeeCount <= 0) {
      setEmployeeError('Please enter a positive number of employees to hire');
      return;
    }
    
    const success = hireEmployees(employeeCount);
    if (!success) {
      setEmployeeError(`Not enough cash to hire ${employeeCount} employees (Cost: ${formatShortCurrency(employeeCount * 10000)})`);
    } else {
      setEmployeeError('');
      setEmployeeCount(0);
    }
  };
  
  // Handle adding servers
  const handleAddServers = () => {
    if (serverCount <= 0) {
      setServerError('Please enter a positive number of servers to add');
      return;
    }
    
    const success = addServers(serverCount);
    if (!success) {
      setServerError(`Not enough cash to add ${serverCount} servers (Cost: ${formatShortCurrency(serverCount * 10)})`);
    } else {
      setServerError('');
      setServerCount(0);
    }
  };
  
  // Handle marketing budget change
  const handleMarketingChange = (e) => {
    const budget = parseInt(e.target.value) || 0;
    setMarketingBudgetLocal(budget);
  };
  
  // Save marketing budget
  const handleSaveMarketing = () => {
    setMarketingBudget(marketingBudget);
  };
  
  // Calculate marketing efficiency
  const calculateMarketingEfficiency = () => {
    if (marketingBudget <= 0) return 0;
    
    // User acquisition cost changes based on total market size
    const costPerUser = totalUsers > 100000000 ? 20 : 5;
    const expectedUsers = Math.floor(marketingBudget / costPerUser);
    return expectedUsers;
  };
  
  const expectedNewUsers = calculateMarketingEfficiency();
  
  // Calculate tax information
  const profitBeforeTax = (company.monthlyIncome || 0) - expenses.total;
  const taxRate = 23; // 23%
  const estimatedTax = profitBeforeTax > 0 ? profitBeforeTax * (taxRate / 100) : 0;
  const monthlyBalanceAfterTax = profitBeforeTax - estimatedTax;
  
  return (
    <div>
      <h1>Resource Management</h1>
      
      <div className="dashboard-grid">
        {/* Employee Management Card */}
        <div className="dashboard-card">
          <div className="card-header">Employee Management</div>
          
          <div className="resource-info">
            <p><strong>Current Employees:</strong> {formatNumber(company.employees)}</p>
            <p><strong>Required for Users:</strong> {formatNumber(requiredEmployeesForUsers)} (5 per 10k users)</p>
            <p><strong>Required for Development:</strong> {formatNumber(additionalEmployees)}</p>
            <p><strong>Total Required:</strong> {formatNumber(totalRequiredEmployees)}</p>
            <p className={totalRequiredEmployees > (company.employees || 0) ? 'resource-deficit' : 'resource-surplus'}>
              <strong>Status:</strong> {
                totalRequiredEmployees > (company.employees || 0) ? 
                `Understaffed (${formatNumber(employeeShortfall)} needed)` : 
                `Well staffed (${formatNumber((company.employees || 0) - totalRequiredEmployees)} extra)`
              }
            </p>
            <p><strong>Monthly Cost:</strong> {formatShortCurrency(expenses.employees)}</p>
            
            {requiresEmployeeUpdate && employeeShortfall > 0 && (
              <div className="employee-warning" style={{ 
                backgroundColor: '#ffebee', 
                color: '#c62828', 
                padding: '10px', 
                borderRadius: '4px',
                marginTop: '10px'
              }}>
                <p><strong>Warning:</strong> You need to hire {employeeShortfall} more employees to support your products!</p>
                <p>Products with insufficient staff may lose users faster and generate less revenue.</p>
              </div>
            )}
          </div>
          
          <div className="resource-action">
            <div className="form-group">
              <label htmlFor="employeeCount">Number of Employees to Hire:</label>
              <input
                type="number"
                id="employeeCount"
                min="0"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
              />
              {employeeError && <div className="error-message">{employeeError}</div>}
            </div>
            
            <div className="cost-preview">
              Cost: {formatShortCurrency(costs.employees)}
            </div>
            
            <button onClick={handleHireEmployees} 
                    style={requiresEmployeeUpdate ? {backgroundColor: '#e74c3c'} : {}}>
              Hire Employees
            </button>
          </div>
        </div>
        
        {/* Server Management Card */}
        <div className="dashboard-card">
          <div className="card-header">Server Management</div>
          
          <div className="resource-info">
            <p><strong>Current Servers:</strong> {formatNumber(company.servers)}</p>
            <p><strong>Required Servers:</strong> {formatNumber(requiredServers)}</p>
            <p className={requiredServers > (company.servers || 0) ? 'resource-deficit' : 'resource-surplus'}>
              <strong>Status:</strong> {
                requiredServers > (company.servers || 0) ? 
                `Insufficient (${formatNumber(requiredServers - (company.servers || 0))} needed)` : 
                `Well equipped (${formatNumber((company.servers || 0) - requiredServers)} extra)`
              }
            </p>
            <p><strong>Monthly Cost:</strong> {formatShortCurrency(expenses.servers)}</p>
            <p><strong>Auto-Scaling:</strong> Servers are now automatically provisioned (1 server per 300 users)</p>
          </div>
          
          <div className="resource-action">
            <div className="form-group">
              <label htmlFor="serverCount">Number of Additional Servers to Deploy:</label>
              <input
                type="number"
                id="serverCount"
                min="0"
                value={serverCount}
                onChange={(e) => setServerCount(parseInt(e.target.value) || 0)}
              />
              {serverError && <div className="error-message">{serverError}</div>}
            </div>
            
            <div className="cost-preview">
              Cost: {formatShortCurrency(costs.servers)}
            </div>
            
            <button onClick={handleAddServers}>Add Servers</button>
          </div>
        </div>
        
        {/* Marketing Management Card */}
        <div className="dashboard-card">
          <div className="card-header">Marketing Management</div>
          
          <div className="resource-info">
            <p><strong>Current Monthly Budget:</strong> {formatShortCurrency(company.marketingBudget)}</p>
            <p><strong>Estimated New Users/Month:</strong> {formatShortNumber(expectedNewUsers)}</p>
            <p><strong>Acquisition Cost:</strong> ${totalUsers > 100000000 ? '20' : '5'} per user 
              {totalUsers > 100000000 && <span style={{ color: '#e74c3c' }}> (High Market Saturation)</span>}
            </p>
          </div>
          
          <div className="resource-action">
            <div className="form-group">
              <label htmlFor="marketingBudget">Monthly Marketing Budget:</label>
              <input
                type="number"
                id="marketingBudget"
                min="0"
                step="10000"
                value={marketingBudget}
                onChange={handleMarketingChange}
              />
            </div>
            
            <div className="marketing-preview">
              <p>This budget will attract approximately {formatShortNumber(expectedNewUsers)} new users per month.</p>
            </div>
            
            <button onClick={handleSaveMarketing}>Set Marketing Budget</button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card" style={{ marginTop: '20px' }}>
        <div className="card-header">Financial Summary</div>
        
        <div className="financial-summary">
          <div className="summary-row">
            <div className="summary-label">Cash:</div>
            <div className="summary-value">{formatShortCurrency(company.cash)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Income:</div>
            <div className="summary-value">{formatShortCurrency(company.monthlyIncome)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Expenses (pre-tax):</div>
            <div className="summary-value">{formatShortCurrency(expenses.total)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Profit Before Tax:</div>
            <div className={`summary-value ${profitBeforeTax >= 0 ? 'positive' : 'negative'}`}>
              {formatShortCurrency(profitBeforeTax)}
            </div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Estimated Tax (23%):</div>
            <div className="summary-value">{formatShortCurrency(estimatedTax)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Balance After Tax:</div>
            <div className={`summary-value ${monthlyBalanceAfterTax >= 0 ? 'positive' : 'negative'}`}>
              {formatShortCurrency(monthlyBalanceAfterTax)}
            </div>
          </div>
          
          <div className="summary-row" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div className="summary-label">Total Taxes Paid To Date:</div>
            <div className="summary-value">{formatShortCurrency(company.taxesPaid)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
