const mongoose = require('mongoose');
const Redis = require('ioredis');
const fs = require('fs');

// Load env
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

const env = loadEnv(__dirname + '/../.env');
const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/travel_discovery';
const redisConfig = {
  host: env.REDIS_HOST || 'localhost',
  port: parseInt(env.REDIS_PORT || '6379'),
  password: env.REDIS_PASSWORD,
  db: parseInt(env.REDIS_DB || '0')
};

async function verify() {
  console.log('🔍 Verifying data in MongoDB and Redis...\n');
  
  let mongoConnection = null;
  let redisClient = null;

  try {
    // Connect to MongoDB
    mongoConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB:', mongoose.connection.name);

    // Connect to Redis
    redisClient = new Redis(redisConfig);
    await redisClient.ping();
    console.log('✓ Connected to Redis\n');

    // Check MongoDB
    console.log('═══════════════════════════════════════');
    console.log('📊 MONGODB DATA');
    console.log('═══════════════════════════════════════');
    
    const AttractionModel = mongoose.model('Attraction', new mongoose.Schema({}, { strict: false, collection: 'attractions' }));
    const attractions = await AttractionModel.find({}).limit(10).lean();
    
    console.log(`Total attractions in DB: ${await AttractionModel.countDocuments()}`);
    console.log(`\nFirst ${Math.min(attractions.length, 5)} attractions:\n`);
    
    attractions.slice(0, 5).forEach((attr, idx) => {
      console.log(`${idx + 1}. ${attr.name}`);
      console.log(`   Place ID: ${attr.placeId}`);
      console.log(`   Address: ${attr.address}`);
      console.log(`   Rating: ${attr.rating} ⭐ (${attr.userRatingsTotal} reviews)`);
      console.log(`   Categories: ${(attr.category || []).join(', ')}`);
      console.log(`   Photos: ${(attr.photos || []).length} images`);
      console.log(`   Source: ${attr.source}`);
      console.log(`   Fetched: ${attr.fetchedAt?.toISOString().split('T')[0]}`);
      console.log('');
    });

    // Check Redis
    console.log('═══════════════════════════════════════');
    console.log('📊 REDIS CACHE DATA');
    console.log('═══════════════════════════════════════');
    
    // Get index
    const indexKey = 'places:delhi:index';
    const indexData = await redisClient.get(indexKey);
    
    if (indexData) {
      const index = JSON.parse(indexData);
      console.log(`City: ${index.city}`);
      console.log(`Total places cached: ${index.count}`);
      console.log(`Last updated: ${new Date(index.lastUpdated).toLocaleString()}`);
      console.log(`\nPlace IDs in cache:`);
      index.placeIds.forEach((id, idx) => {
        console.log(`  ${idx + 1}. ${id}`);
      });
      
      // Get first 3 cached places
      console.log(`\nFirst 3 cached places:\n`);
      for (let i = 0; i < Math.min(3, index.placeIds.length); i++) {
        const placeKey = `place:delhi:${index.placeIds[i]}`;
        const placeData = await redisClient.get(placeKey);
        if (placeData) {
          const place = JSON.parse(placeData);
          console.log(`${i + 1}. ${place.name}`);
          console.log(`   Rating: ${place.rating} ⭐`);
          console.log(`   Types: ${(place.types || []).slice(0, 3).join(', ')}`);
          console.log(`   Cached: ${new Date(place.fetchedAt).toLocaleString()}`);
          console.log('');
        }
      }
    } else {
      console.log('❌ No index found in Redis');
    }

    // Redis stats
    const allKeys = await redisClient.keys('place:delhi:*');
    console.log(`Total Redis keys matching 'place:delhi:*': ${allKeys.length}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (mongoConnection) {
      await mongoose.connection.close();
      console.log('\n✓ MongoDB connection closed');
    }
    if (redisClient) {
      redisClient.disconnect();
      console.log('✓ Redis connection closed');
    }
  }
}

verify().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
