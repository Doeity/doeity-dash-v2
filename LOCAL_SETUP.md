# Local Development Setup

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

## Installation Steps

1. **Clone or download the project files**
   ```bash
   # Copy all project files to your local directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup (Optional)**
   Create a `.env` file in the root directory for API keys:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   WEATHER_API_KEY=your_weather_api_key_here
   ```
   Note: The app works without these - weather will show a placeholder message

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared types and schemas
├── package.json     # Dependencies and scripts
└── vite.config.ts   # Build configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

The app uses in-memory storage by default, so your data will reset when you restart the server.