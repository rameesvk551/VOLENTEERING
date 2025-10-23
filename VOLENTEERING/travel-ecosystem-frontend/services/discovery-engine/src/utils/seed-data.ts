// Seed sample data for testing

import { Place } from '../database/models';
import { dbManager } from '../database/connection';
import { logger } from './logger';

const samplePlaces = [
  {
    type: 'festival',
    title: 'Dussehra Festival 2025',
    description: 'One of Delhi\'s most spectacular celebrations, featuring 10 days of Ramlila performances culminating in the burning of 70-foot effigies at Ramlila Ground. The event attracts over 500,000 visitors and showcases traditional dance, music, and theatrical performances depicting the Ramayana epic.',
    location: {
      city: 'Delhi',
      country: 'India',
      venue: 'Ramlila Ground, Ajmeri Gate',
      coordinates: [77.2177, 28.6371]
    },
    dates: {
      start: new Date('2025-10-10'),
      end: new Date('2025-10-20'),
      flexible: false
    },
    metadata: {
      category: ['cultural', 'religious', 'outdoor'],
      tags: ['festival', 'traditional', 'family-friendly', 'free'],
      popularity: 0.95,
      cost: 'free',
      duration: '10 days',
      crowdLevel: 'very high' as const
    },
    media: {
      images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'],
      videos: []
    },
    source: {
      url: 'https://delhitourism.gov.in/dussehra',
      domain: 'delhitourism.gov.in',
      crawledAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    confidence: 0.95
  },
  {
    type: 'attraction',
    title: 'Red Fort (Lal Qila)',
    description: 'UNESCO World Heritage Site and iconic 17th-century Mughal fortress. Best visited in October\'s pleasant weather. The sound and light show \'Shan-e-Dilwalon-Ki\' runs every evening in Hindi and English.',
    location: {
      city: 'Delhi',
      country: 'India',
      area: 'Old Delhi',
      coordinates: [77.2410, 28.6562]
    },
    metadata: {
      category: ['historical', 'architecture', 'UNESCO'],
      tags: ['monument', 'Mughal', 'photography'],
      popularity: 0.92,
      cost: '₹50 (Indians), ₹500 (Foreigners)',
      duration: '2-3 hours',
      openingHours: '9:30 AM - 4:30 PM (Closed Monday)'
    },
    media: {
      images: ['https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800']
    },
    source: {
      url: 'https://delhitourism.gov.in/red-fort',
      domain: 'delhitourism.gov.in',
      crawledAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    confidence: 0.98
  },
  {
    type: 'place',
    title: 'Chandni Chowk Market',
    description: 'Delhi\'s oldest and busiest market, dating back to the 17th century. A labyrinth of narrow lanes offering street food, textiles, jewelry, and electronics. October evenings are perfect for exploring on foot.',
    location: {
      city: 'Delhi',
      country: 'India',
      area: 'Old Delhi',
      coordinates: [77.2303, 28.6506]
    },
    metadata: {
      category: ['shopping', 'street food', 'cultural'],
      tags: ['market', 'historical', 'food'],
      popularity: 0.88,
      cost: 'free (shopping costs vary)',
      bestTimeToVisit: 'Early morning or evening'
    },
    media: {
      images: ['https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800']
    },
    source: {
      url: 'https://delhitourism.gov.in/chandni-chowk',
      domain: 'delhitourism.gov.in',
      crawledAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    confidence: 0.90
  },
  {
    type: 'event',
    title: 'Autumn Food Festival at Dilli Haat',
    description: 'Annual celebration of seasonal cuisine featuring regional specialties from across India. Over 60 food stalls, cooking demonstrations, and live cultural performances.',
    location: {
      city: 'Delhi',
      country: 'India',
      venue: 'Dilli Haat, INA',
      coordinates: [77.2127, 28.5676]
    },
    dates: {
      start: new Date('2025-10-15'),
      end: new Date('2025-10-25'),
      flexible: false
    },
    metadata: {
      category: ['food', 'cultural'],
      tags: ['festival', 'cuisine', 'family-friendly'],
      popularity: 0.78,
      cost: '₹100 entry',
      duration: '10 days'
    },
    media: {
      images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800']
    },
    source: {
      url: 'https://dillihaat.com/autumn-food-festival',
      domain: 'dillihaat.com',
      crawledAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    confidence: 0.85
  },
  {
    type: 'attraction',
    title: 'Qutub Minar',
    description: 'The tallest brick minaret in the world, standing at 73 meters. UNESCO World Heritage Site built in the 12th century. Surrounded by beautiful Indo-Islamic architecture and gardens.',
    location: {
      city: 'Delhi',
      country: 'India',
      area: 'South Delhi',
      coordinates: [77.1855, 28.5244]
    },
    metadata: {
      category: ['historical', 'architecture', 'UNESCO'],
      tags: ['monument', 'Islamic', 'photography'],
      popularity: 0.89,
      cost: '₹35 (Indians), ₹550 (Foreigners)',
      duration: '1-2 hours',
      openingHours: '7:00 AM - 5:00 PM'
    },
    media: {
      images: ['https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800']
    },
    source: {
      url: 'https://delhitourism.gov.in/qutub-minar',
      domain: 'delhitourism.gov.in',
      crawledAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    confidence: 0.96
  }
];

export async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Connect to database
    await dbManager.connectMongoDB();

    // Clear existing data (optional)
    const existingCount = await Place.countDocuments();
    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing places. Skipping seed.`);
      return;
    }

    // Insert sample data
    await Place.insertMany(samplePlaces);

    logger.info(`Successfully seeded ${samplePlaces.length} places`);

    // Also seed to Weaviate
    const weaviate = dbManager.getWeaviate();

    for (const place of samplePlaces) {
      try {
        await weaviate.data
          .creator()
          .withClassName('TravelContent')
          .withProperties({
            title: place.title,
            description: place.description,
            city: place.location.city,
            country: place.location.country || '',
            type: place.type,
            startDate: place.dates?.start?.toISOString(),
            endDate: place.dates?.end?.toISOString(),
            category: place.metadata.category,
            tags: place.metadata.tags,
            popularity: place.metadata.popularity,
            sourceUrl: place.source.url,
            mongoId: 'placeholder' // Will be updated with actual ID
          })
          .do();

        logger.info(`Seeded to Weaviate: ${place.title}`);
      } catch (error) {
        logger.warn(`Failed to seed to Weaviate: ${place.title}`, error);
      }
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed:', error);
      process.exit(1);
    });
}
