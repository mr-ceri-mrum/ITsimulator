import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatNumber, formatDate, getQualityClass, getQualityLabel } from '../utils/formatters';
import { getProductNames } from '../utils/productRequirements';

const Products = () => {
  const { company, openModal, updateProduct, deleteProduct, reduceProductStaff, showSuccessNotification } = useGameStore(state => ({
    company: state.company,
    openModal: state.openModal,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    reduceProductStaff: state.reduceProductStaff,
    showSuccessNotification: state.showSuccessNotification
  }));
  
  // State for delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(null);
  // State for staff reduction confirmation
  const [confirmStaffReduction, setConfirmStaffReduction] = useState(null);
  
  const productNames = getProductNames();
  
  // Separate active products from products in development
  const activeProducts = company.products.filter(product => !product.isInDevelopment);
  const developingProducts = company.products.filter(product => product.isInDevelopment);
  
  // Handle product update
  const handleUpdateProduct = (productId, updateType) => {
    updateProduct(productId, updateType);
  };
  
  // Handle delete product click
  const handleDeleteClick = (product) => {
    setConfirmDelete(product);
  };
  
  // Handle reduce staff click
  const handleReduceStaffClick = (product) => {
    setConfirmStaffReduction(product);
  };
  
  // Confirm product deletion
  const confirmProductDelete = () => {
    if (confirmDelete) {
      deleteProduct(confirmDelete.id);
      
      // If showSuccessNotification doesn't exist in the store, we'll handle it here
      if (!showSuccessNotification) {
        console.log('Продукт успешно удален:', confirmDelete.name);
      }
      
      setConfirmDelete(null);
    }
  };
  
  // Cancel product deletion
  const cancelProductDelete = () => {
    setConfirmDelete(null);
  };
  
  // Confirm staff reduction
  const handleConfirmStaffReduction = () => {
    if (confirmStaffReduction) {
      reduceProductStaff(confirmStaffReduction.id);
      setConfirmStaffReduction(null);
    }
  };
  
  // Cancel staff reduction
  const cancelStaffReduction = () => {
    setConfirmStaffReduction(null);
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
                <button 
                  onClick={() => handleReduceStaffClick(product)}
                  className="reduce-staff-button"
                  style={{ backgroundColor: '#f39c12', marginLeft: '10px' }}
                  disabled={product.employees <= 1}
                >
                  Reduce Staff
                </button>
                <button 
                  onClick={() => handleDeleteClick(product)}
                  className="delete-button"
                  style={{ backgroundColor: '#e74c3c', marginLeft: '10px' }}
                >
                  Delete Product
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
              
              <div className="product-actions" style={{ marginTop: '15px' }}>
                <button 
                  onClick={() => handleDeleteClick(product)}
                  className="delete-button"
                  style={{ backgroundColor: '#e74c3c' }}
                >
                  Cancel Development
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any products in development.</p>
      )}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close" onClick={cancelProductDelete}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>?</p>
              
              {!confirmDelete.isInDevelopment && (
                <div>
                  <p><strong>Warning:</strong> This will result in:</p>
                  <ul>
                    <li>Loss of {formatNumber(confirmDelete.users)} users</li>
                    <li>Reduction in monthly revenue of ${formatNumber(confirmDelete.users * 15)}</li>
                    <li>Reassignment of {confirmDelete.employees || 0} team members</li>
                  </ul>
                </div>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  onClick={cancelProductDelete}
                  style={{ backgroundColor: '#95a5a6' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmProductDelete}
                  style={{ backgroundColor: '#e74c3c' }}
                >
                  Confirm Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Reduce Staff Confirmation Modal */}
      {confirmStaffReduction && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Staff Reduction</h3>
              <button className="modal-close" onClick={cancelStaffReduction}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to reduce the team size for <strong>{confirmStaffReduction.name}</strong>?</p>
              
              <div>
                <p><strong>Warning:</strong> This will result in:</p>
                <ul>
                  <li>50% reduction in team size (from {confirmStaffReduction.employees} to {Math.max(1, Math.floor(confirmStaffReduction.employees * 0.5))} employees)</li>
                  <li>Potentially negative impact on user growth and revenue if staff level is too low</li>
                  <li>Reduced ability to maintain product quality</li>
                </ul>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  onClick={cancelStaffReduction}
                  style={{ backgroundColor: '#95a5a6' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmStaffReduction}
                  style={{ backgroundColor: '#f39c12' }}
                >
                  Confirm Reduction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;