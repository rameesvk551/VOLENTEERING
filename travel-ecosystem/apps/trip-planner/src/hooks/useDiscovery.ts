// Custom hook for AI-powered discovery

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_DISCOVERY_API_URL || 'http://localhost:3000/api/v1';

export interface QueryEntities {
  city: string;
  country?: string;
  month?: string;
  year?: number;
  interests: string[];
  eventType: string[];
  duration?: number;
}

export interface Summary {
  headline: string;
  overview: string;
  highlights: string[];
  bestTime?: string;
  tips?: string[];
}

export interface Location {
  city: string;
  country?: string;
  coordinates: { lat: number; lng: number };
}

export interface Metadata {
  category: string[];
  tags: string[];
  popularity: number;
  cost?: string;
  duration?: string;
}

export interface Media {
  images: string[];
}

export interface DiscoveryEntity {
  id: string;
  type: 'festival' | 'attraction' | 'event' | 'place' | 'experience';
  title: string;
  description: string;
  location: Location;
  dates?: {
    start: string;
    end: string;
  };
  metadata: Metadata;
  media: Media;
}

export interface Recommendation {
  entity: DiscoveryEntity;
  reason: string;
  score: number;
  relationshipType: string;
  distance?: string;
}

export interface DiscoveryResult {
  query: string;
  entities: QueryEntities;
  summary: Summary;
  results: {
    festivals: DiscoveryEntity[];
    attractions: DiscoveryEntity[];
    places: DiscoveryEntity[];
    events: DiscoveryEntity[];
  };
  recommendations: Recommendation[];
  metadata: {
    totalResults: number;
    processingTime: number;
    cached: boolean;
    sources: string[];
  };
}

// Dummy data for testing
const getDummyData = (query: string): DiscoveryResult => {
  return {
    query,
    entities: {
      city: 'Delhi',
      country: 'India',
      month: 'October',
      year: 2024,
      interests: ['culture', 'festivals', 'food'],
      eventType: ['festival', 'cultural', 'music']
    },
    summary: {
      headline: 'Delhi in October: A Perfect Blend of Culture and Celebration',
      overview: 'October is one of the best months to visit Delhi, with pleasant weather and numerous festivals. The city comes alive with Diwali celebrations, cultural events, and perfect temperatures for exploring historical monuments.',
      highlights: [
        'Diwali Festival of Lights celebration',
        'Pleasant weather (15-30°C)',
        'Cultural events at India Habitat Centre',
        'Food festivals and street food tours',
        'Less crowded than peak tourist season'
      ],
      bestTime: 'October to March',
      tips: [
        'Book hotels early due to Diwali rush',
        'Try street food at Chandni Chowk',
        'Visit monuments early morning to avoid crowds',
        'Carry light woolens for evenings'
      ]
    },
    results: {
      festivals: [
        {
          id: '1',
          type: 'festival',
          title: 'Diwali - Festival of Lights',
          description: 'The biggest festival in Delhi, celebrating the victory of light over darkness. Streets and markets are illuminated with millions of lights, and families celebrate with fireworks, sweets, and prayers.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.6139, lng: 77.2090 }
          },
          dates: {
            start: '2024-10-31',
            end: '2024-11-02'
          },
          metadata: {
            category: ['festival', 'cultural', 'religious'],
            tags: ['lights', 'fireworks', 'sweets', 'family-friendly'],
            popularity: 9.5,
            cost: 'Free',
            duration: '3 days'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1605649487212-47bdab064df7',
              'https://images.unsplash.com/photo-1578469645742-46cae010e5d4'
            ]
          }
        },
        {
          id: '2',
          type: 'festival',
          title: 'Delhi International Arts Festival',
          description: 'A celebration of performing arts featuring dance, music, and theater performances from artists around the world.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.5355, lng: 77.2490 }
          },
          dates: {
            start: '2024-10-15',
            end: '2024-10-20'
          },
          metadata: {
            category: ['festival', 'arts', 'music'],
            tags: ['dance', 'music', 'theater', 'international'],
            popularity: 7.8,
            cost: '₹500-2000',
            duration: '6 days'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
              'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14'
            ]
          }
        }
      ],
      attractions: [
        {
          id: '3',
          type: 'attraction',
          title: 'Red Fort (Lal Qila)',
          description: 'A stunning 17th-century fortress and UNESCO World Heritage Site. This massive red sandstone fort was the main residence of Mughal emperors and showcases incredible Indo-Islamic architecture.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.6562, lng: 77.2410 }
          },
          metadata: {
            category: ['historical', 'monument', 'architecture'],
            tags: ['UNESCO', 'Mughal', 'fort', 'history'],
            popularity: 9.2,
            cost: '₹35 (Indians), ₹500 (Foreigners)',
            duration: '2-3 hours'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1587474260584-136574528ed5',
              'https://images.unsplash.com/photo-1598091383021-15ddea10925d'
            ]
          }
        },
        {
          id: '4',
          type: 'attraction',
          title: 'Qutub Minar',
          description: 'The tallest brick minaret in the world at 73 meters, built in 1193. This UNESCO World Heritage Site is an architectural marvel with intricate carvings and stunning Islamic architecture.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.5244, lng: 77.1855 }
          },
          metadata: {
            category: ['historical', 'monument', 'architecture'],
            tags: ['UNESCO', 'minaret', 'history', 'photography'],
            popularity: 8.9,
            cost: '₹30 (Indians), ₹500 (Foreigners)',
            duration: '1-2 hours'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1587135941948-670b381f08ce',
              'https://images.unsplash.com/photo-1596436889106-be35e843f974'
            ]
          }
        },
        {
          id: '5',
          type: 'attraction',
          title: 'Humayuns Tomb',
          description: 'A magnificent Mughal garden-tomb and UNESCO World Heritage Site. Built in 1570, it inspired the design of the Taj Mahal and features stunning Persian-influenced architecture.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.5933, lng: 77.2507 }
          },
          metadata: {
            category: ['historical', 'monument', 'garden'],
            tags: ['UNESCO', 'Mughal', 'tomb', 'gardens'],
            popularity: 8.7,
            cost: '₹35 (Indians), ₹500 (Foreigners)',
            duration: '1-2 hours'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f',
              'https://images.unsplash.com/photo-1599661046289-e31897846e41'
            ]
          }
        }
      ],
      places: [
        {
          id: '6',
          type: 'place',
          title: 'Chandni Chowk',
          description: 'One of the oldest and busiest markets in Old Delhi. A paradise for food lovers and shoppers, offering everything from traditional Indian sweets to jewelry and textiles.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.6506, lng: 77.2303 }
          },
          metadata: {
            category: ['market', 'food', 'shopping'],
            tags: ['street food', 'traditional', 'bazaar', 'shopping'],
            popularity: 9.0,
            cost: 'Variable',
            duration: '3-4 hours'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1610433447689-2e99c366c576',
              'https://images.unsplash.com/photo-1618939304347-e91154f93e93'
            ]
          }
        },
        {
          id: '7',
          type: 'place',
          title: 'India Gate',
          description: 'A war memorial dedicated to Indian soldiers. This 42-meter-high arch is beautifully lit in the evening and surrounded by lush lawns, perfect for evening strolls.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.6129, lng: 77.2295 }
          },
          metadata: {
            category: ['monument', 'memorial', 'landmark'],
            tags: ['memorial', 'landmark', 'evening', 'photography'],
            popularity: 8.8,
            cost: 'Free',
            duration: '1 hour'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1587474260584-136574528ed5',
              'https://images.unsplash.com/photo-1620766165482-ae6b74461816'
            ]
          }
        }
      ],
      events: [
        {
          id: '8',
          type: 'event',
          title: 'Delhi Food Truck Festival',
          description: 'A gastronomic celebration featuring food trucks from across India serving innovative fusion cuisine, street food, and international delicacies.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.5355, lng: 77.3910 }
          },
          dates: {
            start: '2024-10-12',
            end: '2024-10-14'
          },
          metadata: {
            category: ['food', 'festival', 'culinary'],
            tags: ['food', 'trucks', 'fusion', 'outdoor'],
            popularity: 8.5,
            cost: '₹200 entry + food costs',
            duration: '3 days'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
            ]
          }
        }
      ]
    },
    recommendations: [
      {
        entity: {
          id: '9',
          type: 'attraction',
          title: 'Lotus Temple',
          description: 'A Bahai House of Worship known for its distinctive lotus-shaped architecture. Open to all religions, it offers a peaceful retreat with beautiful gardens.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.5535, lng: 77.2588 }
          },
          metadata: {
            category: ['spiritual', 'architecture', 'temple'],
            tags: ['architecture', 'peace', 'meditation', 'gardens'],
            popularity: 8.6,
            cost: 'Free',
            duration: '1-2 hours'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1597074866923-dc0589150950',
              'https://images.unsplash.com/photo-1605649487212-47bdab064df7'
            ]
          }
        },
        reason: 'Perfect for peaceful reflection during Diwali festivities',
        score: 9.1,
        relationshipType: 'nearby_attraction',
        distance: '8 km from city center'
      },
      {
        entity: {
          id: '10',
          type: 'experience',
          title: 'Heritage Walk in Mehrauli',
          description: 'A guided walking tour through Delhi oldest continuously inhabited area, featuring 440 monuments spanning 1000 years of history.',
          location: {
            city: 'Delhi',
            country: 'India',
            coordinates: { lat: 28.5244, lng: 77.1855 }
          },
          metadata: {
            category: ['tour', 'heritage', 'walking'],
            tags: ['heritage', 'history', 'guided tour', 'architecture'],
            popularity: 7.9,
            cost: '₹300-500',
            duration: '3 hours'
          },
          media: {
            images: [
              'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f',
              'https://images.unsplash.com/photo-1608211364623-abdf12888ae4'
            ]
          }
        },
        reason: 'Great way to explore Delhi rich history in pleasant October weather',
        score: 8.4,
        relationshipType: 'similar_interest',
        distance: '12 km from city center'
      }
    ],
    metadata: {
      totalResults: 10,
      processingTime: 1250,
      cached: false,
      sources: ['OpenAI', 'Weaviate', 'LangGraph']
    }
  };
};

export const useDiscovery = () => {
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [entities, setEntities] = useState<QueryEntities | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the real backend API
      const response = await axios.post(`${API_BASE_URL}/discover`, {
        query,
        filters: filters || {},
        preferences: {}
      });

      const data: DiscoveryResult = response.data;

      setResults(data);
      setEntities(data.entities);
      setSummary(data.summary);
      setRecommendations(data.recommendations || []);

      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Search failed';
      setError(errorMessage);
      
      // Fallback to dummy data if API fails (for development)
      console.warn('API call failed, using dummy data:', errorMessage);
      const dummyData = getDummyData(query);
      setResults(dummyData);
      setEntities(dummyData.entities);
      setSummary(dummyData.summary);
      setRecommendations(dummyData.recommendations);
      
      return dummyData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEntityDetails = useCallback(async (entityId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entity/${entityId}`);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch entity details');
    }
  }, []);

  const getRecommendations = useCallback(async (baseEntityId: string, context?: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/recommendations`, {
        baseEntity: baseEntityId,
        context
      });
      return response.data.recommendations;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch recommendations');
    }
  }, []);

  const getTrending = useCallback(async (city: string, limit: number = 20) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trending/${city}`, {
        params: { limit }
      });
      return response.data.trending;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch trending');
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setEntities(null);
    setSummary(null);
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    results,
    entities,
    summary,
    recommendations,
    isLoading,
    error,
    search,
    getEntityDetails,
    getRecommendations,
    getTrending,
    clearResults
  };
};
