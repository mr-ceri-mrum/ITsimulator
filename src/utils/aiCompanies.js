// Define a list of potential company names
const companyNamePrefixes = [
  'Apex', 'Nexus', 'Quantum', 'Cyber', 'Tech', 'Digital', 'Fusion', 'Hyper', 
  'Meta', 'Cloud', 'Pulse', 'Nova', 'Peak', 'Byte', 'Core', 'Data', 'Grid', 
  'Smart', 'Spark', 'Stream', 'Sync', 'Vector', 'Wave', 'Net', 'Algo'
];

const companyNameSuffixes = [
  'Systems', 'Technologies', 'Solutions', 'Innovations', 'Labs', 'Dynamics', 
  'Platforms', 'Networks', 'Software', 'AI', 'Tech', 'Connect', 'Logic', 
  'Nexus', 'Hub', 'Engine', 'Drive', 'Sphere', 'Matrix', 'Ware', 'Bytes'
];

// Product types
const productTypes = [
  'search', 'video', 'social', 'mobileOS', 'desktopOS', 'smartphone', 
  'console', 'cloud', 'ridesharing', 'ecommerce', 'ai', 'messenger', 
  'office', 'antivirus', 'database', 'devtools'
];

// Generate a random company name
const generateCompanyName = () => {
  const prefix = companyNamePrefixes[Math.floor(Math.random() * companyNamePrefixes.length)];
  const suffix = companyNameSuffixes[Math.floor(Math.random() * companyNameSuffixes.length)];
  return `${prefix}${suffix}`;
};

// Generate a random number of products for a company
const generateCompanyProducts = (companyName, count = 5) => {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    const productQuality = Math.floor(Math.random() * 6) + 1; // 1-6 quality for initial products
    
    products.push({
      id: Date.now() + Math.random(),
      type: productType,
      name: `${companyName} ${productType.charAt(0).toUpperCase() + productType.slice(1)}`,
      quality: productQuality,
      users: Math.floor(Math.random() * 1000000), // 0-1M users
      launchDate: new Date(2004, 0, 1) // All start at the beginning
    });
  }
  
  return products;
};

// Generate a list of AI competitor companies
export const generateRandomCompanies = (count = 15) => {
  const companies = [];
  
  for (let i = 0; i < count; i++) {
    const name = generateCompanyName();
    const productsCount = Math.floor(Math.random() * 3) + 1; // 1-3 initial products
    const products = generateCompanyProducts(name, productsCount);
    
    // Calculate initial valuation based on products
    const totalUsers = products.reduce((sum, product) => sum + product.users, 0);
    const avgQuality = products.length > 0 ? 
      products.reduce((sum, product) => sum + product.quality, 0) / products.length : 0;
    
    const valuation = totalUsers * 20 + avgQuality * 10000000;
    
    companies.push({
      id: i,
      name,
      founded: new Date(2004, 0, 1),
      products,
      valuation
    });
  }
  
  return companies;
};

// Export the product types for use elsewhere
export const getProductTypes = () => productTypes;
