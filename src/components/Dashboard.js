import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, formatNumber, calculateExpenses } from '../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { company, currentDate, competitors } = useGameStore(state => ({
    company: state.company,
    currentDate: state.currentDate,
    competitors: state.competitors
  }));
  
  // Calculate total users across all products
  const totalUsers = company.products.reduce((total, product) => {
    if (!product.isInDevelopment) {
      return total + product.users;
    }
    return total;
  }, 0);
  
  // Get top 3 products by user count
  const topProducts = [...company.products]
    .filter(product => !product.isInDevelopment)
    .sort((a, b) => b.users - a.users)
    .slice(0, 3);
  
  // Get top 5 competitors by valuation
  const topCompetitors = [...competitors]
    .sort((a, b) => b.valuation - a.valuation)
    .slice(0, 5);
  
  // Calculate expenses breakdown
  const expenses = calculateExpenses(company);
  
  // Financial data (income/expenses)
  const financeData = [
    { name: 'Income', value: company.monthlyIncome },
    { name: 'Expenses', value: company.monthlyExpenses }
  ];
  
  // Expense breakdown data for chart
  const expenseData = [
    { name: 'Employees', value: expenses.employees },
    { name: 'Servers', value: expenses.servers },
    { name: 'Marketing', value: expenses.marketing },
    { name: 'Taxes', value: company.monthlyTaxes || 0 }
  ];
  
  // Tax information
  const profitBeforeTax = company.monthlyIncome - (expenses.employees + expenses.servers + expenses.marketing);
  const taxRate = 23; // 23%
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        {/* Company Overview Card */}
        <div className="dashboard-card">
          <div className="card-header">Company Overview</div>
          <div>
            <p><strong>Name:</strong> {company.name}</p>
            <p><strong>Founded:</strong> {currentDate.getFullYear()}</p>
            <p><strong>Valuation:</strong> {formatCurrency(company.valuation)}</p>
            <p><strong>Cash:</strong> {formatCurrency(company.cash)}</p>
            <p><strong>Employees:</strong> {company.employees}</p>
            <p><strong>Monthly Income:</strong> {formatCurrency(company.monthlyIncome)}</p>
            <p><strong>Monthly Expenses:</strong> {formatCurrency(company.monthlyExpenses)}</p>
            <p><strong>Products:</strong> {company.products.filter(p => !p.isInDevelopment).length}</p>
            <p><strong>Total Users:</strong> {formatNumber(totalUsers)}</p>
          </div>
        </div>
        
        {/* Tax Information Card */}
        <div className="dashboard-card">
          <div className="card-header">Tax Information</div>
          <div>
            <p><strong>Current Tax Rate:</strong> {taxRate}%</p>
            <p><strong>Monthly Profit Before Tax:</strong> {formatCurrency(profitBeforeTax)}</p>
            <p><strong>Monthly Tax:</strong> {formatCurrency(company.monthlyTaxes || 0)}</p>
            <p><strong>Effective Tax Rate:</strong> {
              profitBeforeTax > 0 
                ? ((company.monthlyTaxes || 0) / profitBeforeTax * 100).toFixed(1) + '%' 
                : 'N/A (No Profit)'
            }</p>
            <p><strong>Total Taxes Paid:</strong> {formatCurrency(company.taxesPaid || 0)}</p>
            
            <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
              <p><strong>Marketing Cost per User:</strong> {
                totalUsers > 100000000 
                  ? '$20.00 (High Market Saturation)' 
                  : '$5.00 (Normal)'
              }</p>
              <p><strong>Acquisitions:</strong> {company.acquiredCompanies ? company.acquiredCompanies.length : 0}</p>
            </div>
          </div>
        </div>
        
        {/* Financial Chart Card */}
        <div className="dashboard-card">
          <div className="card-header">Financial Overview</div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={financeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="value" stroke="#3498db" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: 20 }}>
            <h4>Monthly Expenses Breakdown</h4>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="value" stroke="#e74c3c" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Top Products Card */}
        <div className="dashboard-card">
          <div className="card-header">Top Products</div>
          {topProducts.length > 0 ? (
            <div>
              {topProducts.map(product => (
                <div key={product.id} className="top-product-item">
                  <h4>{product.name}</h4>
                  <p>Users: {formatNumber(product.users)}</p>
                  <p>Quality: {product.quality}/10</p>
                  <div className="product-bar" style={{ width: `${product.users / (topProducts[0].users || 1) * 100}%` }}></div>
                </div>
              ))}
            </div>
          ) : (
            <p>No active products yet.</p>
          )}
        </div>
        
        {/* Market Position Card */}
        <div className="dashboard-card">
          <div className="card-header">Market Position</div>
          <div>
            <h4>Top Companies by Valuation</h4>
            <ol className="top-companies-list">
              {[...topCompetitors, { name: company.name, valuation: company.valuation }]
                .sort((a, b) => b.valuation - a.valuation)
                .map((comp, index) => (
                  <li key={index} className={comp.name === company.name ? 'your-company' : ''}>
                    {comp.name} - {formatCurrency(comp.valuation)}
                    {comp.name === company.name && ' (You)'}
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
