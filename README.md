# STELLAR | 台灣生日應援地圖

A comprehensive Progressive Web App (PWA) for discovering and managing K-Pop birthday support events across Taiwan. STELLAR helps fans find nearby birthday celebrations for their favorite artists and enables event organizers to submit and manage events.

## Key Features

- **Interactive Map**: Browse birthday support events on an interactive Leaflet map with clustering
- **Event Discovery**: Search and filter events by date, artist, and location
- **Artist Birthdays**: Track upcoming artist birthdays with dedicated calendar views
- **Event Submission**: Submit new events with image uploads and location selection
- **User Management**: Google authentication with personal submission tracking
- **Admin Dashboard**: Event moderation and batch management tools
- **PWA Support**: Full offline capabilities with install prompts for mobile devices
- **Real-time Updates**: Live event data with optimistic UI updates

## Tech Stack

### Frontend Framework

- **Next.js 14.2.5** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type safety and developer experience

### Styling & UI

- **Panda CSS 1.4.0** - Zero-runtime CSS-in-JS with utility-first approach
- **Headless UI 2.2.6** - Unstyled, accessible UI components
- **Heroicons 2.2.0** - Beautiful hand-crafted SVG icons

### State Management & Data Fetching

- **TanStack Query 5.83.0** - Powerful data synchronization for React
- **Zustand 5.0.6** - Lightweight state management
- **React Hook Form 7.61.1** - Performant forms with easy validation
- **Zod 4.0.13** - TypeScript-first schema validation

### Maps & Location

- **React Leaflet 4.2.1** - React components for Leaflet maps
- **Leaflet 1.9.4** - Open-source JavaScript library for mobile-friendly maps
- **React Leaflet Cluster 2.1.0** - Marker clustering for better UX

### Authentication & Backend Integration

- **Firebase 12.0.0** - Authentication and real-time database
- **Axios 1.11.0** - HTTP client for API requests

### Development Tools

- **ESLint 9.32.0** - Code linting with custom rules
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks for code quality
- **Lint-staged 16.1.2** - Pre-commit linting

### Performance & Analytics

- **Vercel Analytics 1.5.0** - Performance monitoring
- **React Hot Toast 2.5.2** - Elegant toast notifications
- **React Spring 10.0.1** - Spring-physics based animations

## 📁 Project Structure

```
stellar-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── event/[eventId]/   # Event detail pages
│   │   ├── map/               # Map interface
│   │   ├── my-submissions/    # User submission management
│   │   ├── settings/          # User settings
│   │   └── submit-*/          # Event/artist submission forms
│   ├── components/            # Reusable UI components
│   │   ├── HomePage/          # Home page with tabs and navigation
│   │   ├── auth/              # Authentication components
│   │   ├── forms/             # Form components and validation
│   │   ├── map/               # Map-related components
│   │   ├── pwa/               # PWA installation prompts
│   │   └── ui/                # Generic UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries and configurations
│   ├── store/                 # Zustand state stores
│   ├── styles/                # Panda CSS theme and global styles
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions
├── styled-system/             # Generated Panda CSS files
├── public/                    # Static assets and PWA files
└── scripts/                   # Build and deployment scripts
```

## Key Features & Implementation

### 1. **Interactive Event Map**

- **Technology**: React Leaflet with custom clustering
- **Features**: Real-time marker updates, location-based filtering, user geolocation
- **Performance**: Memoized markers and optimized re-renders for smooth interaction

### 2. **Progressive Web App (PWA)**

- **Technology**: Next.js PWA with custom service worker
- **Features**: Offline support, install prompts, push notifications
- **UX**: iOS-specific install banners and Android install prompts

### 3. **Advanced Form Handling**

- **Technology**: React Hook Form + Zod validation + custom image upload
- **Features**: Multi-step forms, image cropping, autocomplete location search
- **Validation**: Type-safe form validation with detailed error messages

### 4. **Real-time Data Management**

- **Technology**: TanStack Query + Zustand
- **Features**: Optimistic updates, background refetching, infinite scrolling
- **Performance**: Smart caching strategies and stale-while-revalidate patterns

### 5. **Authentication & Authorization**

- **Technology**: Firebase Auth with Google OAuth
- **Features**: Role-based access control, persistent sessions
- **Security**: Protected routes and API endpoints with token validation

## Performance & Optimization

### Code Splitting & Lazy Loading

- Dynamic imports for modals and heavy components
- Route-based code splitting with Next.js App Router
- Image optimization with Next.js Image component

### Bundle Optimization

- Tree-shaking enabled for all dependencies
- Panda CSS zero-runtime styling reduces bundle size
- Custom service worker for efficient caching

### User Experience

- Skeleton loading states for all data fetches
- Optimistic UI updates for instant feedback
- Smooth animations with React Spring

## PWA Features

- **Offline Support**: Service worker caches critical resources
- **Install Prompts**: Custom install banners for iOS and Android
- **Push Notifications**: Real-time event updates (when enabled)
- **App-like Experience**: Full-screen mode and native feel

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Leaflet** for the excellent mapping library
- **Panda CSS** for the innovative styling approach
- **TanStack Query** for robust data management
- **Firebase** for authentication and backend services
