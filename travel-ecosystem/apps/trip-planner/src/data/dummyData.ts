export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  bestTimeToVisit: string;
  estimatedCost: string;
  duration: string;
  highlights: string[];
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface TripPlan {
  id: string;
  title: string;
  destinations: string[];
  duration: string;
  budget: string;
  startDate: string;
  activities: string[];
}

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    description: 'The City of Light, known for its art, fashion, gastronomy, and culture.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    rating: 4.8,
    bestTimeToVisit: 'April - October',
    estimatedCost: '$2000 - $3500',
    duration: '5-7 days',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
    category: 'Cultural',
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    description: 'A vibrant metropolis blending ultramodern with traditional culture.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    rating: 4.9,
    bestTimeToVisit: 'March - May, September - November',
    estimatedCost: '$2500 - $4000',
    duration: '7-10 days',
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Mount Fuji', 'Tokyo Tower'],
    category: 'Cultural',
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: '3',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with stunning beaches, temples, and rice terraces.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    rating: 4.7,
    bestTimeToVisit: 'April - October',
    estimatedCost: '$1500 - $2500',
    duration: '7-14 days',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur'],
    category: 'Beach & Nature',
    coordinates: { lat: -8.3405, lng: 115.0920 }
  },
  {
    id: '4',
    name: 'New York City',
    country: 'USA',
    description: 'The city that never sleeps, a global hub of culture and commerce.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    rating: 4.6,
    bestTimeToVisit: 'April - June, September - November',
    estimatedCost: '$2500 - $4500',
    duration: '5-7 days',
    highlights: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
    category: 'Urban',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '5',
    name: 'Santorini',
    country: 'Greece',
    description: 'Stunning island with whitewashed buildings and breathtaking sunsets.',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    rating: 4.9,
    bestTimeToVisit: 'April - November',
    estimatedCost: '$2000 - $3500',
    duration: '4-6 days',
    highlights: ['Oia Sunset', 'Red Beach', 'Ancient Akrotiri', 'Wine Tours'],
    category: 'Beach & Romance',
    coordinates: { lat: 36.3932, lng: 25.4615 }
  },
  {
    id: '6',
    name: 'Dubai',
    country: 'UAE',
    description: 'Modern metropolis with luxury shopping and ultramodern architecture.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    rating: 4.7,
    bestTimeToVisit: 'November - March',
    estimatedCost: '$2500 - $4000',
    duration: '4-6 days',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
    category: 'Luxury & Urban',
    coordinates: { lat: 25.2048, lng: 55.2708 }
  },
  {
    id: '7',
    name: 'Machu Picchu',
    country: 'Peru',
    description: 'Ancient Incan citadel set high in the Andes Mountains.',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
    rating: 4.9,
    bestTimeToVisit: 'April - October',
    estimatedCost: '$1800 - $3000',
    duration: '3-5 days',
    highlights: ['Inca Trail', 'Sun Gate', 'Temple of the Sun', 'Huayna Picchu'],
    category: 'Adventure & History',
    coordinates: { lat: -13.1631, lng: -72.5450 }
  },
  {
    id: '8',
    name: 'Iceland',
    country: 'Iceland',
    description: 'Land of fire and ice with stunning natural landscapes.',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800',
    rating: 4.8,
    bestTimeToVisit: 'June - August, September - March (Northern Lights)',
    estimatedCost: '$3000 - $5000',
    duration: '7-10 days',
    highlights: ['Blue Lagoon', 'Golden Circle', 'Northern Lights', 'Jökulsárlón'],
    category: 'Nature & Adventure',
    coordinates: { lat: 64.9631, lng: -19.0208 }
  }
];

export const sampleTripPlans: TripPlan[] = [
  {
    id: '1',
    title: 'European Adventure',
    destinations: ['Paris', 'Rome', 'Barcelona'],
    duration: '14 days',
    budget: '$5000 - $7000',
    startDate: '2024-06-01',
    activities: ['Sightseeing', 'Museums', 'Food Tours', 'Historical Sites']
  },
  {
    id: '2',
    title: 'Asian Discovery',
    destinations: ['Tokyo', 'Kyoto', 'Osaka'],
    duration: '10 days',
    budget: '$4000 - $6000',
    startDate: '2024-09-15',
    activities: ['Temple Visits', 'Street Food', 'Shopping', 'Traditional Culture']
  },
  {
    id: '3',
    title: 'Tropical Paradise',
    destinations: ['Bali', 'Phuket', 'Boracay'],
    duration: '12 days',
    budget: '$3500 - $5000',
    startDate: '2024-07-20',
    activities: ['Beach Relaxation', 'Snorkeling', 'Island Hopping', 'Spa']
  }
];

export const categories = [
  'All',
  'Cultural',
  'Beach & Nature',
  'Urban',
  'Adventure',
  'Luxury',
  'Budget-Friendly'
];
