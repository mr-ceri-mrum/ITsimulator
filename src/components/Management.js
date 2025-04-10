import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, formatNumber, calculateExpenses } from '../utils/formatters';

const Management = () => {
  const { company, hireEmployees, addServers, setMarketingBudget } = useGameStore(state => ({
    company: state.company,
    hireEmployees: state.hireEmployees,
    addServers: state.addServers,
    setMarketingBudget: state.setMarketingBudget
  }));
  
  // Local state for form inputs
  const [employeeCount, setEmployeeCount] = useState(0);
  const [serverCount, setServerCount] = useState(0);
  const [marketingBudget, setMarketingBudgetLocal] = useState(company.marketingBudget);
  const [employeeError, setEmployeeError] = useState('');
  const [serverError, setServerError] = useState('');
  
  // Update local state when company data changes
  useEffect(() => {
    setMarketingBudgetLocal(company.marketingBudget);
  }, [company.marketingBudget]);
  
  // Calculate expenses
  const expenses = calculateExpenses(company);
  
  // Calculate required resources
  const totalUsers = company.products.reduce((sum, product) => {
    if (!product.isInDevelopment) {
      return sum + product.users;
    }
    return sum;
  }, 0);
  
  const requiredEmployeesForSupport = Math.ceil(totalUsers / 2000);
  const requiredServers = Math.ceil(totalUsers / 100);
  
  // Additional employees for product development/updates
  const additionalEmployees = company.products.reduce((sum, product) => {
    if (!product.isInDevelopment && product.employees) {
      return sum + product.employees;
    }
    return sum;
  }, 0);
  
  const totalRequiredEmployees = requiredEmployeesForSupport + additionalEmployees;
  
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
      setEmployeeError(`Not enough cash to hire ${employeeCount} employees (Cost: ${formatCurrency(employeeCount * 10000)})`);
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
      setServerError(`Not enough cash to add ${serverCount} servers (Cost: ${formatCurrency(serverCount * 10)})`);
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
    
    // Simplified calculation: 1 user costs $5 to acquire
    const expectedUsers = Math.floor(marketingBudget / 5);
    return expectedUsers;
  };
  
  const expectedNewUsers = calculateMarketingEfficiency();
  
  return (
    <div>
      <h1>Resource Management</h1>
      
      <div className="dashboard-grid">
        {/* Employee Management Card */}
        <div className="dashboard-card">
          <div className="card-header">Employee Management</div>
          
          <div className="resource-info">
            <p><strong>Current Employees:</strong> {company.employees}</p>
            <p><strong>Required for Support:</strong> {requiredEmployeesForSupport}</p>
            <p><strong>Required for Development:</strong> {additionalEmployees}</p>
            <p><strong>Total Required:</strong> {totalRequiredEmployees}</p>
            <p className={totalRequiredEmployees > company.employees ? 'resource-deficit' : 'resource-surplus'}>
              <strong>Status:</strong> {
                totalRequiredEmployees > company.employees ? 
                `Understaffed (${totalRequiredEmployees - company.employees} needed)` : 
                `Well staffed (${company.employees - totalRequiredEmployees} extra)`
              }
            </p>
            <p><strong>Monthly Cost:</strong> {formatCurrency(expenses.employees)}</p>
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
              Cost: {formatCurrency(costs.employees)}
            </div>
            
            <button onClick={handleHireEmployees}>Hire Employees</button>
          </div>
        </div>
        
        {/* Server Management Card */}
        <div className="dashboard-card">
          <div className="card-header">Server Management</div>
          
          <div className="resource-info">
            <p><strong>Current Servers:</strong> {company.servers}</p>
            <p><strong>Required Servers:</strong> {requiredServers}</p>
            <p className={requiredServers > company.servers ? 'resource-deficit' : 'resource-surplus'}>
              <strong>Status:</strong> {
                requiredServers > company.servers ? 
                `Insufficient (${requiredServers - company.servers} needed)` : 
                `Well equipped (${company.servers - requiredServers} extra)`
              }
            </p>
            <p><strong>Monthly Cost:</strong> {formatCurrency(expenses.servers)}</p>
          </div>
          
          <div className="resource-action">
            <div className="form-group">
              <label htmlFor="serverCount">Number of Servers to Add:</label>
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
              Cost: {formatCurrency(costs.servers)}
            </div>
            
            <button onClick={handleAddServers}>Add Servers</button>
          </div>
        </div>
        
        {/* Marketing Management Card */}
        <div className="dashboard-card">
          <div className="card-header">Marketing Management</div>
          
          <div className="resource-info">
            <p><strong>Current Monthly Budget:</strong> {formatCurrency(company.marketingBudget)}</p>
            <p><strong>Estimated New Users/Month:</strong> {formatNumber(expectedNewUsers)}</p>
            <p><strong>Acquisition Cost:</strong> $5 per user</p>
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
              <p>This budget will attract approximately {formatNumber(expectedNewUsers)} new users per month.</p>
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
            <div className="summary-value">{formatCurrency(company.cash)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Income:</div>
            <div className="summary-value">{formatCurrency(company.monthlyIncome)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Expenses:</div>
            <div className="summary-value">{formatCurrency(company.monthlyExpenses)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Balance:</div>
            <div className={`summary-value ${company.monthlyIncome - company.monthlyExpenses >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(company.monthlyIncome - company.monthlyExpenses)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
