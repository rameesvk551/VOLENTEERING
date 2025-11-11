// MongoDB Models using Mongoose

import mongoose, { Schema, Document } from 'mongoose';
import type { PlaceDocument, QueryCacheDocument, CrawlLogDocument, AttractionCacheDocument } from '@/types';

// Place Schema
const LocationSchema = new Schema({
  city: { type: String, required: true, index: true },
  country: String,
  area: String,
  venue: String,
  coordinates: {
    type: [Number],
    required: true
  }
}, { _id: false });

const DateRangeSchema = new Schema({
  start: { type: Date, required: true, index: true },
  end: { type: Date, required: true, index: true },
  flexible: Boolean
}, { _id: false });

const MetadataSchema = new Schema({
  category: [String],
  tags: [String],
  popularity: { type: Number, min: 0, max: 1 },
  cost: String,
  duration: String,
  crowdLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'very high']
  },
  openingHours: String,
  bestTimeToVisit: String
}, { _id: false });

const MediaSchema = new Schema({
  images: [String],
  videos: [String],
  virtualTour: String
}, { _id: false });

const SourceSchema = new Schema({
  url: { type: String, required: true },
  domain: { type: String, required: true, index: true },
  crawledAt: { type: Date, required: true },
  lastUpdated: Date
}, { _id: false });

const PlaceSchema = new Schema<PlaceDocument>({
  type: {
    type: String,
    required: true,
    enum: ['festival', 'attraction', 'event', 'place', 'experience'],
    index: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: LocationSchema, required: true },
  dates: DateRangeSchema,
  metadata: { type: MetadataSchema, required: true },
  media: MediaSchema,
  source: { type: SourceSchema, required: true },
  embedding: [Number],
  confidence: { type: Number, required: true, min: 0, max: 1 },
  searchableText: { type: String }
}, {
  timestamps: true,
  collection: 'places'
});

// Indexes
PlaceSchema.index({ 'location.coordinates': '2dsphere' });
PlaceSchema.index({ 'dates.start': 1, 'dates.end': 1 });
PlaceSchema.index({ 'metadata.category': 1 });
PlaceSchema.index({ 'metadata.popularity': -1 });
PlaceSchema.index({ searchableText: 'text' });
PlaceSchema.index({ createdAt: -1 });

// Pre-save hook to generate searchable text
PlaceSchema.pre('save', function(next) {
  this.searchableText = [
    this.title,
    this.description,
    this.location.city,
    this.location.country,
    ...this.metadata.category,
    ...this.metadata.tags
  ].filter(Boolean).join(' ').toLowerCase();
  next();
});

export const Place = mongoose.model<PlaceDocument>('Place', PlaceSchema);

// Query Cache Schema
const QueryCacheSchema = new Schema<QueryCacheDocument>({
  queryHash: { type: String, required: true, unique: true, index: true },
  query: {
    city: String,
    country: String,
    month: String,
    year: Number,
    interests: [String],
    eventType: [String],
    duration: Number
  },
  results: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  hitCount: { type: Number, default: 0 }
}, {
  collection: 'query_cache'
});

// TTL index to auto-delete expired cache entries
QueryCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const QueryCache = mongoose.model<QueryCacheDocument>('QueryCache', QueryCacheSchema);

// Crawl Log Schema
const CrawlLogSchema = new Schema<CrawlLogDocument>({
  source: { type: String, required: true, index: true },
  url: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'partial'],
    index: true
  },
  itemsExtracted: { type: Number, default: 0 },
  errorMessages: [String],
  duration: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true }
}, {
  collection: 'crawl_logs',
  suppressReservedKeysWarning: true
});

CrawlLogSchema.index({ startedAt: -1 });

export const CrawlLog = mongoose.model<CrawlLogDocument>('CrawlLog', CrawlLogSchema);

// Attraction Cache Schema
const AttractionCacheSchema = new Schema<AttractionCacheDocument>({
  city: { type: String, required: true },
  country: { type: String },
  cityKey: { type: String, required: true, index: true },
  countryKey: { type: String, required: true, index: true },
  data: {
    monuments: { type: [Schema.Types.Mixed], default: [] },
    museums: { type: [Schema.Types.Mixed], default: [] },
    parks: { type: [Schema.Types.Mixed], default: [] },
    religious: { type: [Schema.Types.Mixed], default: [] }
  },
  fetchedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  hitCount: { type: Number, default: 0 }
}, {
  collection: 'attraction_cache',
  timestamps: true
});

AttractionCacheSchema.index({ cityKey: 1, countryKey: 1 }, { unique: true });
AttractionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AttractionCache = mongoose.model<AttractionCacheDocument>('AttractionCache', AttractionCacheSchema);
