import React from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber, formatDate, getQualityClass, getQualityLabel } from '../utils/formatters';
import { getProductNames } from '../utils/productRequirements';

const Products = () => {
  const { company, openModal, updateProduct } = useGameStore(state => ({
    company: state.company,
    openModal: state.openModal,
    updateProduct: state.updateProduct
  }));
  
  const productNames = getProductNames();
  
  // Separate active products from products in development
  const activeProducts = company.products.filter(product => !product.isInDevelopment);
  const developingProducts = company.products.filter(product => product.isInDevelopment);
  
  // Handle product update
  const handleUpdateProduct = (productId, updateType) => {
    updateProduct(productId, updateType);
  };
  
  return (
    <div>
      <h1>Products</h1>
      
      <h2>Active Products</h2>
      {activeProducts.length > 0 ? (
        <div className="products-list">
          {activeProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className={`product-quality ${getQualityClass(product.quality)}`}>
                  {getQualityLabel(product.quality)} ({product.quality}/10)
                </span>
              </div>
              
              <div className="product-info">
                <p><strong>Type:</strong> {productNames[product.type]}</p>
                <p><strong>Launch Date:</strong> {formatDate(product.launchDate)}</p>
              </div>
              
              <div className="product-stats">
                <div className="product-stat">
                  <div className="stat-label">Users</div>
                  <div className="stat-value">{formatNumber(product.users)}</div>
                </div>
                <div className="product-stat">
                  <div className="stat-label">Team Size</div>
                  <div className="stat-value">{product.employees || 0}</div>
                </div>
                <div className="product-stat">
                  <div className="stat-label">Monthly Revenue</div>
                  <div className="stat-value">${formatNumber(product.users * 15)}</div>
                </div>
              </div>
              
              <div className="product-actions">
                <button onClick={() => handleUpdateProduct(product.id, 'maintain')}>
                  Maintain Quality
                </button>
                <button onClick={() => handleUpdateProduct(product.id, 'minor')}>
                  Minor Update (+1)
                </button>
                <button onClick={() => handleUpdateProduct(product.id, 'major')}>
                  Major Update (+2)
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any active products yet. Develop a product in the Development tab.</p>
      )}
      
      <h2>Products In Development</h2>
      {developingProducts.length > 0 ? (
        <div className="products-list">
          {developingProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="development-progress">
                  Development: {Math.round(product.developmentProgress)}%
                </span>
              </div>
              
              <div className="product-info">
                <p><strong>Type:</strong> {productNames[product.type]}</p>
              </div>
              
              <div className="development-bar-container">
                <div 
                  className="development-bar" 
                  style={{ width: `${product.developmentProgress}%` }}
                ></div>
              </div>
              
              <div className="product-resource-allocation">
                <h4>Resource Allocation:</h4>
                <div className="resource-bars">
                  {Object.entries(product.developmentResources).map(([resource, value]) => (
                    <div key={resource} className="resource-bar-container">
                      <div className="resource-label">{resource.charAt(0).toUpperCase() + resource.slice(1)}</div>
                      <div className="resource-bar-wrapper">
                        <div 
                          className="resource-bar" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <div className="resource-value">{value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any products in development.</p>
      )}
    </div>
  );
};

export default Products;
