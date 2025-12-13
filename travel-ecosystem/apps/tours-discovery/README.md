# Tours Discovery UI

A React micro-frontend for discovering and searching tours from multiple providers (GetYourGuide, Viator, Klook).

## 🎯 Features

- **Unified Search**: Search tours across multiple providers simultaneously
- **Advanced Filters**: Filter by category, price, rating, duration
- **Tour Details**: View comprehensive tour information
- **Direct Booking**: Redirect to provider site with affiliate tracking
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Real-time Updates**: Live search results as you type

## 🏗️ Architecture

### Micro-Frontend

This app is built as a Module Federation micro-frontend that can be:
- Run standalone (http://localhost:1007)
- Integrated into the shell app
- Deployed independently

### State Management

- **Zustand**: Lightweight state management for tours and filters
- **React Hooks**: Custom hooks for tour search logic
- **Local Storage**: Auth token persistence

### API Integration

Communicates with Tour Meta Search Service via API Gateway:
- Base URL: `http://localhost:4000/api/tours`
- Auth: Optional (enhances experience if logged in)
- Endpoints: Search, Details, Redirect

## 📦 Installation

```bash
cd travel-ecosystem/apps/tours-discovery
npm install
```

## ⚙️ Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:4000
```

## 🚀 Usage

### Development

```bash
npm run dev
```

App runs on: http://localhost:1007

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 🎨 Components

### `SearchFilters`
- Location search input
- Category pills
- Advanced filters (price, rating, sort)
- Clear filters button

### `TourCard`
- Tour image and title
- Rating and reviews
- Duration and location
- Price and provider badge
- Quick view details button

### `TourDetailsModal`
- Full tour description
- Highlights and inclusions
- Cancellation policy
- Book now CTA (redirects to provider)

### `ToursPage`
- Main page component
- Integrates search, results, and pagination
- Handles loading and error states

## 🔌 Integration with Shell App

### Module Federation

The app exposes `ToursApp` component via Module Federation:

```typescript
// In shell app's vite.config.ts
remotes: {
  toursDiscovery: 'http://localhost:1007/assets/remoteEntry.js'
}

// In shell app component
import ToursApp from 'toursDiscovery/ToursApp';
```

### Routing

Routes available:
- `/` - Tours search page
- `/tours` - Tours search page (alias)

### Authentication

Uses auth context from shell app:
- Reads `accessToken` from localStorage
- Sends token in API requests
- User ID tracked for analytics

## 📊 Data Flow

```
User Input (Search)
     ↓
Update Filters (Zustand)
     ↓
useTourSearch Hook
     ↓
tourApi.searchTours()
     ↓
API Gateway → Tour Service
     ↓
Multiple Provider Adapters (parallel)
     ↓
Aggregate & Normalize
     ↓
Return Results
     ↓
Update State
     ↓
Render Tour Cards
     ↓
User Clicks "View Details"
     ↓
Open Modal
     ↓
User Clicks "Book Now"
     ↓
Generate Redirect URL
     ↓
Open Provider Site (new tab)
```

## 🎯 User Journey

1. **Search**: User enters destination (e.g., "Paris")
2. **Filter**: Optionally filter by category, price, rating
3. **Browse**: View tour cards with key information
4. **Details**: Click to see full tour details
5. **Book**: Click "Book Now" → Redirect to provider
6. **Complete**: User completes booking on provider site

## 🔧 Customization

### Styling

- Uses Tailwind CSS
- Custom theme in `tailwind.config.js`
- Global styles in `src/styles/index.css`

### Adding Features

1. **New Filter**: Update `TourSearchFilters` type and `SearchFilters` component
2. **New Sort Option**: Add to `sortOptions` array
3. **New Category**: Add to `categories` array

## 📱 Responsive Design

- **Mobile**: Single column grid, stacked filters
- **Tablet**: 2-column grid, side-by-side filters
- **Desktop**: 3-column grid, expanded filters

## ⚡ Performance

- **Code Splitting**: React lazy loading for components
- **Image Optimization**: Lazy loading images
- **API Caching**: Backend caches search results (5 min TTL)
- **Pagination**: 20 tours per page (configurable)

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📋 TODO

- [ ] Add tour favorites/wishlist
- [ ] Add price alerts
- [ ] Add tour comparison
- [ ] Add map view
- [ ] Add date picker for availability
- [ ] Add multi-language support
- [ ] Add PWA support
- [ ] Add analytics dashboard

## 🤝 Dependencies

### Runtime
- `react` - UI library
- `react-dom` - React rendering
- `react-router-dom` - Routing
- `zustand` - State management
- `axios` - HTTP client
- `lucide-react` - Icons

### Build
- `vite` - Build tool
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `@module-federation/vite` - Micro-frontend support

## 📄 License

MIT
