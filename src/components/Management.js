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
  
  // Calculate total users across all products
  const totalUsers = company.products.reduce((sum, product) => {
    if (!product.isInDevelopment) {
      return sum + product.users;
    }
    return sum;
  }, 0);
  
  // Calculate required resources
  const requiredEmployeesForSupport = Math.ceil(totalUsers / 2000);
  const requiredServers = Math.ceil(totalUsers / 300); // Now 1 server per 300 users
  
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
    
    // User acquisition cost changes based on total market size
    const costPerUser = totalUsers > 100000000 ? 20 : 5;
    const expectedUsers = Math.floor(marketingBudget / costPerUser);
    return expectedUsers;
  };
  
  const expectedNewUsers = calculateMarketingEfficiency();
  
  // Calculate tax information
  const profitBeforeTax = company.monthlyIncome - (expenses.employees + expenses.servers + expenses.marketing);
  const taxRate = 23; // 23%
  const estimatedTax = profitBeforeTax > 0 ? profitBeforeTax * (taxRate / 100) : 0;
  
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
            <div className="summary-label">Monthly Expenses (pre-tax):</div>
            <div className="summary-value">{formatCurrency(expenses.employees + expenses.servers + expenses.marketing)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Profit Before Tax:</div>
            <div className={`summary-value ${profitBeforeTax >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(profitBeforeTax)}
            </div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Estimated Tax (23%):</div>
            <div className="summary-value">{formatCurrency(estimatedTax)}</div>
          </div>
          
          <div className="summary-row">
            <div className="summary-label">Monthly Balance After Tax:</div>
            <div className={`summary-value ${profitBeforeTax - estimatedTax >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(profitBeforeTax - estimatedTax)}
            </div>
          </div>
          
          <div className="summary-row" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div className="summary-label">Total Taxes Paid To Date:</div>
            <div className="summary-value">{formatCurrency(company.taxesPaid || 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
