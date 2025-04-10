import { create } from 'zustand';
import { generateRandomCompanies } from '../utils/aiCompanies';
import { getProductRequirements } from '../utils/productRequirements';

// Maximum global population
const MAX_GLOBAL_POPULATION = 8000000000; // 8 billion people

// Tax rate
const CORPORATE_TAX_RATE = 0.23; // 23% corporate tax

export const useGameStore = create((set, get) => ({
  // Game state
  gameStarted: false,
  isPaused: true,
  gameSpeed: 1, // 1 = normal, 2 = 2x, 4 = 4x
  
  // Time settings
  currentDate: new Date(2004, 0, 1), // Start on January 1, 2004
  
  // Company data
  company: {
    name: '',
    founded: new Date(2004, 0, 1),
    cash: 1000000, // Start with $1M
    valuation: 1000000,
    employees: 0,
    servers: 0,
    products: [],
    monthlyIncome: 0,
    monthlyExpenses: 0,
    marketingBudget: 0,
    acquiredCompanies: [], // List of acquired companies
  },
  
  // Market data
  potentialUsers: 5000000000, // 5 billion potential users in 2004
  competitors: [], // AI companies
  
  // UI state
  activeView: 'dashboard',
  modalContent: null,
  
  // Initialize the game
  startGame: (companyName) => {
    const competitors = generateRandomCompanies(150); // Generate 150 AI competitors
    
    set({
      gameStarted: true,
      isPaused: false, // Start game running automatically
      company: {
        ...get().company,
        name: companyName,
      },
      competitors,
    });
  },
  
  // Game controls
  togglePause: () => set(state => ({ isPaused: !state.isPaused })),
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  
  // Navigation
  setActiveView: (view) => set({ activeView: view }),
  
  // Modal management
  openModal: (content) => set({ modalContent: content }),
  closeModal: () => set({ modalContent: null }),
  
  // Employee management
  hireEmployees: (count) => {
    const { company } = get();
    const cost = count * 10000; // $10k per employee
    
    if (company.cash >= cost) {
      set({
        company: {
          ...company,
          employees: company.employees + count,
          cash: company.cash - cost,
        }
      });
      return true;
    }
    return false; // Not enough cash
  },
  
  // Server management
  addServers: (count) => {
    const { company } = get();
    const cost = count * 1000; // $1k per server initially
    
    if (company.cash >= cost) {
      set({
        company: {
          ...company,
          servers: company.servers + count,
          cash: company.cash - cost,
        }
      });
      return true;
    }
    return false; // Not enough cash
  },
  
  // Marketing
  setMarketingBudget: (budget) => {
    set(state => ({
      company: {
        ...state.company,
        marketingBudget: budget
      }
    }));
  },
  
  // Acquire a competitor company
  acquireCompany: (competitorId) => {
    set(state => {
      // Find the competitor to acquire
      const competitorIndex = state.competitors.findIndex(c => c.id === competitorId);
      if (competitorIndex === -1) return state; // Competitor not found
      
      const competitor = state.competitors[competitorIndex];
      
      // Calculate acquisition cost (2x valuation)
      const acquisitionCost = competitor.valuation * 2;
      
      // Check if company has enough cash
      if (state.company.cash < acquisitionCost) {
        // Not enough cash to acquire
        return state;
      }
      
      // Create a copy of competitors without the acquired one
      const updatedCompetitors = [
        ...state.competitors.slice(0, competitorIndex),
        ...state.competitors.slice(competitorIndex + 1)
      ];
      
      // Add the competitor's products to the player's company
      const updatedProducts = [
        ...state.company.products,
        ...competitor.products.map(product => ({
          ...product,
          name: `${product.name} (Acquired)` // Mark as acquired
        }))
      ];
      
      // Record the acquisition
      const acquiredCompany = {
        id: competitor.id,
        name: competitor.name,
        acquisitionDate: new Date(state.currentDate),
        acquisitionPrice: acquisitionCost,
        valuation: competitor.valuation,
        productCount: competitor.products.length
      };
      
      return {
        competitors: updatedCompetitors,
        company: {
          ...state.company,
          cash: state.company.cash - acquisitionCost,
          products: updatedProducts,
          acquiredCompanies: [...state.company.acquiredCompanies, acquiredCompany]
        }
      };
    });
  },
  
  // Product development
  startProductDevelopment: (productType, name, resources) => {
    const { company } = get();
    const product = {
      id: Date.now(),
      type: productType,
      name,
      developmentProgress: 0,
      developmentResources: resources, // { backend: 0-100, frontend: 0-100, infra: 0-100, ai: 0-100, db: 0-100 }
      launchDate: null,
      quality: 0,
      users: 0,
      employees: 0,
      isInDevelopment: true,
    };
    
    set({
      company: {
        ...company,
        products: [...company.products, product],
      }
    });
    
    return product.id;
  },
  
  updateProductDevelopment: (productId, progress) => {
    set(state => {
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            developmentProgress: Math.min(100, product.developmentProgress + progress)
          };
        }
        return product;
      });
      
      return {
        company: {
          ...state.company,
          products: updatedProducts
        }
      };
    });
  },
  
  launchProduct: (productId) => {
    set(state => {
      const productRequirements = getProductRequirements();
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId && product.developmentProgress >= 100) {
          // Calculate product quality based on how well resources match ideal distribution
          const idealDistribution = productRequirements[product.type] || { 
            backend: 20, frontend: 20, infra: 20, ai: 20, db: 20 
          };
          
          let matchScore = 0;
          const resourceTypes = ['backend', 'frontend', 'infra', 'ai', 'db'];
          
          resourceTypes.forEach(type => {
            // Calculate how close this resource allocation is to ideal (100 = perfect match, 0 = complete mismatch)
            const diff = Math.abs(product.developmentResources[type] - idealDistribution[type]);
            const typeScore = Math.max(0, 100 - diff * 2); // 0-100 scale
            matchScore += typeScore;
          });
          
          // Average score across all 5 resource types (0-100)
          const avgMatchScore = matchScore / resourceTypes.length;
          
          // Convert to 0-10 quality scale
          const quality = Math.round(avgMatchScore / 10);
          
          return {
            ...product,
            isInDevelopment: false,
            launchDate: new Date(state.currentDate),
            quality,
            employees: Math.ceil(5 + (Math.random() * 5)), // Initial team to support the product
          };
        }
        return product;
      });
      
      return {
        company: {
          ...state.company,
          products: updatedProducts
        }
      };
    });
  },
  
  updateProduct: (productId, updateType) => {
    set(state => {
      const updatedProducts = state.company.products.map(product => {
        if (product.id === productId && !product.isInDevelopment) {
          let qualityIncrease = 0;
          let requiredEmployees = 0;
          
          if (updateType === 'maintain') {
            qualityIncrease = 0; // Just prevent degradation
            requiredEmployees = Math.ceil(product.users / 2000 * 0.3); // 30% more than base
          } else if (updateType === 'minor') {
            qualityIncrease = 1;
            requiredEmployees = Math.ceil(product.users / 2000 * 0.5); // 50% more than base
          } else if (updateType === 'major') {
            qualityIncrease = 2;
            requiredEmployees = Math.ceil(product.users / 2000 * 0.8); // 80% more than base
          }
          
          return {
            ...product,
            quality: Math.min(10, product.quality + qualityIncrease),
            employees: product.employees + requiredEmployees,
            lastUpdated: new Date(state.currentDate)
          };
        }
        return product;
      });
      
      return {
        company: {
          ...state.company,
          products: updatedProducts
        }
      };
    });
  },
  
  // Game tick (simulation step)
  tick: () => {
    if (get().isPaused) return;
    
    set(state => {
      // Create a new date by adding one month
      const newDate = new Date(state.currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // Increase potential global user base, capped at MAX_GLOBAL_POPULATION
      // Growth of ~250M per year (about 20.8M per month)
      const newPotentialUsers = Math.min(
        MAX_GLOBAL_POPULATION, 
        state.potentialUsers + 20800000
      );
      
      // Calculate total active users across all companies
      let totalActiveUsers = 0;
      
      // Count users from player's products
      state.company.products.forEach(product => {
        if (!product.isInDevelopment) {
          totalActiveUsers += product.users;
        }
      });
      
      // Count users from AI companies
      state.competitors.forEach(competitor => {
        competitor.products.forEach(product => {
          totalActiveUsers += product.users;
        });
      });
      
      // Process product users and financials
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      let requiredEmployees = 0;
      let requiredServers = 0;
      
      const updatedProducts = state.company.products.map(product => {
        if (product.isInDevelopment) {
          // Progress development (simplified for this demo)
          const progress = 5 + Math.random() * 10; // 5-15% progress per month
          return {
            ...product,
            developmentProgress: Math.min(100, product.developmentProgress + progress)
          };
        } else {
          // Live product logic
          let newUsers = product.users;
          const yearsSinceLaunch = (newDate - new Date(product.launchDate)) / (1000 * 60 * 60 * 24 * 365);
          
          // Check if we need to degrade quality due to age (every year)
          let updatedQuality = product.quality;
          
          // Check if a full year has passed since product launch or last update
          const lastUpdatedDate = product.lastUpdated ? new Date(product.lastUpdated) : new Date(product.launchDate);
          const fullYearsPassed = Math.floor((newDate - lastUpdatedDate) / (1000 * 60 * 60 * 24 * 365));
          
          // Only degrade if a full year has passed
          if (fullYearsPassed > 0) {
            updatedQuality = Math.max(1, product.quality - 2 * fullYearsPassed); // Degrade by 2 points per year
          }
          
          // Calculate user growth based on quality and current user base
          let monthlyGrowthRate = 0;
          
          // Special growth rules for products with 1 billion+ users
          if (product.users >= 1000000000) {
            // Monthly growth rates equivalent to the specified yearly rates
            switch (updatedQuality) {
              case 10: monthlyGrowthRate = 0.00083; break; // ~1% per year
              case 9: monthlyGrowthRate = 0; break;        // Stays the same
              case 8: monthlyGrowthRate = -0.00583; break; // ~-7% per year
              case 7: monthlyGrowthRate = -0.01; break;    // Faster decline
              case 6: monthlyGrowthRate = -0.015; break;   // Faster decline
              default: monthlyGrowthRate = -0.02; break;   // Faster decline for < 6 quality
            }
          } else {
            // Standard growth rates for products under 1 billion users
            switch (updatedQuality) {
              case 10: monthlyGrowthRate = 0.1; break;
              case 9: monthlyGrowthRate = 0.08; break;
              case 8: monthlyGrowthRate = 0.06; break;
              case 7: monthlyGrowthRate = 0.04; break;
              case 6: monthlyGrowthRate = 0.01; break;
              case 5: monthlyGrowthRate = -0.01; break;
              case 4: monthlyGrowthRate = -0.05; break;
              case 3: monthlyGrowthRate = -0.1; break;
              case 2: monthlyGrowthRate = -0.15; break;
              case 1: monthlyGrowthRate = -0.2; break;
              default: monthlyGrowthRate = 0;
            }
          }
          
          // Apply growth rate
          newUsers = Math.floor(newUsers * (1 + monthlyGrowthRate));
          
          // Add users from marketing, but with diminishing returns based on market saturation
          if (state.company.marketingBudget > 0) {
            // Calculate market saturation factor (0-1, where 1 means no saturation)
            const marketSaturation = 1 - Math.min(1, totalActiveUsers / newPotentialUsers);
            
            // Apply diminishing returns to marketing based on saturation
            const marketingEffectiveness = 5 * marketSaturation;
            const newUsersFromMarketing = Math.floor(state.company.marketingBudget / marketingEffectiveness);
            
            newUsers += newUsersFromMarketing;
          }
          
          // Calculate needed resources
          const productEmployees = Math.ceil(newUsers / 2000) + product.employees; // Support + development
          
          // Automatic server allocation - 10$ for every 300 users (instead of manual allocation)
          const productServers = Math.ceil(newUsers / 300);
          
          requiredEmployees += productEmployees;
          requiredServers += productServers;
          
          // Calculate product revenue and expenses
          const productRevenue = newUsers * 15; // $15 per user per month
          monthlyIncome += productRevenue;
          
          // Cap user growth by total available market
          // Each product can capture at most 40% of the potential market
          const productMarketCap = newPotentialUsers * 0.4;
          newUsers = Math.min(newUsers, productMarketCap);
          
          return {
            ...product,
            users: newUsers,
            quality: updatedQuality
          };
        }
      });
      
      // Fixed expenses
      const employeeCost = state.company.employees * 10000;
      const serverCost = requiredServers * 10; // Server cost now based on required servers
      const marketingCost = state.company.marketingBudget;
      
      // Pre-tax expenses
      const preTaxExpenses = employeeCost + serverCost + marketingCost;
      
      // Calculate profit before tax
      const profitBeforeTax = monthlyIncome - preTaxExpenses;
      
      // Calculate tax (only on profits, no tax if loss)
      const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * CORPORATE_TAX_RATE : 0;
      
      // Total expenses including tax
      monthlyExpenses = preTaxExpenses + taxAmount;
      
      // Update cash
      const newCash = state.company.cash + monthlyIncome - monthlyExpenses;
      
      // Update company valuation (simple calculation)
      // Base on total users, cash, and product quality
      const totalUsers = updatedProducts.reduce((sum, product) => sum + (product.isInDevelopment ? 0 : product.users), 0);
      const avgQuality = updatedProducts.length > 0 ? 
        updatedProducts.reduce((sum, product) => sum + (product.isInDevelopment ? 0 : product.quality), 0) / 
        updatedProducts.filter(p => !p.isInDevelopment).length : 0;
      
      const newValuation = Math.max(
        0,
        totalUsers * 20 + // $20 per user
        newCash * 2 + // 2x cash value
        avgQuality * 10000000 // $10M per average quality point
      );
      
      // Auto-adjust employees if cash allows
      let newEmployees = state.company.employees;
      
      if (requiredEmployees > newEmployees && newCash > (requiredEmployees - newEmployees) * 10000) {
        newEmployees = requiredEmployees;
      }
      
      // Handle AI acquisitions
      let updatedCompetitors = [...state.competitors];
      
      // AI companies can attempt to acquire other AI companies
      const aiAcquisitionAttempts = () => {
        // Sort competitors by valuation (richest first)
        const sortedCompetitors = [...updatedCompetitors].sort((a, b) => b.valuation - a.valuation);
        
        // Only top 10% companies can acquire others
        const acquirerCount = Math.max(1, Math.floor(sortedCompetitors.length * 0.1));
        const potentialAcquirers = sortedCompetitors.slice(0, acquirerCount);
        
        for (const acquirer of potentialAcquirers) {
          // 5% chance to attempt acquisition
          if (Math.random() > 0.05) continue;
          
          // Find a smaller company to acquire (bottom 50%)
          const targetIndex = Math.floor(Math.random() * Math.floor(sortedCompetitors.length * 0.5)) + Math.floor(sortedCompetitors.length * 0.5);
          
          if (targetIndex >= sortedCompetitors.length) continue;
          
          const target = sortedCompetitors[targetIndex];
          
          // Skip if trying to acquire itself
          if (acquirer.id === target.id) continue;
          
          // Calculate acquisition price (2x valuation)
          const acquisitionPrice = target.valuation * 2;
          
          // Check if acquirer can afford it (needs at least 3x valuation in cash)
          if (acquirer.valuation < acquisitionPrice * 3) continue;
          
          // Perform acquisition
          const targetCompetitorIndex = updatedCompetitors.findIndex(c => c.id === target.id);
          
          if (targetCompetitorIndex !== -1) {
            // Remove target from competitors list
            const targetCompetitor = updatedCompetitors[targetCompetitorIndex];
            updatedCompetitors.splice(targetCompetitorIndex, 1);
            
            // Find acquirer in the updated list
            const acquirerIndex = updatedCompetitors.findIndex(c => c.id === acquirer.id);
            
            if (acquirerIndex !== -1) {
              // Add target's products to acquirer
              const acquirerCompetitor = updatedCompetitors[acquirerIndex];
              
              // Record acquisition in acquirer's history
              const acquiredCompany = {
                id: targetCompetitor.id,
                name: targetCompetitor.name,
                acquisitionDate: new Date(newDate),
                acquisitionPrice: acquisitionPrice,
                productCount: targetCompetitor.products.length
              };
              
              // Update the acquirer
              updatedCompetitors[acquirerIndex] = {
                ...acquirerCompetitor,
                products: [
                  ...acquirerCompetitor.products,
                  ...targetCompetitor.products.map(product => ({
                    ...product,
                    name: `${product.name} (Acquired by ${acquirerCompetitor.name})`
                  }))
                ],
                acquiredCompanies: [
                  ...(acquirerCompetitor.acquiredCompanies || []),
                  acquiredCompany
                ]
              };
            }
          }
        }
        
        return updatedCompetitors;
      };
      
      // Process AI competitors with acquisition logic
      updatedCompetitors = aiAcquisitionAttempts();
      
      // Process regular AI competitor behavior
      updatedCompetitors = updatedCompetitors.map(competitor => {
        // Simple AI behavior:
        // 1. Randomly improve products
        // 2. Random chance to add a new product
        // 3. Update users and valuation
        
        const updatedProducts = competitor.products.map(product => {
          // Random chance to improve product
          const shouldImprove = Math.random() < 0.1; // Reduced from 0.3
          let quality = product.quality;
          
          if (shouldImprove) {
            quality = Math.min(10, quality + 1);
          } else if (Math.random() < 0.05) { // Reduced from 0.1
            // Random chance of degradation
            quality = Math.max(1, quality - 1);
          }
          
          // Update users based on quality and current user base
          let growthRate = 0;
          
          // Apply special growth rules for products with 1 billion+ users
          if (product.users >= 1000000000) {
            switch (quality) {
              case 10: growthRate = 0.00083; break; // ~1% per year
              case 9: growthRate = 0; break;        // Stays the same
              case 8: growthRate = -0.00583; break; // ~-7% per year
              case 7: growthRate = -0.01; break;    // Faster decline
              case 6: growthRate = -0.015; break;   // Faster decline
              default: growthRate = -0.02; break;   // Faster decline for < 6 quality
            }
          } else {
            // Standard growth rates for products under 1 billion users
            switch (quality) {
              case 10: growthRate = 0.1; break;
              case 9: growthRate = 0.08; break;
              case 8: growthRate = 0.06; break;
              case 7: growthRate = 0.04; break;
              case 6: growthRate = 0.01; break;
              case 5: growthRate = -0.01; break;
              case 4: growthRate = -0.05; break;
              case 3: growthRate = -0.1; break;
              case 2: growthRate = -0.15; break;
              case 1: growthRate = -0.2; break;
              default: growthRate = 0;
            }
          }
          
          // Calculate new users with growth rate
          let newUsers = Math.max(0, Math.floor(product.users * (1 + growthRate)));
          
          // Cap users at 30% of potential market to prevent domination
          const aiMarketCap = newPotentialUsers * 0.3; 
          newUsers = Math.min(newUsers, aiMarketCap);
          
          return {
            ...product,
            quality,
            users: newUsers
          };
        });
        
        // Random chance to add a new product - reduced from 0.05 to 0.01
        let finalProducts = [...updatedProducts];
        if (Math.random() < 0.01) {
          const productTypes = [
            'search', 'video', 'social', 'mobileOS', 'desktopOS', 
            'smartphone', 'console', 'cloud', 'ridesharing', 'ecommerce',
            'ai', 'messenger', 'office', 'antivirus', 'database', 'devtools'
          ];
          
          // Start with fewer users (max 100k instead of 1M)
          const newProduct = {
            id: Date.now() + Math.random(),
            type: productTypes[Math.floor(Math.random() * productTypes.length)],
            name: `${competitor.name} ${productTypes[Math.floor(Math.random() * productTypes.length)]}`,
            quality: Math.floor(Math.random() * 4) + 2, // 2-5 quality (was 3-8)
            users: Math.floor(Math.random() * 100000), // 0-100k users (was 0-1M)
            launchDate: new Date(newDate)
          };
          
          finalProducts.push(newProduct);
        }
        
        // Calculate new valuation
        const totalUsers = finalProducts.reduce((sum, product) => sum + product.users, 0);
        const avgQuality = finalProducts.length > 0 ? 
          finalProducts.reduce((sum, product) => sum + product.quality, 0) / finalProducts.length : 0;
        
        const newValuation = totalUsers * 20 + avgQuality * 10000000;
        
        return {
          ...competitor,
          products: finalProducts,
          valuation: newValuation,
          acquiredCompanies: competitor.acquiredCompanies || [] // Ensure this exists
        };
      });
      
      return {
        currentDate: newDate,
        potentialUsers: newPotentialUsers,
        company: {
          ...state.company,
          cash: newCash,
          valuation: newValuation,
          products: updatedProducts,
          employees: newEmployees,
          servers: requiredServers, // Automatically adjusted servers
          monthlyIncome,
          monthlyExpenses
        },
        competitors: updatedCompetitors
      };
    });
  }
}));
