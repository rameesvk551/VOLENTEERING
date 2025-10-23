# Trip Planner - Travel Ecosystem Micro-Frontend

A beautiful trip planning application built with React, TypeScript, and Tailwind CSS, featuring glassmorphism design and dummy destination data.

## Features

- 🗺️ **Destination Discovery**: Browse curated destinations with detailed information
- 🎯 **Smart Filtering**: Filter destinations by category (Cultural, Beach & Nature, Urban, etc.)
- 🔍 **Search Functionality**: Search destinations by name, country, or description
- 📋 **Sample Trip Plans**: Explore pre-made trip itineraries
- 🎨 **Beautiful UI**: Glassmorphism cards with gradient backgrounds (matching blog styling)
- 🌓 **Dark Mode**: Full dark mode support
- 📱 **Responsive**: Mobile-first design

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **Module Federation** - Micro-frontend integration

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

App will be available at http://localhost:5004

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── DestinationCard.tsx    # Destination card with glassmorphism
│   ├── TripPlanCard.tsx        # Trip plan card
│   └── SearchFilter.tsx        # Search and filter component
├── pages/
│   └── PlanYourTrip.tsx       # Main page
├── data/
│   └── dummyData.ts           # Dummy destinations and trip plans
├── styles/
│   └── index.css              # Global styles
├── App.tsx                    # Root component
└── main.tsx                   # Entry point
```

## Dummy Data

The app includes 8 sample destinations:
- Paris, France
- Tokyo, Japan
- Bali, Indonesia
- New York City, USA
- Santorini, Greece
- Dubai, UAE
- Machu Picchu, Peru
- Iceland

And 3 sample trip plans:
- European Adventure
- Asian Discovery
- Tropical Paradise

## Design System

### Card Styling
- Glassmorphism effect with backdrop-blur
- Gradient backgrounds (blue-to-cyan for destinations, amber-to-pink for trip plans)
- Rounded corners (rounded-3xl)
- Shadow effects with hover animations
- Responsive images with zoom on hover

### Colors
- **Primary**: Blue (#3b82f6) to Cyan (#06b6d4) gradient
- **Secondary**: Amber (#f59e0b) to Pink (#ec4899) gradient
- **Background**: Gradient from blue-50 to cyan-50 (light mode)
- **Card backgrounds**: White/60 with backdrop-blur

### Components
All components use the same styling as the blog app for consistency across the ecosystem.

## Integration

This app is integrated into the Travel Ecosystem shell via Module Federation:

- **Port**: 5004
- **Remote name**: `tripPlanner`
- **Exposed module**: `./App`
- **Route**: `/trip-planner/*`

## Module Federation Config

```typescript
federation({
  name: 'tripPlanner',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

## Features to Add

Potential future enhancements:
- [ ] Map integration for destination visualization
- [ ] Custom trip builder with drag-and-drop
- [ ] Budget calculator
- [ ] Weather information
- [ ] Activity recommendations
- [ ] User authentication and saved trips
- [ ] Reviews and ratings
- [ ] Booking integration
- [ ] Itinerary export (PDF, Calendar)

## License

MIT
