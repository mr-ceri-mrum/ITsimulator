import { create } from 'zustand';
import { generateRandomCompanies } from '../utils/aiCompanies';
import { getProductRequirements } from '../utils/productRequirements';

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
      
      // Increase potential global user base by ~83M per month (1B per year)
      const newPotentialUsers = state.potentialUsers + 83333333;
      
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
          
          // Calculate user growth based on quality
          let monthlyGrowthRate = 0;
          switch (updatedQuality) {
            case 10: monthlyGrowthRate = 0.3; break;
            case 9: monthlyGrowthRate = 0.28; break;
            case 8: monthlyGrowthRate = 0.22; break;
            case 7: monthlyGrowthRate = 0.18; break;
            case 6: monthlyGrowthRate = 0.02; break;
            case 5: monthlyGrowthRate = -0.02; break;
            case 4: monthlyGrowthRate = -0.2; break;
            case 3: monthlyGrowthRate = -0.35; break;
            case 2: monthlyGrowthRate = -0.55; break;
            case 1: monthlyGrowthRate = -0.65; break;
            default: monthlyGrowthRate = 0;
          }
          
          // Apply growth rate
          newUsers = Math.floor(newUsers * (1 + monthlyGrowthRate));
          
          // Add users from marketing
          if (state.company.marketingBudget > 0) {
            const newUsersFromMarketing = Math.floor(state.company.marketingBudget / 5);
            newUsers += newUsersFromMarketing;
          }
          
          // Calculate needed resources
          const productEmployees = Math.ceil(newUsers / 2000) + product.employees; // Support + development
          const productServers = Math.ceil(newUsers / 100);
          
          requiredEmployees += productEmployees;
          requiredServers += productServers;
          
          // Calculate product revenue and expenses
          const productRevenue = newUsers * 15; // $15 per user per month
          monthlyIncome += productRevenue;
          
          // Cap user growth by total available market
          newUsers = Math.min(newUsers, state.potentialUsers);
          
          return {
            ...product,
            users: newUsers,
            quality: updatedQuality
          };
        }
      });
      
      // Fixed expenses
      const employeeCost = state.company.employees * 10000;
      const serverCost = state.company.servers * 10;
      const marketingCost = state.company.marketingBudget;
      
      monthlyExpenses = employeeCost + serverCost + marketingCost;
      
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
      
      // Auto-adjust employees and servers if cash allows (simplified)
      let newEmployees = state.company.employees;
      let newServers = state.company.servers;
      
      if (requiredEmployees > newEmployees && newCash > (requiredEmployees - newEmployees) * 10000) {
        newEmployees = requiredEmployees;
      }
      
      if (requiredServers > newServers && newCash > (requiredServers - newServers) * 10) {
        newServers = requiredServers;
      }
      
      // Process AI competitors (simplified)
      const updatedCompetitors = state.competitors.map(competitor => {
        // Simple AI behavior:
        // 1. Randomly improve products
        // 2. Random chance to add a new product
        // 3. Update users and valuation
        
        const updatedProducts = competitor.products.map(product => {
          // Random chance to improve product
          const shouldImprove = Math.random() < 0.3;
          let quality = product.quality;
          
          if (shouldImprove) {
            quality = Math.min(10, quality + 1);
          } else if (Math.random() < 0.1) {
            // Random chance of degradation
            quality = Math.max(1, quality - 1);
          }
          
          // Update users based on quality
          let growthRate = 0;
          switch (quality) {
            case 10: growthRate = 0.3; break;
            case 9: growthRate = 0.28; break;
            case 8: growthRate = 0.22; break;
            case 7: growthRate = 0.18; break;
            case 6: growthRate = 0.02; break;
            case 5: growthRate = -0.02; break;
            case 4: growthRate = -0.2; break;
            case 3: growthRate = -0.35; break;
            case 2: growthRate = -0.55; break;
            case 1: growthRate = -0.65; break;
            default: growthRate = 0;
          }
          
          const newUsers = Math.max(0, Math.floor(product.users * (1 + growthRate)));
          
          return {
            ...product,
            quality,
            users: newUsers
          };
        });
        
        // Random chance to add a new product
        let finalProducts = [...updatedProducts];
        if (Math.random() < 0.05) {
          const productTypes = [
            'search', 'video', 'social', 'mobileOS', 'desktopOS', 
            'smartphone', 'console', 'cloud', 'ridesharing', 'ecommerce',
            'ai', 'messenger', 'office', 'antivirus', 'database', 'devtools'
          ];
          
          const newProduct = {
            id: Date.now() + Math.random(),
            type: productTypes[Math.floor(Math.random() * productTypes.length)],
            name: `${competitor.name} ${productTypes[Math.floor(Math.random() * productTypes.length)]}`,
            quality: Math.floor(Math.random() * 6) + 3, // 3-8 quality
            users: Math.floor(Math.random() * 1000000),
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
          valuation: newValuation
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
          servers: newServers,
          monthlyIncome,
          monthlyExpenses
        },
        competitors: updatedCompetitors
      };
    });
  }
}));
