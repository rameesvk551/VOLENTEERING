# Hotel Search & Booking Micro-Frontend

A micro-frontend for hotel search, discovery, and booking functionality, integrated into the Travel Ecosystem.

## 🎯 Responsibilities

### ✅ This MFE Handles:
- **Hotel Search UI**: Search form with location, dates, guests
- **Hotel Listing**: Display search results with filtering
- **Hotel Details**: Detailed hotel information and room selection
- **Booking CTA Logic**: Internal booking vs external redirect
- **Reservation Management**: View and manage user's bookings (requires auth)

### ❌ This MFE Does NOT Handle:
- **Authentication UI**: Login/signup handled by shell app
- **Payment UI**: Handled by payment service/MFE
- **Notifications**: Handled by notification service

## 🏗️ Architecture

### Module Federation
This is a federated module that exposes:
- `./App` - Main application component

### Routes
- `/hotels` - Hotel search page
- `/hotels/search` - Search results
- `/hotels/:id` - Hotel details (planned)
- `/hotels/reservations` - User's reservations (planned)

### State Management
Uses **Zustand** for lightweight state management:
- Search query and results
- Selected hotel details
- User reservations
- Loading and error states

### Auth Integration
Consumes auth context from shell app:
- Reads JWT token from localStorage (`token` or `auth_token`)
- Automatically includes auth header in API requests
- Protected routes require authentication

## 📡 API Integration

Communicates with Hotel Discovery & Booking Service via API Gateway:
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/:id/rooms` - Get available rooms
- `GET /api/hotels/:id/booking-decision` - Get booking strategy
- `POST /api/reservations` - Create reservation (auth required)
- `GET /api/reservations` - Get user reservations (auth required)

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
cd travel-ecosystem/apps/hotel-booking
npm install
```

### Environment Setup
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:4000
```

### Run Development Server
```bash
npm run dev
```

The MFE will be available at `http://localhost:1007`

### Build for Production
```bash
npm run build
```

## 🔌 Integration with Shell

The shell app consumes this MFE via Module Federation:

### In Shell's vite.config.ts:
```typescript
remotes: {
  hotelBooking: 'http://localhost:1007/assets/remoteEntry.js'
}
```

### In Shell's Routing:
```typescript
import HotelBookingApp from 'hotelBooking/App';

<Route path="/hotels/*" element={<HotelBookingApp />} />
```

## 🎨 UI Components

### HotelSearch
Search form with location, dates, and guest selection.

**Props:** None (uses Zustand store)

### HotelCard
Displays hotel information in a card format.

**Props:**
- `hotel: Hotel` - Hotel object to display

### Features:
- Responsive design with Tailwind CSS
- Loading states with spinners
- Error handling with user-friendly messages
- Internal vs External booking indicators
- Star ratings and reviews
- Amenity badges
- Price display

## 🔐 Authentication Flow

### Unauthenticated Users:
- Can search hotels
- Can view hotel details
- Cannot create reservations
- Redirected to login when attempting to book

### Authenticated Users:
- Full access to all features
- Can create reservations
- Can view reservation history
- Token automatically included in requests

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚢 Deployment

1. Build the application:
```bash
npm run build
```

2. The `dist` folder contains the production-ready files
3. Ensure the remote entry URL in shell config points to production URL

## 📚 Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Zustand**: State management
- **React Router**: Routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Vite**: Build tool
- **Module Federation**: Micro-frontend architecture

## 🔄 Data Flow

```
User Input (Search)
    ↓
Zustand Store (setSearchQuery)
    ↓
API Service (searchHotels)
    ↓
Hotel Service Backend
    ↓
API Response
    ↓
Zustand Store (setSearchResults)
    ↓
UI Update (HotelCard components)
```

## 🎯 Booking Decision Flow

```
User Clicks "Book Now"
    ↓
API: getBookingDecision(hotelId)
    ↓
Decision Engine Response
    ├─→ INTERNAL: Show booking form
    └─→ EXTERNAL: Redirect to partner URL
```

## 🐛 Debugging

### Common Issues

**Issue:** MFE not loading in shell
- **Solution:** Check if dev server is running on port 1007
- **Solution:** Verify remote entry URL in shell config

**Issue:** API requests failing
- **Solution:** Check API Gateway is running
- **Solution:** Verify VITE_API_BASE_URL in .env

**Issue:** Authentication not working
- **Solution:** Ensure token is in localStorage
- **Solution:** Check token format in API service

## 🔮 Future Enhancements

- [ ] Hotel details page with room selection
- [ ] Advanced filters (price range, amenities, ratings)
- [ ] Map view integration
- [ ] Comparison feature
- [ ] Favorites/wishlist
- [ ] Price alerts
- [ ] Reviews and ratings submission
- [ ] Multi-room booking
- [ ] Date flexibility (±3 days)
- [ ] Accessibility improvements (WCAG 2.1 AA)

## 📖 API Documentation

Refer to the backend API documentation:
`travel-ecosystem-backend/micro-services/hotel-service/API_DOCUMENTATION.md`

## 🤝 Contributing

Follow the Travel Ecosystem coding standards:
- Use TypeScript for type safety
- Follow React best practices
- Write clean, maintainable code
- Use Tailwind CSS for styling
- Keep components small and focused

## 📄 License

Part of the Travel Ecosystem project.
