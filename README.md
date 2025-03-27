# Cannapure Plus

A comprehensive React application with Express backend for cannabis strain management and information.

## Features

- Strain catalog with detailed information
- Weekly specials section
- Store filtering functionality
- User authentication
- Responsive design
- Caching system for optimal performance

## Tech Stack

- **Frontend**: React 19, GSAP for animations
- **Backend**: Express.js
- **Database**: MySQL
- **Authentication**: JWT/Passport
- **Caching**: node-cache
- **API Testing**: Jest, Supertest

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MySQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/UncleSmol/cannapure-plus.git
   cd cannapure-plus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=cannapureplus_dev
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the React frontend (port 3000) and Express backend (port 5000).

## Available Scripts

- `npm start` - Start the React frontend only
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start the backend server only
- `npm run build` - Build the frontend for production
- `npm test` - Run frontend tests
- `npm run test:api` - Run API tests
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
cannapure-plus/
├── config/               # Backend configuration
│   ├── api/              # API endpoints
│   ├── database/         # SQL schema files
│   └── server.js         # Express server
├── public/               # Static files
├── src/                  # React frontend
│   ├── components/       # React components
│   │   ├── budbarpage/   # Bud bar functionality
│   │   ├── strain_card/  # Strain display component
│   │   └── ...
│   ├── services/         # API services
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── package.json          # Project dependencies
```

## Deployment

Instructions for deploying to production:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set up environment variables for production
3. Deploy both the build folder and server code to your hosting provider

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- All contributors to the project
- Open-source libraries used in this project
