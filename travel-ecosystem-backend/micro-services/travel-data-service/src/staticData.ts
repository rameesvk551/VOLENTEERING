export interface TravelArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  author?: string;
  publishedDate: string;
  url: string;
  source: string;
  category: string;
  tags: string[];
  images: string[];
  location: {
    city?: string;
    country?: string;
  };
  readTime?: number;
}

export interface TravelTip {
  id: string;
  title: string;
  tip: string;
  category: string;
  location: {
    city?: string;
    country?: string;
  };
  source: string;
}

export interface LocalExperience {
  id: string;
  name: string;
  description: string;
  type: string;
  location: {
    city: string;
    country: string;
    address?: string;
  };
  price?: {
    amount: number;
    currency: string;
  };
  rating?: number;
  images: string[];
  url?: string;
}

export const articles: Record<string, TravelArticle[]> = {
  delhi: [
    {
      id: 'article-delhi-1',
      title: 'A Complete Guide to Exploring Old Delhi',
      description: 'Discover the historic lanes, street food, and monuments of Old Delhi',
      content: 'Old Delhi is a treasure trove of history...',
      publishedDate: '2025-01-15T00:00:00Z',
      url: 'https://example.com/old-delhi-guide',
      source: 'Travel Magazine',
      category: 'guide',
      tags: ['delhi', 'history', 'food', 'culture'],
      images: ['https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'],
      location: { city: 'Delhi', country: 'India' },
      readTime: 8
    }
  ],
  paris: [
    {
      id: 'article-paris-1',
      title: 'Beyond the Eiffel Tower: Hidden Gems of Paris',
      description: 'Explore lesser-known but equally charming spots in the City of Light',
      publishedDate: '2025-01-10T00:00:00Z',
      url: 'https://example.com/paris-hidden-gems',
      source: 'Paris Travel Blog',
      category: 'guide',
      tags: ['paris', 'hidden gems', 'culture'],
      images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'],
      location: { city: 'Paris', country: 'France' },
      readTime: 10
    }
  ]
};

export const tips: Record<string, TravelTip[]> = {
  delhi: [
    {
      id: 'tip-delhi-1',
      title: 'Best Time to Visit',
      tip: 'October to March offers pleasant weather. Avoid the scorching summer months (April-June).',
      category: 'planning',
      location: { city: 'Delhi', country: 'India' },
      source: 'Travel Expert'
    },
    {
      id: 'tip-delhi-2',
      title: 'Getting Around',
      tip: 'Use Delhi Metro for fast and affordable transport. Download the DMRC app for route planning.',
      category: 'transportation',
      location: { city: 'Delhi', country: 'India' },
      source: 'Local Guide'
    }
  ],
  paris: [
    {
      id: 'tip-paris-1',
      title: 'Museum Passes',
      tip: 'Buy a Paris Museum Pass to skip lines at major attractions and save money.',
      category: 'planning',
      location: { city: 'Paris', country: 'France' },
      source: 'Travel Expert'
    }
  ]
};

export const experiences: Record<string, LocalExperience[]> = {
  delhi: [
    {
      id: 'exp-delhi-1',
      name: 'Chandni Chowk Food Walk',
      description: 'Guided walking tour through the bustling lanes of Old Delhi, sampling authentic street food',
      type: 'food',
      location: {
        city: 'Delhi',
        country: 'India',
        address: 'Chandni Chowk, Old Delhi'
      },
      price: { amount: 1500, currency: 'INR' },
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=800']
    },
    {
      id: 'exp-delhi-2',
      name: 'Kathak Dance Workshop',
      description: 'Learn classical Indian dance from expert performers',
      type: 'cultural',
      location: {
        city: 'Delhi',
        country: 'India'
      },
      price: { amount: 2000, currency: 'INR' },
      rating: 4.6,
      images: ['https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800']
    }
  ]
};
