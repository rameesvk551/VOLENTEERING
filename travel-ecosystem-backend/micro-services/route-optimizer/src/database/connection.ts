/**
 * MongoDB Connection for Route Optimizer Persistence
 */

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'travel-route-optimizer';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  
  console.log(`✅ MongoDB connected: ${DB_NAME}`);
  
  // Create indexes
  await createIndexes();
  
  return db;
}

async function createIndexes() {
  if (!db) return;
  
  const jobsCollection = db.collection('optimization_jobs');
  
  // Index for userId lookup
  await jobsCollection.createIndex({ userId: 1 });
  
  // Index for jobId lookup
  await jobsCollection.createIndex({ jobId: 1 }, { unique: true });
  
  // Index for created timestamp
  await jobsCollection.createIndex({ createdAt: -1 });
  
  // TTL index: auto-delete jobs after 30 days
  await jobsCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 }
  );
  
  console.log('✅ MongoDB indexes created');
}

export async function getDB(): Promise<Db> {
  if (!db) {
    return await connectDB();
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}
