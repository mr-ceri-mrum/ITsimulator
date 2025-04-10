/**
 * This module defines the ideal resource allocation for each product type.
 * When a player is developing a product, the closer their resource allocation
 * matches these optimal distributions, the higher quality the product will be.
 */

export const getProductRequirements = () => {
  return {
    // Search Engine (e.g., Google)
    search: {
      backend: 40,   // Heavy backend processing for search indexing
      frontend: 20,  // Clean simple interface
      infra: 15,     // Significant infrastructure needs
      ai: 15,        // Ranking algorithms, relevance
      db: 10         // Database for indexing and caching
    },
    
    // Video Platform (e.g., YouTube)
    video: {
      backend: 25,   // Video processing
      frontend: 30,  // User interface for viewing/uploading
      infra: 30,     // Heavy infrastructure for video storage/delivery
      ai: 5,         // Recommendations, content filtering
      db: 10         // Database for metadata
    },
    
    // Social Network (e.g., Facebook)
    social: {
      backend: 25,   // Backend services
      frontend: 35,  // User experience focus
      infra: 15,     // Scale for many users
      ai: 10,        // Feed algorithms, recommendations
      db: 15         // User data, relationships, content
    },
    
    // Mobile OS (e.g., Android, iOS)
    mobileOS: {
      backend: 30,   // OS kernel and services
      frontend: 35,  // UI/UX is critical
      infra: 10,     // Development infrastructure
      ai: 10,        // Smart assistants, predictions
      db: 15         // System databases, app stores
    },
    
    // Desktop OS (e.g., Windows, macOS)
    desktopOS: {
      backend: 40,   // OS kernel and services
      frontend: 30,  // UI/UX
      infra: 10,     // Development infrastructure
      ai: 5,         // Assistants, search
      db: 15         // System databases, app handling
    },
    
    // Smartphone Hardware + OS
    smartphone: {
      backend: 25,   // Device firmware and OS
      frontend: 30,  // Physical design and UI
      infra: 30,     // Manufacturing setup
      ai: 5,         // Device features
      db: 10         // System services
    },
    
    // Gaming Console
    console: {
      backend: 30,   // System software
      frontend: 25,  // Physical design and UI
      infra: 35,     // Hardware manufacturing
      ai: 5,         // Game recommendations, features
      db: 5          // System databases
    },
    
    // Cloud Platform (AWS, Azure, GCP)
    cloud: {
      backend: 35,   // Cloud services
      frontend: 10,  // Admin interfaces
      infra: 35,     // Massive infrastructure
      ai: 10,        // Service offerings
      db: 10         // Management systems
    },
    
    // Ridesharing/Delivery (Uber, DoorDash)
    ridesharing: {
      backend: 30,   // Matching algorithms
      frontend: 25,  // User apps (customer and driver)
      infra: 15,     // Server infrastructure
      ai: 20,        // Route optimization, pricing
      db: 10         // User and transaction data
    },
    
    // E-commerce Platform (Amazon)
    ecommerce: {
      backend: 25,   // Backend systems
      frontend: 30,  // Shopping experience
      infra: 15,     // Scalable infrastructure
      ai: 15,        // Recommendations, pricing
      db: 15         // Product and user databases
    },
    
    // AI Products (ChatGPT, Midjourney)
    ai: {
      backend: 15,   // Service backend
      frontend: 15,  // Interface
      infra: 20,     // Computing infrastructure
      ai: 40,        // Core AI technologies
      db: 10         // Training data, user data
    },
    
    // Messaging Platform (WhatsApp, Telegram)
    messenger: {
      backend: 30,   // Messaging protocols
      frontend: 35,  // User interface
      infra: 20,     // Real-time infrastructure
      ai: 5,         // Smart features
      db: 10         // Message storage
    },
    
    // Office Suite (Microsoft Office, Google Workspace)
    office: {
      backend: 25,   // Document processing
      frontend: 40,  // User interface for productivity
      infra: 10,     // Cloud infrastructure
      ai: 10,        // Smart features
      db: 15         // Document storage
    },
    
    // Antivirus/Security Software
    antivirus: {
      backend: 40,   // Security engines
      frontend: 15,  // User interface
      infra: 15,     // Update systems
      ai: 20,        // Threat detection
      db: 10         // Virus definitions
    },
    
    // Database System (Oracle, MongoDB)
    database: {
      backend: 45,   // Core database engine
      frontend: 10,  // Admin tools
      infra: 15,     // Performance infrastructure
      ai: 10,        // Optimization features
      db: 20         // Meta-database features
    },
    
    // Developer Tools (VS Code, GitHub)
    devtools: {
      backend: 30,   // Core functionality
      frontend: 35,  // Developer UI
      infra: 15,     // Integration capabilities
      ai: 10,        // Smart coding features
      db: 10         // Code repositories
    }
  };
};

// Get the product names for display in the UI
export const getProductNames = () => {
  return {
    search: 'Search Engine',
    video: 'Video Platform',
    social: 'Social Network',
    mobileOS: 'Mobile Operating System',
    desktopOS: 'Desktop Operating System',
    smartphone: 'Smartphone',
    console: 'Gaming Console',
    cloud: 'Cloud Platform',
    ridesharing: 'Ridesharing Service',
    ecommerce: 'E-commerce Platform',
    ai: 'AI Product',
    messenger: 'Messaging Platform',
    office: 'Office Suite',
    antivirus: 'Antivirus Software',
    database: 'Database System',
    devtools: 'Developer Tools'
  };
};
