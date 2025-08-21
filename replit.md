# Personal Dashboard App

## Overview

This is a personal dashboard web application built with React and Express that provides a zen-like, mindful experience for daily productivity. The app features a beautiful full-screen interface with customizable backgrounds, daily inspirational quotes, weather updates, task management, schedule planning, Pomodoro timer, habit tracking, quick access links, and personal notes. It's designed as a single-page application that serves as a personalized home screen or new tab replacement, focusing on mindfulness and productivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (August 20, 2025)

**Completed Core Features:**
- Added Today's Schedule widget with time-based event management
- Implemented Pomodoro Timer with 25-minute work/break sessions
- Created Habits Tracker with streak counting and daily completion
- Built Quick Access widget for website shortcuts with custom icons
- All widgets include full CRUD operations with data persistence
- Enhanced glassmorphism UI aesthetic maintained across all components

**Completed Analytics & Controls:**
- Added 4 new analytics panels: Today's Summary, Daily Book recommendations, Website Usage tracking, and AI Coach insights
- Implemented 3 upper-right controls: Focus Music player, Zen Mode toggle, and Calendar integration
- Expanded backend with new schema types, storage methods, and API routes for all analytics features
- Enhanced grid layout to 3-column design accommodating 11 total widgets
- Implemented Zen Mode with smooth visual transitions and focus enhancement

**Latest Enhancement - Advanced Notes Widget (August 21, 2025):**
- Transformed Quick Notes into a comprehensive notes application with professional-grade features
- Added multi-note management with full CRUD operations for individual notes
- Implemented advanced search and filtering by content, title, tags, and categories
- Built note organization system with categories, tags, favorites, pinning, and archiving
- Added multiple view modes (list and grid) for different workflows
- Enhanced voice recording with transcription capabilities
- Integrated rich metadata tracking (word count, read time, creation/update dates)
- Built data export functionality and comprehensive statistics dashboard
- Created tabbed interface for All, Favorites, Pinned, and Archived notes
- Maintained backward compatibility with legacy string-based notes

**Deployment Options:**
- Local development setup documented in LOCAL_SETUP.md
- Chrome extension conversion guide created in CHROME_EXTENSION.md

## System Architecture

### Frontend Architecture
The client is built with **React 18** using modern patterns and TypeScript for type safety. The UI leverages **shadcn/ui** components built on top of **Radix UI** primitives, providing a consistent and accessible design system. **Tailwind CSS** handles styling with custom CSS variables for theming. The application uses **React Query (TanStack Query)** for server state management, data fetching, and caching, while **Wouter** provides lightweight client-side routing.

The component architecture follows a modular approach with specialized widgets:

**Core Interface:**
- Personal greeting with customizable names
- Real-time clock display  
- Daily inspirational quotes from external APIs
- Main focus section for daily intentions

**Productivity Tools:**
- Task management (todo list) with CRUD operations
- Today's schedule with time-based events
- Pomodoro timer with work/break sessions
- Habit tracking with streak counters
- Quick access links for frequently used websites
- Advanced notes application with multi-note management, categories, tags, search, and organization features

**Analytics & Insights:**
- Today's Summary with productivity metrics and progress tracking
- Daily Book recommendations with covers, summaries, and key takeaways
- Website Usage tracking with time spent and visit analytics
- AI Coach providing personalized insights and actionable recommendations

**Controls & Tools:**
- Focus Music player with ambient sounds and volume control
- Zen Mode toggle for distraction-free focus sessions
- Calendar integration for date navigation and planning
- Weather widget with geolocation support
- Settings panel for full customization

### Backend Architecture
The server uses **Express.js** with TypeScript in ESM module format. The architecture implements a clean separation with dedicated route handlers and a storage abstraction layer. Currently uses **MemStorage** (in-memory storage) for development, but includes a complete **IStorage** interface designed to easily swap in database implementations.

API design follows RESTful patterns:
- `/api/quote` - Daily inspirational quotes
- `/api/weather` - Weather data with geolocation
- `/api/tasks` - CRUD operations for tasks
- `/api/schedule` - CRUD operations for daily schedule events
- `/api/habits` - CRUD operations for habit tracking
- `/api/quick-links` - CRUD operations for quick access links
- `/api/settings` - User preferences management

### Data Storage Solutions
**Database Setup**: Uses **Drizzle ORM** with **PostgreSQL** (specifically configured for Neon Database). Schema defines six main entities:
- Users table with basic profile information
- Tasks table with completion status and ordering
- UserSettings table for personalization (name, focus, notes, background)
- ScheduleEvents table for daily calendar events with time and completion tracking
- Habits table with streak tracking and completion dates
- QuickLinks table for customizable website shortcuts with icons and ordering

**Current Implementation**: MemStorage provides a development-friendly in-memory solution that implements the full IStorage interface. This allows for seamless transition to the actual database when needed.

### Development Workflow
**Build System**: **Vite** handles the frontend build process with React plugin support, hot module replacement, and development server. The server builds with **esbuild** for production deployments.

**Type Safety**: Shared TypeScript schemas between client and server using **Zod** for validation and **drizzle-zod** for automatic type inference from database schemas.

## External Dependencies

### Third-Party APIs
- **Quotable API** (https://api.quotable.io) - Provides daily inspirational quotes with filtering by length and tags
- **OpenWeather API** - Weather data integration (requires API key configuration via `OPENWEATHER_API_KEY` or `WEATHER_API_KEY` environment variables)

### Database Services
- **Neon Database** - PostgreSQL hosting service, accessed via connection string in `DATABASE_URL` environment variable
- **@neondatabase/serverless** - Serverless-optimized PostgreSQL client for Neon

### UI and Styling
- **shadcn/ui** - Pre-built component library based on Radix UI primitives
- **Radix UI** - Unstyled, accessible UI components for React
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens
- **Lucide React** - Beautiful icon library

### Development Tools
- **Drizzle Kit** - Database migrations and schema management
- **React Query** - Server state management and caching
- **Wouter** - Lightweight client-side routing
- **date-fns** - Date manipulation utilities
- **Replit-specific plugins** - Development environment integration for Replit platform