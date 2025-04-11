import React, { useState } from 'react';
import { useGameStore } from '../store';
import { getProductTypes } from '../utils/aiCompanies';
import { getProductNames, getProductRequirements } from '../utils/productRequirements';

const Development = () => {
  const { startProductDevelopment, launchProduct, company } = useGameStore(state => ({
    startProductDevelopment: state.startProductDevelopment,
    launchProduct: state.launchProduct,
    company: state.company
  }));
  
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('search');
  const [resourceAllocation, setResourceAllocation] = useState({
    backend: 20,
    frontend: 20,
    infra: 20,
    ai: 20,
    db: 20
  });
  const [error, setError] = useState('');
  
  const productTypes = getProductTypes();
  const productNames = getProductNames();
  const productRequirements = getProductRequirements();
  
  // Handle resource allocation change
  const handleResourceChange = (resource, value) => {
    // Calculate total allocated resources across all categories
    const total = Object.entries(resourceAllocation)
      .reduce((sum, [key, val]) => key !== resource ? sum + val : sum, 0) + parseInt(value);
    
    // Ensure total doesn't exceed 100%
    if (total > 100) {
      setError(`Total resource allocation cannot exceed 100%. Current total: ${total}%`);
      return;
    }
    
    setError('');
    setResourceAllocation({
      ...resourceAllocation,
      [resource]: parseInt(value)
    });
  };
  
  // Start product development
  const handleStartDevelopment = () => {
    if (!productName.trim()) {
      setError('Please enter a product name');
      return;
    }
    
    // Validate that resource allocation adds up to 100%
    const totalAllocation = Object.values(resourceAllocation).reduce((sum, val) => sum + val, 0);
    if (totalAllocation !== 100) {
      setError(`Resource allocation must add up to 100%. Current total: ${totalAllocation}%`);
      return;
    }
    
    // Проверка, существует ли функция startProductDevelopment
    if (typeof startProductDevelopment !== 'function') {
      setError('Функция запуска разработки продукта недоступна. Обратитесь к администратору.');
      console.error('startProductDevelopment is not a function!');
      return;
    }
    
    try {
      // Start product development
      startProductDevelopment(productType, productName, resourceAllocation);
      
      // Reset form
      setProductName('');
      setProductType('search');
      setResourceAllocation({
        backend: 20,
        frontend: 20,
        infra: 20,
        ai: 20,
        db: 20
      });
      setError('');
    } catch (err) {
      console.error('Error starting product development:', err);
      setError('Произошла ошибка при запуске разработки продукта.');
    }
  };
  
  // Launch completed product
  const handleLaunchProduct = (productId) => {
    if (typeof launchProduct !== 'function') {
      setError('Функция запуска продукта недоступна. Обратитесь к администратору.');
      console.error('launchProduct is not a function!');
      return;
    }
    
    try {
      launchProduct(productId);
    } catch (err) {
      console.error('Error launching product:', err);
      setError('Произошла ошибка при запуске продукта.');
    }
  };
  
  // Developing products list
  const developingProducts = company && company.products ? 
    company.products.filter(product => product.isInDevelopment) : [];
  
  // Ideal resource allocation for the selected product type
  const idealAllocation = productRequirements[productType] || {
    backend: 20, frontend: 20, infra: 20, ai: 20, db: 20
  };
  
  return (
    <div>
      <h2>Product Development</h2>
      
      <div className="dashboard-card">
        <div className="card-header">Create New Product</div>
        
        <div className="form-group">
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="productType">Product Type:</label>
          <select
            id="productType"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            {productTypes.map(type => (
              <option key={type} value={type}>
                {productNames[type]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <h4>Resource Allocation (100% Total)</h4>
          <p className="tip">
            Tip: For {productNames[productType]}, the ideal resource allocation is around:
            Backend: {idealAllocation.backend}%, 
            Frontend: {idealAllocation.frontend}%, 
            Infrastructure: {idealAllocation.infra}%, 
            AI: {idealAllocation.ai}%, 
            Database: {idealAllocation.db}%
          </p>
          
          {Object.entries(resourceAllocation).map(([resource, value]) => (
            <div key={resource} className="slider-container">
              <label htmlFor={`resource-${resource}`}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}:
                <span className="slider-value">{value}%</span>
              </label>
              <input
                type="range"
                id={`resource-${resource}`}
                min="0"
                max="100"
                value={value}
                onChange={(e) => handleResourceChange(resource, e.target.value)}
              />
            </div>
          ))}
          
          <div className="total-allocation">
            Total Allocation: {Object.values(resourceAllocation).reduce((sum, val) => sum + val, 0)}%
            {error && <div className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</div>}
          </div>
        </div>
        
        <button onClick={handleStartDevelopment}>Start Development</button>
      </div>
      
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
              
              <div className="development-bar-container" style={{
                height: '20px',
                backgroundColor: '#eee',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '10px 0'
              }}>
                <div 
                  className="development-bar" 
                  style={{ 
                    width: `${product.developmentProgress}%`,
                    height: '100%',
                    backgroundColor: '#3498db'
                  }}
                ></div>
              </div>
              
              <div className="product-resource-allocation">
                <h4>Resource Allocation:</h4>
                <div className="resource-bars" style={{marginTop: '10px'}}>
                  {Object.entries(product.developmentResources).map(([resource, value]) => (
                    <div key={resource} className="resource-bar-container" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <div className="resource-label" style={{width: '80px'}}>
                        {resource.charAt(0).toUpperCase() + resource.slice(1)}
                      </div>
                      <div className="resource-bar-wrapper" style={{
                        flex: 1,
                        height: '12px',
                        backgroundColor: '#eee',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        margin: '0 10px'
                      }}>
                        <div 
                          className="resource-bar" 
                          style={{ 
                            width: `${value}%`,
                            height: '100%',
                            backgroundColor: '#2ecc71'
                          }}
                        ></div>
                      </div>
                      <div className="resource-value" style={{width: '40px'}}>{value}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {product.developmentProgress >= 100 && (
                <div className="product-actions" style={{marginTop: '15px'}}>
                  <button 
                    onClick={() => handleLaunchProduct(product.id)}
                    className="launch-button"
                    style={{
                      backgroundColor: '#27ae60',
                      padding: '8px 16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Launch Product
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any products in development.</p>
      )}
    </div>
  );
};

export default Development;
