import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const StartGame = () => {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const startGame = useGameStore(state => state.startGame);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }
    
    startGame(companyName);
  };
  
  return (
    <div className="start-game-container">
      <h1 className="start-game-title">IT Empire Tycoon</h1>
      
      <div className="start-game-form">
        <h2>Create Your IT Company</h2>
        <p>Start your journey from a small startup to a global tech giant.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Company Name:</label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name"
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="form-group">
            <p><strong>Starting Conditions:</strong></p>
            <ul>
              <li>$1,000,000 initial funding</li>
              <li>January 2004</li>
              <li>0 users, 0 products</li>
              <li>Competing against 15 AI companies</li>
            </ul>
          </div>
          
          <button type="submit" className="start-button">
            Start Your Company
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartGame;
