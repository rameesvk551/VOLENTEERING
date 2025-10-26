/**
 * AI Travel Guide Service
 * Integrates with AI APIs to provide contextual travel information
 * Uses Tavily AI for search and enrichment
 */

import axios from 'axios';

export interface TravelGuideData {
  place: string;
  thingsToDo: string[];
  localFood: string[];
  culturalTips: string[];
  description: string;
  bestTimeToVisit: string;
  estimatedStayDuration: string;
  budgetEstimate: {
    low: number;
    mid: number;
    high: number;
    currency: string;
  };
  topAttractions: Attraction[];
  localInsights: string[];
  transportationTips: string[];
  safetyTips: string[];
}

export interface Attraction {
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  recommendedTime: string;
  cost?: string;
}

/**
 * Generate AI-powered travel guide for a destination
 */
export async function generateTravelGuide(
  placeName: string,
  options?: {
    includeBudget?: boolean;
    includeAttractions?: boolean;
    maxAttractions?: number;
  }
): Promise<TravelGuideData> {
  try {
    // For demo purposes, using a combined approach:
    // 1. Try Tavily AI if available
    // 2. Fallback to Claude/OpenAI if configured
    // 3. Use curated data as fallback

    const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;
    
    if (tavilyApiKey) {
      return await fetchFromTavilyAI(placeName, tavilyApiKey, options);
    }
    
    // Fallback to curated data
    return generateCuratedGuide(placeName);
  } catch (error) {
    console.error('Error generating travel guide:', error);
    return generateCuratedGuide(placeName);
  }
}

/**
 * Fetch travel data from Tavily AI
 */
async function fetchFromTavilyAI(
  placeName: string,
  apiKey: string,
  _options?: any
): Promise<TravelGuideData> {
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: `Complete travel guide for ${placeName}: top attractions, things to do, local food, budget, best time to visit, cultural tips`,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    // Parse Tavily response and structure it
    return parseTavilyResponse(placeName, response.data);
  } catch (error) {
    console.error('Tavily API error:', error);
    throw error;
  }
}

/**
 * Parse Tavily AI response into structured travel guide
 */
function parseTavilyResponse(placeName: string, data: any): TravelGuideData {
  const answer = data.answer || '';
  const results = data.results || [];

  // Extract information from results
  const thingsToDo: string[] = [];
  const localFood: string[] = [];
  const topAttractions: Attraction[] = [];
  const culturalTips: string[] = [];
  const localInsights: string[] = [];

  results.forEach((result: any) => {
    const content = result.content || '';
    const title = result.title || '';

    // Simple extraction logic (can be enhanced with NLP)
    if (content.toLowerCase().includes('things to do') || 
        content.toLowerCase().includes('activities')) {
      thingsToDo.push(title);
    }
    
    if (content.toLowerCase().includes('food') || 
        content.toLowerCase().includes('cuisine')) {
      localFood.push(title);
    }

    if (content.toLowerCase().includes('culture') || 
        content.toLowerCase().includes('tradition')) {
      culturalTips.push(title);
    }
  });

  return {
    place: placeName,
    thingsToDo: thingsToDo.slice(0, 5),
    localFood: localFood.slice(0, 5),
    culturalTips: culturalTips.slice(0, 5),
    description: answer || `Explore the wonders of ${placeName}`,
    bestTimeToVisit: extractBestTime(answer),
    estimatedStayDuration: estimateStayDuration(placeName),
    budgetEstimate: estimateBudget(placeName),
    topAttractions: topAttractions.slice(0, 5),
    localInsights: localInsights.slice(0, 3),
    transportationTips: extractTransportationTips(answer),
    safetyTips: extractSafetyTips(answer),
  };
}

/**
 * Generate curated travel guide (fallback)
 */
function generateCuratedGuide(placeName: string): TravelGuideData {
  // Curated data for popular destinations
  const curatedData: { [key: string]: Partial<TravelGuideData> } = {
    'Delhi': {
      thingsToDo: ['Visit Red Fort', 'Explore India Gate', 'Tour Qutub Minar', 'Shop at Chandni Chowk', 'Visit Lotus Temple'],
      localFood: ['Butter Chicken', 'Chole Bhature', 'Street Chaat', 'Parathas', 'Kebabs'],
      culturalTips: ['Dress modestly at religious sites', 'Remove shoes at temples', 'Bargain at markets'],
      description: 'Delhi, the capital of India, is a vibrant metropolis blending ancient history with modern culture. From Mughal monuments to bustling markets, Delhi offers an unforgettable experience.',
      bestTimeToVisit: 'October to March',
      estimatedStayDuration: '2-3 days',
      budgetEstimate: { low: 30, mid: 80, high: 200, currency: 'USD/day' },
    },
    'Manali': {
      thingsToDo: ['Solang Valley skiing', 'Visit Old Manali', 'Trek to Jogini Falls', 'Paragliding', 'Visit Hadimba Temple'],
      localFood: ['Trout Fish', 'Sidu', 'Babru', 'Aktori', 'Mittha'],
      culturalTips: ['Carry warm clothes year-round', 'Respect local Himachali customs', 'Try local homestays'],
      description: 'A picturesque hill station in Himachal Pradesh, Manali offers breathtaking mountain views, adventure sports, and serene monasteries.',
      bestTimeToVisit: 'March to June, December to February for snow',
      estimatedStayDuration: '3-4 days',
      budgetEstimate: { low: 40, mid: 100, high: 250, currency: 'USD/day' },
    },
    'Shimla': {
      thingsToDo: ['Walk on Mall Road', 'Visit Jakhu Temple', 'Explore Christ Church', 'Toy Train ride', 'Visit Kufri'],
      localFood: ['Chana Madra', 'Siddhu', 'Tudkiya Bhath', 'Babru', 'Apple products'],
      culturalTips: ['Avoid littering', 'Respect the colonial architecture', 'Try local woolen products'],
      description: 'The erstwhile summer capital of British India, Shimla charms visitors with its colonial architecture, pleasant climate, and panoramic views.',
      bestTimeToVisit: 'March to June, December to January',
      estimatedStayDuration: '2-3 days',
      budgetEstimate: { low: 35, mid: 90, high: 220, currency: 'USD/day' },
    },
    'Leh': {
      thingsToDo: ['Visit Pangong Lake', 'Explore Nubra Valley', 'Tour monasteries', 'Khardung La Pass', 'Magnetic Hill'],
      localFood: ['Thukpa', 'Momos', 'Butter Tea', 'Skyu', 'Tingmo'],
      culturalTips: ['Acclimatize for altitude', 'Respect Buddhist customs', 'Carry permits for restricted areas'],
      description: 'Leh, the heart of Ladakh, offers stunning landscapes, ancient Buddhist monasteries, and adventure at high altitude.',
      bestTimeToVisit: 'May to September',
      estimatedStayDuration: '4-5 days',
      budgetEstimate: { low: 45, mid: 120, high: 300, currency: 'USD/day' },
    },
    'Kasol': {
      thingsToDo: ['Kheerganga trek', 'Explore Tosh village', 'Chalal trek', 'Riverside camping', 'Manikaran hot springs'],
      localFood: ['Israeli cuisine', 'Trout Fish', 'Momos', 'Maggi at cafes', 'Tibetan Thali'],
      culturalTips: ['Respect local customs', 'Be eco-conscious', 'Try backpacker hostels'],
      description: 'A serene village in Parvati Valley, Kasol is a haven for backpackers, offering stunning nature trails and a laid-back atmosphere.',
      bestTimeToVisit: 'March to June, September to November',
      estimatedStayDuration: '2-3 days',
      budgetEstimate: { low: 25, mid: 60, high: 150, currency: 'USD/day' },
    },
    'Amritsar': {
      thingsToDo: ['Golden Temple', 'Wagah Border ceremony', 'Jallianwala Bagh', 'Partition Museum', 'Heritage walk'],
      localFood: ['Amritsari Kulcha', 'Lassi', 'Makki di Roti', 'Sarson da Saag', 'Langar at Golden Temple'],
      culturalTips: ['Cover head at Golden Temple', 'Participate in Langar service', 'Respect Sikh customs'],
      description: 'Home to the iconic Golden Temple, Amritsar is a spiritual and cultural hub of Punjab, offering rich history and delicious cuisine.',
      bestTimeToVisit: 'November to March',
      estimatedStayDuration: '1-2 days',
      budgetEstimate: { low: 25, mid: 70, high: 180, currency: 'USD/day' },
    },
    'Rishikesh': {
      thingsToDo: ['River rafting', 'Yoga and meditation', 'Lakshman Jhula', 'Beatles Ashram', 'Bungee jumping'],
      localFood: ['Vegetarian thalis', 'Chole Bhature', 'Aloo Puri', 'Fresh fruits', 'Herbal teas'],
      culturalTips: ['Alcohol and meat prohibited', 'Attend Ganga Aarti', 'Try yoga classes'],
      description: 'The Yoga Capital of the World, Rishikesh offers spiritual experiences, adventure sports, and the serene beauty of the Ganges.',
      bestTimeToVisit: 'September to November, February to May',
      estimatedStayDuration: '2-3 days',
      budgetEstimate: { low: 20, mid: 60, high: 150, currency: 'USD/day' },
    },
    'Chandigarh': {
      thingsToDo: ['Rock Garden', 'Sukhna Lake', 'Rose Garden', 'Capitol Complex', 'Sector 17 Market'],
      localFood: ['Punjabi cuisine', 'Butter Chicken', 'Kulcha', 'Lassi', 'Street food'],
      culturalTips: ['City is well-organized and clean', 'Explore the planned architecture', 'Visit markets'],
      description: 'A well-planned city designed by Le Corbusier, Chandigarh offers modern architecture, beautiful gardens, and a vibrant food scene.',
      bestTimeToVisit: 'October to March',
      estimatedStayDuration: '1-2 days',
      budgetEstimate: { low: 30, mid: 85, high: 200, currency: 'USD/day' },
    },
  };

  const baseData: TravelGuideData = {
    place: placeName,
    thingsToDo: ['Explore local attractions', 'Try local cuisine', 'Visit cultural sites'],
    localFood: ['Local specialties', 'Traditional dishes', 'Street food'],
    culturalTips: ['Respect local customs', 'Learn basic phrases', 'Be open-minded'],
    description: `Discover the charm and beauty of ${placeName}.`,
    bestTimeToVisit: 'Year-round',
    estimatedStayDuration: '2-3 days',
    budgetEstimate: { low: 30, mid: 80, high: 200, currency: 'USD/day' },
    topAttractions: [],
    localInsights: [],
    transportationTips: ['Use local transport', 'Consider hiring a guide', 'Book in advance during peak season'],
    safetyTips: ['Stay aware of surroundings', 'Keep valuables secure', 'Follow local guidelines'],
  };

  const curated = curatedData[placeName] || {};
  return { ...baseData, ...curated } as TravelGuideData;
}

/**
 * Helper functions
 */
function extractBestTime(text: string): string {
  const patterns = [
    /best time to visit is (.*?)(?:\.|,)/i,
    /visit during (.*?)(?:\.|,)/i,
    /recommended months?: (.*?)(?:\.|,)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return 'Year-round';
}

function estimateStayDuration(placeName: string): string {
  // Basic heuristics
  const majorCities = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata'];
  const hillStations = ['Manali', 'Shimla', 'Darjeeling', 'Ooty'];
  
  if (majorCities.some(city => placeName.includes(city))) return '2-3 days';
  if (hillStations.some(place => placeName.includes(place))) return '3-4 days';
  
  return '2-3 days';
}

function estimateBudget(_placeName: string): {
  low: number;
  mid: number;
  high: number;
  currency: string;
} {
  // Basic estimation - can be enhanced with real data
  return {
    low: 30,
    mid: 80,
    high: 200,
    currency: 'USD/day',
  };
}

function extractTransportationTips(_text: string): string[] {
  return [
    'Use local public transport for budget travel',
    'Consider hiring a private vehicle for convenience',
    'Book transportation in advance during peak season',
  ];
}

function extractSafetyTips(_text: string): string[] {
  return [
    'Keep copies of important documents',
    'Stay aware of your surroundings',
    'Follow local guidelines and regulations',
    'Have emergency contact numbers saved',
  ];
}

/**
 * Batch generate travel guides for multiple destinations
 */
export async function generateBatchTravelGuides(
  places: string[]
): Promise<Map<string, TravelGuideData>> {
  const guides = new Map<string, TravelGuideData>();

  for (const place of places) {
    try {
      const guide = await generateTravelGuide(place);
      guides.set(place, guide);
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating guide for ${place}:`, error);
    }
  }

  return guides;
}

/**
 * Generate itinerary summary
 */
export function generateItinerarySummary(
  places: string[],
  guides: Map<string, TravelGuideData>
): string {
  const totalDays = places.reduce((sum, place) => {
    const guide = guides.get(place);
    if (!guide) return sum;
    const days = parseInt(guide.estimatedStayDuration) || 2;
    return sum + days;
  }, 0);

  let summary = `# Your ${totalDays}-Day Adventure Through ${places.length} Destinations\n\n`;
  
  places.forEach((place, index) => {
    const guide = guides.get(place);
    if (guide) {
      summary += `## Day ${index + 1}: ${place}\n`;
      summary += `${guide.description}\n\n`;
      summary += `**Must-Do Activities:**\n`;
      guide.thingsToDo.slice(0, 3).forEach(activity => {
        summary += `- ${activity}\n`;
      });
      summary += `\n**Don't Miss:** ${guide.localFood[0]}\n\n`;
    }
  });

  return summary;
}
