import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatCurrency, formatNumber, getQualityClass, getQualityLabel } from '../utils/formatters';
import { getProductNames } from '../utils/productRequirements';

const Market = () => {
  const { competitors, company, potentialUsers } = useGameStore(state => ({
    competitors: state.competitors,
    company: state.company,
    potentialUsers: state.potentialUsers
  }));
  
  const [activeTab, setActiveTab] = useState('overview');
  const productNames = getProductNames();
  
  // Sort competitors by valuation (descending)
  const sortedCompetitors = [...competitors].sort((a, b) => b.valuation - a.valuation);
  
  // Calculate market position
  const allCompanies = [
    ...sortedCompetitors,
    { id: 'player', name: company.name, valuation: company.valuation }
  ].sort((a, b) => b.valuation - a.valuation);
  
  const playerRank = allCompanies.findIndex(c => c.id === 'player') + 1;
  
  // Calculate market share by category
  const getMarketShareByCategory = () => {
    const categories = {};
    
    // Initialize categories with player's products
    company.products.forEach(product => {
      if (!product.isInDevelopment) {
        if (!categories[product.type]) {
          categories[product.type] = {
            totalUsers: 0,
            companies: []
          };
        }
        
        categories[product.type].totalUsers += product.users;
        categories[product.type].companies.push({
          name: company.name,
          productName: product.name,
          users: product.users,
          quality: product.quality,
          isPlayer: true
        });
      }
    });
    
    // Add competitor products
    competitors.forEach(competitor => {
      competitor.products.forEach(product => {
        if (!categories[product.type]) {
          categories[product.type] = {
            totalUsers: 0,
            companies: []
          };
        }
        
        categories[product.type].totalUsers += product.users;
        categories[product.type].companies.push({
          name: competitor.name,
          productName: product.name,
          users: product.users,
          quality: product.quality,
          isPlayer: false
        });
      });
    });
    
    // Calculate market share percentages and sort companies by users
    Object.keys(categories).forEach(category => {
      categories[category].companies.forEach(company => {
        company.marketShare = (company.users / categories[category].totalUsers) * 100;
      });
      
      categories[category].companies.sort((a, b) => b.users - a.users);
    });
    
    return categories;
  };
  
  const marketShareByCategory = getMarketShareByCategory();
  
  // Calculate total users across all companies
  const calculateTotalMarketUsers = () => {
    let total = 0;
    
    // Player's products
    company.products.forEach(product => {
      if (!product.isInDevelopment) {
        total += product.users;
      }
    });
    
    // Competitor products
    competitors.forEach(competitor => {
      competitor.products.forEach(product => {
        total += product.users;
      });
    });
    
    return total;
  };
  
  const totalMarketUsers = calculateTotalMarketUsers();
  const marketPenetration = (totalMarketUsers / potentialUsers) * 100;
  
  // Generate market overview data
  const generateMarketOverview = () => {
    const data = [];
    
    // Add player company
    const playerTotalUsers = company.products.reduce((sum, product) => {
      if (!product.isInDevelopment) {
        return sum + product.users;
      }
      return sum;
    }, 0);
    
    data.push({
      name: company.name,
      valuation: company.valuation,
      totalUsers: playerTotalUsers,
      products: company.products.filter(p => !p.isInDevelopment).length,
      marketShare: (playerTotalUsers / totalMarketUsers) * 100,
      isPlayer: true
    });
    
    // Add competitors
    competitors.forEach(competitor => {
      const competitorTotalUsers = competitor.products.reduce((sum, product) => sum + product.users, 0);
      
      data.push({
        name: competitor.name,
        valuation: competitor.valuation,
        totalUsers: competitorTotalUsers,
        products: competitor.products.length,
        marketShare: (competitorTotalUsers / totalMarketUsers) * 100,
        isPlayer: false
      });
    });
    
    // Sort by valuation
    return data.sort((a, b) => b.valuation - a.valuation);
  };
  
  const marketOverview = generateMarketOverview();
  
  return (
    <div>
      <h1>Market Analysis</h1>
      
      <div className="tab-container">
        <div className="tab-buttons">
          <button 
            className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('overview')}
          >
            Market Overview
          </button>
          <button 
            className={activeTab === 'categories' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('categories')}
          >
            Product Categories
          </button>
          <button 
            className={activeTab === 'competitors' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('competitors')}
          >
            Competitor Analysis
          </button>
        </div>
        
        <div className="tab-content">
          {/* Market Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="dashboard-card">
                <div className="card-header">Global Market Statistics</div>
                <div className="market-stats">
                  <div className="market-stat">
                    <div className="stat-label">Potential Users</div>
                    <div className="stat-value">{formatNumber(potentialUsers)}</div>
                  </div>
                  <div className="market-stat">
                    <div className="stat-label">Total Active Users</div>
                    <div className="stat-value">{formatNumber(totalMarketUsers)}</div>
                  </div>
                  <div className="market-stat">
                    <div className="stat-label">Market Penetration</div>
                    <div className="stat-value">{marketPenetration.toFixed(1)}%</div>
                  </div>
                  <div className="market-stat">
                    <div className="stat-label">Your Rank</div>
                    <div className="stat-value">{playerRank} of {allCompanies.length}</div>
                  </div>
                </div>
              </div>
              
              <h3>Top Companies by Valuation</h3>
              <div className="companies-list">
                {marketOverview.map((company, index) => (
                  <div 
                    key={index} 
                    className={`company-item ${company.isPlayer ? 'player-company' : ''}`}
                  >
                    <div className="company-header">
                      <h4 className="company-name">
                        {index + 1}. {company.name} {company.isPlayer && '(You)'}
                      </h4>
                      <div className="company-value">{formatCurrency(company.valuation)}</div>
                    </div>
                    <div className="company-stats">
                      <div className="company-stat">
                        <span className="stat-label">Products:</span>
                        <span className="stat-value">{company.products}</span>
                      </div>
                      <div className="company-stat">
                        <span className="stat-label">Users:</span>
                        <span className="stat-value">{formatNumber(company.totalUsers)}</span>
                      </div>
                      <div className="company-stat">
                        <span className="stat-label">Market Share:</span>
                        <span className="stat-value">{company.marketShare.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="market-share-bar-container">
                      <div 
                        className={`market-share-bar ${company.isPlayer ? 'player-bar' : ''}`}
                        style={{ width: `${company.marketShare}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Product Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              {Object.keys(marketShareByCategory).length > 0 ? (
                <div>
                  {Object.keys(marketShareByCategory).map(category => (
                    <div key={category} className="dashboard-card category-card">
                      <div className="card-header">{productNames[category]}</div>
                      
                      <div className="category-stats">
                        <div className="category-stat">
                          <div className="stat-label">Total Users</div>
                          <div className="stat-value">
                            {formatNumber(marketShareByCategory[category].totalUsers)}
                          </div>
                        </div>
                        <div className="category-stat">
                          <div className="stat-label">Companies</div>
                          <div className="stat-value">
                            {marketShareByCategory[category].companies.length}
                          </div>
                        </div>
                      </div>
                      
                      <h4>Market Share</h4>
                      <div className="category-companies">
                        {marketShareByCategory[category].companies.map((company, index) => (
                          <div 
                            key={index} 
                            className={`category-company ${company.isPlayer ? 'player-company' : ''}`}
                          >
                            <div className="company-header">
                              <span className="company-name">
                                {company.productName} ({company.name})
                                {company.isPlayer && ' (You)'}
                              </span>
                              <span className={`product-quality ${getQualityClass(company.quality)}`}>
                                {getQualityLabel(company.quality)} ({company.quality}/10)
                              </span>
                            </div>
                            
                            <div className="company-stats">
                              <div className="company-stat">
                                <span className="stat-label">Users:</span>
                                <span className="stat-value">{formatNumber(company.users)}</span>
                              </div>
                              <div className="company-stat">
                                <span className="stat-label">Market Share:</span>
                                <span className="stat-value">{company.marketShare.toFixed(1)}%</span>
                              </div>
                            </div>
                            
                            <div className="market-share-bar-container">
                              <div 
                                className={`market-share-bar ${company.isPlayer ? 'player-bar' : ''}`}
                                style={{ width: `${company.marketShare}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No products in the market yet.</p>
              )}
            </div>
          )}
          
          {/* Competitor Analysis Tab */}
          {activeTab === 'competitors' && (
            <div>
              <div className="competitors-list">
                {sortedCompetitors.map((competitor, index) => (
                  <div key={competitor.id} className="dashboard-card competitor-card">
                    <div className="card-header">{competitor.name}</div>
                    
                    <div className="competitor-stats">
                      <div className="competitor-stat">
                        <div className="stat-label">Valuation</div>
                        <div className="stat-value">{formatCurrency(competitor.valuation)}</div>
                      </div>
                      <div className="competitor-stat">
                        <div className="stat-label">Products</div>
                        <div className="stat-value">{competitor.products.length}</div>
                      </div>
                      <div className="competitor-stat">
                        <div className="stat-label">Founded</div>
                        <div className="stat-value">{competitor.founded.getFullYear()}</div>
                      </div>
                    </div>
                    
                    <h4>Products</h4>
                    <div className="competitor-products">
                      {competitor.products.map((product, productIndex) => (
                        <div key={productIndex} className="competitor-product">
                          <div className="product-header">
                            <span className="product-name">{product.name}</span>
                            <span className={`product-quality ${getQualityClass(product.quality)}`}>
                              {getQualityLabel(product.quality)} ({product.quality}/10)
                            </span>
                          </div>
                          
                          <div className="product-info">
                            <span className="product-type">{productNames[product.type]}</span>
                            <span className="product-users">{formatNumber(product.users)} users</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;
