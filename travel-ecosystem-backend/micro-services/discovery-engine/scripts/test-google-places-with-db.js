const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const Redis = require('ioredis');

// ============ ENV LOADING ============
function loadEnv(envPath) {
  try {
    const env = {};
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
    return env;
  } catch (err) {
    return {};
  }
}

function loadApiKey(envPath) {
  const env = loadEnv(envPath);
  return env.GOOGLE_PLACES_API_KEY || env.GOOGLE_PLACE_API || 
         process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACE_API || '';
}

function loadMongoUri(envPath) {
  const env = loadEnv(envPath);
  return env.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_discovery';
}

function loadRedisConfig(envPath) {
  const env = loadEnv(envPath);
  return {
    host: env.REDIS_HOST || process.env.REDIS_HOST || 'localhost',
    port: parseInt(env.REDIS_PORT || process.env.REDIS_PORT || '6379'),
    password: env.REDIS_PASSWORD || process.env.REDIS_PASSWORD,
    db: parseInt(env.REDIS_DB || process.env.REDIS_DB || '0')
  };
}

// ============ MONGODB SCHEMA ============
const PlaceSchema = new mongoose.Schema({
  // Google Places specific fields
  placeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  address: String,
  
  // Location
  location: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Ratings and reviews
  rating: Number,
  userRatingsTotal: Number,
  
  // Categorization
  types: [String],
  category: [String],
  
  // Media
  photos: [String],
  
  // Additional details
  website: String,
  phoneNumber: String,
  url: String,
  openingHours: {
    openNow: Boolean,
    weekdayText: [String]
  },
  
  // Metadata
  source: {
    type: String,
    default: 'google_places'
  },
  fetchedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'attractions'
});

// ============ HTTP HELPERS ============
function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => reject(e));
  });
}

// ============ MAIN LOGIC ============
async function main() {
  const repoEnv = __dirname + '/../.env';
  const envPaths = [repoEnv, __dirname + '/../../.env', __dirname + '/../../../.env', '.env'];
  
  let apiKey = '';
  let mongoUri = '';
  let redisConfig = {};
  
  for (const p of envPaths) {
    apiKey = loadApiKey(p);
    mongoUri = loadMongoUri(p);
    redisConfig = loadRedisConfig(p);
    if (apiKey) break;
  }

  if (!apiKey) {
    console.error('❌ No Google Places API key found. Please add GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_API to the .env file.');
    process.exit(1);
  }

  console.log('✓ Using API key (first 8 chars):', apiKey.slice(0, 8) + '...');
  console.log('✓ MongoDB URI:', mongoUri);
  console.log('✓ Redis config:', redisConfig.host + ':' + redisConfig.port);

  // ============ CONNECT TO DATABASES ============
  let mongoConnection = null;
  let redisClient = null;
  let PlaceModel = null;

  try {
    // Connect to MongoDB
    console.log('\n📦 Connecting to MongoDB...');
    mongoConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ MongoDB connected:', mongoose.connection.name);
    
    PlaceModel = mongoose.model('Attraction', PlaceSchema);

    // Connect to Redis
    console.log('\n📦 Connecting to Redis...');
    redisClient = new Redis(redisConfig);
    await redisClient.ping();
    console.log('✓ Redis connected');

  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }

  // ============ FETCH FROM GOOGLE PLACES ============
  const query = 'attractions in Delhi';
  const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

  console.log('\n🔍 Querying Text Search for:', query);
  const textRes = await httpsGetJson(textUrl);

  if (!textRes) {
    console.error('❌ No response from Text Search');
    await cleanup(mongoConnection, redisClient);
    process.exit(1);
  }

  if (textRes.status && textRes.status !== 'OK' && textRes.status !== 'ZERO_RESULTS') {
    console.error('❌ Places API error:', textRes.status, textRes.error_message || '');
    await cleanup(mongoConnection, redisClient);
    process.exit(1);
  }

  const places = (textRes.results || []).slice(0, 5);
  console.log(`✓ Found ${textRes.results ? textRes.results.length : 0} results, fetching details for top ${places.length}`);

  // ============ FETCH DETAILS ============
  const details = await Promise.all(places.map(async (p) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_address,geometry,rating,user_ratings_total,photos,types,url,website,formatted_phone_number,opening_hours,editorial_summary&key=${apiKey}`;
      const d = await httpsGetJson(detailsUrl);
      return d.result || null;
    } catch (e) {
      console.error('❌ Detail fetch error for', p.place_id, e.message || e);
      return null;
    }
  }));

  const validDetails = details.filter(Boolean);
  console.log(`✓ Fetched details for ${validDetails.length} places\n`);

  // ============ SAVE TO MONGODB ============
  console.log('💾 Saving to MongoDB...');
  let savedCount = 0;
  let updatedCount = 0;

  for (const place of validDetails) {
    try {
      const placeData = {
        placeId: place.place_id || generatePlaceId(place),
        name: place.name,
        description: place.editorial_summary?.overview || `${place.name} is a popular attraction.`,
        address: place.formatted_address || '',
        location: {
          city: 'Delhi',
          country: 'India',
          coordinates: {
            lat: place.geometry?.location?.lat || 0,
            lng: place.geometry?.location?.lng || 0
          }
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types || [],
        category: extractCategories(place.types || []),
        photos: (place.photos || []).slice(0, 3).map(ph => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${ph.photo_reference}&key=${apiKey}`
        ),
        website: place.website,
        phoneNumber: place.formatted_phone_number,
        url: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          weekdayText: place.opening_hours.weekday_text || []
        } : undefined,
        source: 'google_places',
        fetchedAt: new Date(),
        lastUpdated: new Date()
      };

      const result = await PlaceModel.findOneAndUpdate(
        { placeId: placeData.placeId },
        placeData,
        { upsert: true, new: true }
      );

      if (result.isNew || result._id) {
        savedCount++;
        console.log(`  ✓ Saved: ${place.name}`);
      } else {
        updatedCount++;
        console.log(`  ✓ Updated: ${place.name}`);
      }
    } catch (err) {
      console.error(`  ❌ Error saving ${place.name}:`, err.message);
    }
  }

  console.log(`\n✓ MongoDB: ${savedCount} saved/updated\n`);

  // ============ SAVE TO REDIS ============
  console.log('💾 Saving to Redis...');
  let redisSavedCount = 0;

  for (const place of validDetails) {
    try {
      const placeId = place.place_id || generatePlaceId(place);
      const key = `place:delhi:${placeId}`;
      
      const redisData = {
        placeId: placeId,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        location: place.geometry?.location,
        photos: (place.photos || []).slice(0, 3).map(ph => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${ph.photo_reference}&key=${apiKey}`
        ),
        url: place.url,
        website: place.website,
        fetchedAt: new Date().toISOString()
      };

      await redisClient.setex(key, 3600 * 24 * 7, JSON.stringify(redisData)); // Cache for 7 days
      redisSavedCount++;
      console.log(`  ✓ Cached: ${place.name}`);
    } catch (err) {
      console.error(`  ❌ Error caching ${place.name}:`, err.message);
    }
  }

  // Save index of all Delhi attractions
  try {
    const indexKey = 'places:delhi:index';
    const placeIds = validDetails.map(p => p.place_id || generatePlaceId(p));
    await redisClient.setex(indexKey, 3600 * 24 * 7, JSON.stringify({
      city: 'Delhi',
      count: placeIds.length,
      placeIds: placeIds,
      lastUpdated: new Date().toISOString()
    }));
    console.log(`  ✓ Cached index for Delhi attractions`);
  } catch (err) {
    console.error('  ❌ Error caching index:', err.message);
  }

  console.log(`\n✓ Redis: ${redisSavedCount} places cached\n`);

  // ============ SUMMARY ============
  console.log('═══════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`Places fetched: ${validDetails.length}`);
  console.log(`MongoDB saved: ${savedCount}`);
  console.log(`Redis cached: ${redisSavedCount}`);
  console.log('═══════════════════════════════════════\n');

  // Display sample data
  console.log('Sample data saved:');
  validDetails.slice(0, 2).forEach((place, idx) => {
    console.log(`\n${idx + 1}. ${place.name}`);
    console.log(`   Address: ${place.formatted_address}`);
    console.log(`   Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
    console.log(`   Types: ${(place.types || []).slice(0, 3).join(', ')}`);
  });

  // ============ CLEANUP ============
  await cleanup(mongoConnection, redisClient);
}

// ============ HELPERS ============
function generatePlaceId(place) {
  return `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractCategories(types) {
  const categoryMap = {
    'tourist_attraction': 'attraction',
    'point_of_interest': 'poi',
    'museum': 'museum',
    'park': 'park',
    'place_of_worship': 'religious',
    'historical': 'historical',
    'monument': 'monument'
  };
  
  return types
    .map(t => categoryMap[t] || t)
    .filter((v, i, a) => a.indexOf(v) === i);
}

async function cleanup(mongoConnection, redisClient) {
  try {
    if (mongoConnection) {
      await mongoose.connection.close();
      console.log('✓ MongoDB connection closed');
    }
    if (redisClient) {
      redisClient.disconnect();
      console.log('✓ Redis connection closed');
    }
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  }
}

// ============ RUN ============
main().catch(err => {
  console.error('\n❌ Script error:', err && err.message ? err.message : err);
  process.exit(1);
});
