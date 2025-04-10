# IT Empire Tycoon

An IT company management simulator/tycoon game built with React. Manage your own tech company from a small startup to a global tech giant.

![IT Empire Tycoon](https://raw.githubusercontent.com/mr-ceri-mrum/ITsimulator/main/public/logo192.png)

## Game Features

- Create and manage your IT company starting from 2004
- Develop various IT products like search engines, social networks, mobile OS, etc.
- Hire staff, manage marketing, and infrastructure to support product growth
- Compete with AI-controlled companies in the tech market
- Make strategic decisions to dominate the IT industry

## Game Mechanics

The game simulates the IT industry with the following key mechanics:

- **Development**: Create new products by allocating resources (Backend, Frontend, Infrastructure, AI, Database)
- **Quality**: Product quality is determined by how well you match resource allocation to product requirements
- **Users**: Products attract users based on quality, marketing, and market competition
- **Economics**: Each user generates $15/month in revenue, while employees cost $10,000/month and servers cost $10/user
- **Competition**: AI-controlled companies develop products, compete for users, and grow over time
- **Product Lifecycle**: Products degrade in quality over time and require updates to maintain competitive edge

## Getting Started

### Prerequisites
- Node.js v14+ installed on your system

### Installation

```bash
# Clone the repository
git clone https://github.com/mr-ceri-mrum/ITsimulator.git

# Navigate to the project directory
cd ITsimulator

# Install dependencies
npm install

# Start the development server
npm start
```

The game will open in your default browser at http://localhost:3000

## How to Play

1. **Start a Game**: Enter your company name to begin
2. **Develop Products**: Go to the Development tab and create your first product
   - Allocate resources across different areas (Backend, Frontend, etc.)
   - Match the resource allocation to the product type for the best quality
3. **Launch Products**: After development reaches 100%, launch your product
4. **Grow Your Company**: 
   - Hire employees to support your growing user base
   - Add servers to handle the technical load
   - Invest in marketing to attract more users
5. **Update Products**: Regularly update your products to maintain and improve quality
6. **Analyze the Market**: Monitor your competition and identify opportunities
7. **Expand Your Empire**: Create more products and dominate different market segments

## Technologies Used

- React (UI framework)
- Zustand (State Management)
- Recharts (Data Visualization)

## Project Structure

- `src/components/` - React components for the UI
- `src/store/` - Global state management with Zustand
- `src/utils/` - Helper utilities and game data

## Game Tips

- Products with higher quality attract more users
- Each employee can support approximately 2,000 users
- Marketing costs $5 per new user acquired
- Match resource allocation to product type requirements for best quality
- Keep an eye on your cash flow - growing too fast can lead to bankruptcy
- Products degrade by 2 quality points per year without updates
- Regularly check the market to see what your competitors are doing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
