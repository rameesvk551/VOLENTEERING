// Discovery Orchestrator - Coordinates all API services (NO AI)
// Fetches data from: Google Places, Weather, Visa, Hotels, Travel Data microservices
// Refactored to use centralized configuration - Follows DRY and SoC principles

import axios from 'axios';
import { Kafka, logLevel, type Consumer, type Producer, type EachMessagePayload } from 'kafkajs';
import { randomUUID } from 'crypto';
import { GooglePlacesService, PlaceResult } from '@/services/google-places.service';
import { logger } from '@/utils/logger';
import { getServiceUrls, isKafkaEnabled, getKafkaTopics, getKafkaTimeout, isAttractionsOnlyMode } from '@/utils/env-config';

// Get service URLs from centralized configuration - Avoids magic strings
const serviceUrls = getServiceUrls();
const WEATHER_SERVICE_URL = serviceUrls.weather;
const HOTEL_SERVICE_URL = serviceUrls.hotel;
const VISA_SERVICE_URL = serviceUrls.visa;
const TRAVEL_DATA_SERVICE_URL = serviceUrls.travelData;

// Get Kafka configuration from centralized utilities
const KAFKA_ENABLED_DEFAULT = isKafkaEnabled();
const kafkaTopics = getKafkaTopics();
const WEATHER_REQUEST_TOPIC = kafkaTopics.weatherRequests;
const HOTEL_REQUEST_TOPIC = kafkaTopics.hotelRequests;
const VISA_REQUEST_TOPIC = kafkaTopics.visaRequests;
const TRAVEL_DATA_REQUEST_TOPIC = kafkaTopics.travelDataRequests;
const DISCOVERY_REPLY_TOPIC = kafkaTopics.discoveryResponses;
const KAFKA_REQUEST_TIMEOUT_MS = getKafkaTimeout();

export interface WeatherData {
  city: string;
  country: string;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
  }>;
}

export interface VisaRequirement {
  country: string;
  countryCode: string;
  visaRequired: boolean;
  visaType?: string;
  maxStay?: string;
  description: string;
  processingTime?: string;
  cost?: string;
  requirements?: string[];
  notes?: string;
  sourceUrl?: string;
}

export interface VisaInfo {
  fromCountry: string;
  toCountry: string;
  visaRequirement: VisaRequirement;
  lastUpdated: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  starRating?: number;
  reviewCount?: number;
  price: {
    amount: number;
    currency: string;
    perNight: boolean;
  };
  images: string[];
  amenities: string[];
  roomTypes?: string[];
  url: string;
  availability?: boolean;
  distanceFromCenter?: number;
}

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

export interface DiscoveryQuery {
  city: string;
  country: string;
  month?: string;
  interests?: string[];
  duration?: number;
  fromCountryCode?: string; // For visa requirements (e.g., 'US', 'IN')
}

export interface DiscoveryResult {
  query: DiscoveryQuery;
  attractions: PlaceResult[];
  weather: WeatherData | null;
  visa: VisaInfo | null;
  hotels: Hotel[];
  travelData: {
    articles: TravelArticle[];
    tips: TravelTip[];
    experiences: LocalExperience[];
  };
  metadata: {
    totalResults: number;
    processingTime: number;
    sources: string[];
    generatedAt: string;
  };
}

interface KafkaResponseMessage<T = unknown> {
  correlationId: string;
  type?: string;
  success: boolean;
  payload?: T;
  error?: string;
}

type ResponseHandler = {
  responseType: string;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

export class DiscoveryOrchestrator {
  private googlePlaces: GooglePlacesService;
  private http = axios.create();
  private kafkaEnabled = KAFKA_ENABLED_DEFAULT;
  private kafka?: Kafka;
  private kafkaProducer?: Producer;
  private kafkaConsumer?: Consumer;
  private kafkaReady?: Promise<void>;
  private readonly replyTopic = DISCOVERY_REPLY_TOPIC;
  private readonly requestTimeoutMs = KAFKA_REQUEST_TIMEOUT_MS;
  private responseHandlers: Map<string, ResponseHandler> = new Map();
  private readonly attractionsOnly: boolean;

  constructor() {
    this.googlePlaces = new GooglePlacesService();
    this.attractionsOnly = isAttractionsOnlyMode();

    if (this.attractionsOnly) {
      logger.info('Discovery orchestrator running in attractions-only mode');
    }
  }

  async initialize(): Promise<void> {
    if (!this.kafkaEnabled) {
      return;
    }

    try {
      await this.ensureKafka();
    } catch (error) {
      logger.error('Kafka initialization failed, disabling Kafka integration', error);
      this.kafkaEnabled = false;
    }
  }

  private async ensureKafka(): Promise<void> {
    if (!this.kafkaEnabled) {
      return;
    }

    if (!this.kafkaReady) {
      this.kafkaReady = this.setupKafka();
    }

    await this.kafkaReady;
  }

  private async setupKafka(): Promise<void> {
    try {
      const brokers = (process.env.KAFKA_BROKERS ?? '')
        .split(',')
        .map((broker: string) => broker.trim())
        .filter(Boolean);

      if (brokers.length === 0) {
        logger.warn('Kafka enabled but KAFKA_BROKERS is empty; falling back to HTTP communication.');
        this.kafkaEnabled = false;
        return;
      }

      const clientId = process.env.KAFKA_CLIENT_ID || 'discovery-engine';
      const groupId = process.env.KAFKA_GROUP_ID || 'discovery-engine-consumer';

      this.kafka = new Kafka({ clientId, brokers, logLevel: logLevel.WARN });
      this.kafkaProducer = this.kafka.producer();
      this.kafkaConsumer = this.kafka.consumer({ groupId });

      await Promise.all([
        this.kafkaProducer.connect(),
        this.kafkaConsumer.connect()
      ]);

      await this.kafkaConsumer.subscribe({ topic: this.replyTopic, fromBeginning: false });
      await this.kafkaConsumer.run({
        eachMessage: async ({ message }: EachMessagePayload) => {
          if (!message.value) {
            return;
          }

          try {
            const decoded = JSON.parse(message.value.toString()) as KafkaResponseMessage;

            if (!decoded?.correlationId) {
              logger.warn('Kafka response missing correlationId, ignoring message.');
              return;
            }

            const handler = this.responseHandlers.get(decoded.correlationId);

            if (!handler) {
              logger.warn('No pending handler for Kafka response', {
                correlationId: decoded.correlationId,
                type: decoded.type
              });
              return;
            }

            this.responseHandlers.delete(decoded.correlationId);

            if (decoded.success) {
              handler.resolve(decoded.payload ?? null);
            } else {
              handler.reject(new Error(decoded.error ?? `Kafka response failed for ${decoded.type ?? handler.responseType}`));
            }
          } catch (error) {
            logger.error('Failed to process Kafka response message', error);
          }
        }
      });

      logger.info('Kafka request-reply channel ready', {
        brokers,
        replyTopic: this.replyTopic
      });
    } catch (error) {
      logger.error('Failed to setup Kafka integration, disabling Kafka usage', error);
      this.kafkaEnabled = false;
      throw error;
    }
  }

  private async sendKafkaRequest<T>(topic: string, payload: Record<string, unknown>, responseType: string): Promise<T | null> {
    if (!this.kafkaEnabled) {
      return null;
    }

    try {
      await this.ensureKafka();
    } catch (error) {
      logger.error('Kafka ensure step failed, using HTTP fallback', error);
      this.kafkaEnabled = false;
      return null;
    }

    if (!this.kafkaProducer) {
      logger.warn('Kafka producer not initialized, falling back to HTTP', { topic });
      return null;
    }

    const correlationId = randomUUID();
    const messageBody = {
      ...payload,
      correlationId,
      replyTopic: this.replyTopic
    };

    return await new Promise<T | null>((resolve) => {
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(correlationId);
        logger.warn('Kafka request timed out', { topic, correlationId, responseType });
        resolve(null);
      }, this.requestTimeoutMs);

      this.responseHandlers.set(correlationId, {
        responseType,
        resolve: (value: unknown) => {
          clearTimeout(timeout);
          resolve((value ?? null) as T | null);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          logger.error('Kafka response reported failure', {
            topic,
            correlationId,
            responseType,
            error: error.message
          });
          resolve(null);
        }
      });

      this.kafkaProducer!.send({
        topic,
        messages: [
          {
            key: correlationId,
            value: JSON.stringify(messageBody)
          }
        ]
      }).catch((error: unknown) => {
        clearTimeout(timeout);
        this.responseHandlers.delete(correlationId);
        logger.error('Failed to publish Kafka request', {
          topic,
          correlationId,
          responseType,
          error
        });
        resolve(null);
      });
    });
  }

  /**
   * Main discovery method - orchestrates all API calls
   */
  async discover(query: DiscoveryQuery): Promise<DiscoveryResult> {
    const startTime = Date.now();

    logger.info('🚀 Discovery Orchestrator Started', {
      city: query.city,
      country: query.country,
      timestamp: new Date().toISOString()
    });

    try {
      let attractions: PlaceResult[] = [];
      let weather: WeatherData | null = null;
      let visa: VisaInfo | null = null;
      let hotels: Hotel[] = [];
      let articles: TravelArticle[] = [];
      let tips: TravelTip[] = [];
      let experiences: LocalExperience[] = [];

      if (this.attractionsOnly) {
        attractions = await this.fetchAttractions(query);
      } else {
        [attractions, weather, visa, hotels, articles, tips, experiences] = await Promise.all([
          this.fetchAttractions(query),
          this.fetchWeather(query),
          this.fetchVisa(query),
          this.fetchHotels(query),
          this.fetchTravelArticles(query),
          this.fetchTravelTips(query),
          this.fetchLocalExperiences(query)
        ]);
      }

      // Count active sources
      const sources: string[] = [];
      if (attractions.length > 0) sources.push('google-places');
      if (!this.attractionsOnly) {
        if (weather) sources.push('weather-service');
        if (visa) sources.push('visa-service');
        if (hotels.length > 0) sources.push('hotel-service');
        if (articles.length > 0 || tips.length > 0 || experiences.length > 0) {
          sources.push('travel-data-service');
        }
      }

      const result: DiscoveryResult = {
        query,
        attractions,
        weather,
        visa,
        hotels,
        travelData: {
          articles,
          tips,
          experiences
        },
        metadata: {
          totalResults: attractions.length + hotels.length + articles.length,
          processingTime: Date.now() - startTime,
          sources,
          generatedAt: new Date().toISOString()
        }
      };

      logger.info('✅ Discovery Completed Successfully', {
        city: query.city,
        attractions: attractions.length,
        hotels: hotels.length,
        hasWeather: !!weather,
        hasVisa: !!visa,
        articles: articles.length,
        tips: tips.length,
        experiences: experiences.length,
        processingTime: result.metadata.processingTime
      });

      return result;

    } catch (error) {
      logger.error('Discovery orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Fetch attractions from Google Places
   */
  private async fetchAttractions(query: DiscoveryQuery): Promise<PlaceResult[]> {
    try {
      logger.info('🗺️ Step 1/7: Fetching attractions from Google Places...');

      if (!this.googlePlaces.isEnabled()) {
        logger.warn('Google Places API not enabled');
        return [];
      }

      const attractionData = await this.googlePlaces.getPopularAttractions(
        query.city,
        query.country
      );

      // Combine all attraction types
      const allAttractions = [
        ...attractionData.monuments,
        ...attractionData.museums,
        ...attractionData.parks,
        ...attractionData.religious
      ];

      // Filter by interests if specified
      let filtered = allAttractions;
      if (query.interests && query.interests.length > 0) {
        filtered = allAttractions.filter((attraction) => {
          const types = attraction.types.join(' ').toLowerCase();
          return query.interests!.some((interest) => types.includes(interest.toLowerCase()));
        });
      }

      logger.info(`✅ Fetched ${filtered.length} attractions`, {
        total: allAttractions.length,
        filtered: filtered.length
      });

      return filtered;

    } catch (error) {
      logger.error('Failed to fetch attractions:', error);
      return [];
    }
  }

  /**
   * Fetch weather data
   */
  private async fetchWeather(query: DiscoveryQuery): Promise<WeatherData | null> {
    try {
      logger.info('🌤️ Step 2/7: Fetching weather data...');

      if (this.kafkaEnabled) {
        const kafkaWeather = await this.sendKafkaRequest<WeatherData>(
          WEATHER_REQUEST_TOPIC,
          {
            city: query.city,
            country: query.country
          },
          'weather'
        );

        if (kafkaWeather !== null) {
          logger.info('✅ Weather data fetched via Kafka', {
            city: query.city,
            topic: WEATHER_REQUEST_TOPIC
          });

          return kafkaWeather;
        }

        logger.warn('Weather Kafka request returned no data; using HTTP fallback.', {
          city: query.city
        });
      }

      const response = await this.http.get<WeatherData>(`${WEATHER_SERVICE_URL}/weather`, {
        params: {
          city: query.city,
          country: query.country
        }
      });

      logger.info('✅ Weather data fetched via HTTP', {
        city: query.city,
        service: WEATHER_SERVICE_URL
      });

      return response.data ?? null;

    } catch (error) {
      logger.error('Failed to fetch weather:', error);
      return null;
    }
  }

  /**
   * Fetch visa requirements
   */
  private async fetchVisa(query: DiscoveryQuery): Promise<VisaInfo | null> {
    try {
      logger.info('🛂 Step 3/7: Fetching visa information...');

      if (!query.fromCountryCode) {
        logger.warn('No source country provided for visa check');
        return null;
      }

      if (this.kafkaEnabled) {
        const kafkaVisa = await this.sendKafkaRequest<VisaInfo>(
          VISA_REQUEST_TOPIC,
          {
            from: query.fromCountryCode,
            to: query.country
          },
          'visa'
        );

        if (kafkaVisa !== null) {
          logger.info('✅ Visa information fetched via Kafka', {
            from: query.fromCountryCode,
            to: query.country,
            topic: VISA_REQUEST_TOPIC
          });

          return kafkaVisa;
        }

        logger.warn('Visa Kafka request returned no data; using HTTP fallback.', {
          from: query.fromCountryCode,
          to: query.country
        });
      }

      const response = await this.http.get<VisaInfo>(`${VISA_SERVICE_URL}/visa`, {
        params: {
          from: query.fromCountryCode,
          to: query.country
        }
      });

      logger.info('✅ Visa information fetched via HTTP', {
        from: query.fromCountryCode,
        to: query.country,
        service: VISA_SERVICE_URL
      });

      return response.data ?? null;

    } catch (error) {
      logger.error('Failed to fetch visa info:', error);
      return null;
    }
  }

  /**
   * Fetch hotels
   */
  private async fetchHotels(query: DiscoveryQuery): Promise<Hotel[]> {
    try {
      logger.info('🏨 Step 4/7: Fetching hotel data...');

      if (this.kafkaEnabled) {
        const kafkaHotels = await this.sendKafkaRequest<Hotel[]>(
          HOTEL_REQUEST_TOPIC,
          {
            city: query.city,
            country: query.country,
            limit: 10
          },
          'hotel'
        );

        if (kafkaHotels !== null) {
          logger.info('✅ Fetched hotels via Kafka', {
            city: query.city,
            count: kafkaHotels.length,
            topic: HOTEL_REQUEST_TOPIC
          });

          return kafkaHotels;
        }

        logger.warn('Hotel Kafka request returned no data; using HTTP fallback.', {
          city: query.city
        });
      }

      const response = await this.http.get<{ hotels: Hotel[] }>(`${HOTEL_SERVICE_URL}/hotels`, {
        params: {
          city: query.city,
          country: query.country,
          limit: 10
        }
      });

      const hotels = response.data?.hotels ?? [];

      logger.info('✅ Fetched hotels via HTTP', {
        city: query.city,
        count: hotels.length,
        service: HOTEL_SERVICE_URL
      });

      return hotels;

    } catch (error) {
      logger.error('Failed to fetch hotels:', error);
      return [];
    }
  }

  /**
   * Fetch travel articles
   */
  private async fetchTravelArticles(query: DiscoveryQuery): Promise<TravelArticle[]> {
    try {
      logger.info('📰 Step 5/7: Crawling travel articles...');

      if (this.kafkaEnabled) {
        const kafkaArticles = await this.sendKafkaRequest<TravelArticle[]>(
          TRAVEL_DATA_REQUEST_TOPIC,
          {
            city: query.city,
            country: query.country,
            limit: 5,
            resource: 'articles'
          },
          'articles'
        );

        if (kafkaArticles !== null) {
          logger.info('✅ Travel articles fetched via Kafka', {
            city: query.city,
            count: kafkaArticles.length,
            topic: TRAVEL_DATA_REQUEST_TOPIC
          });

          return kafkaArticles;
        }

        logger.warn('Article Kafka request returned no data; using HTTP fallback.', {
          city: query.city
        });
      }

      const response = await this.http.get<{ articles: TravelArticle[] }>(`${TRAVEL_DATA_SERVICE_URL}/articles`, {
        params: {
          city: query.city,
          country: query.country,
          limit: 5
        }
      });

      const articles = response.data?.articles ?? [];

      logger.info('✅ Crawled travel articles via HTTP', {
        city: query.city,
        count: articles.length,
        service: TRAVEL_DATA_SERVICE_URL
      });

      return articles;

    } catch (error) {
      logger.error('Failed to crawl articles:', error);
      return [];
    }
  }

  /**
   * Fetch travel tips
   */
  private async fetchTravelTips(query: DiscoveryQuery): Promise<TravelTip[]> {
    try {
      logger.info('💡 Step 6/7: Fetching travel tips...');

      if (this.kafkaEnabled) {
        const kafkaTips = await this.sendKafkaRequest<TravelTip[]>(
          TRAVEL_DATA_REQUEST_TOPIC,
          {
            city: query.city,
            country: query.country,
            resource: 'tips'
          },
          'tips'
        );

        if (kafkaTips !== null) {
          logger.info('✅ Travel tips fetched via Kafka', {
            city: query.city,
            count: kafkaTips.length,
            topic: TRAVEL_DATA_REQUEST_TOPIC
          });

          return kafkaTips;
        }

        logger.warn('Travel tips Kafka request returned no data; using HTTP fallback.', {
          city: query.city
        });
      }

      const response = await this.http.get<{ tips: TravelTip[] }>(`${TRAVEL_DATA_SERVICE_URL}/tips`, {
        params: {
          city: query.city,
          country: query.country
        }
      });

      const tips = response.data?.tips ?? [];

      logger.info('✅ Fetched travel tips via HTTP', {
        city: query.city,
        count: tips.length,
        service: TRAVEL_DATA_SERVICE_URL
      });

      return tips;

    } catch (error) {
      logger.error('Failed to fetch tips:', error);
      return [];
    }
  }

  /**
   * Fetch local experiences
   */
  private async fetchLocalExperiences(query: DiscoveryQuery): Promise<LocalExperience[]> {
    try {
      logger.info('🎭 Step 7/7: Fetching local experiences...');

      if (this.kafkaEnabled) {
        const kafkaExperiences = await this.sendKafkaRequest<LocalExperience[]>(
          TRAVEL_DATA_REQUEST_TOPIC,
          {
            city: query.city,
            country: query.country,
            resource: 'experiences'
          },
          'experiences'
        );

        if (kafkaExperiences !== null) {
          logger.info('✅ Local experiences fetched via Kafka', {
            city: query.city,
            count: kafkaExperiences.length,
            topic: TRAVEL_DATA_REQUEST_TOPIC
          });

          return kafkaExperiences;
        }

        logger.warn('Experience Kafka request returned no data; using HTTP fallback.', {
          city: query.city
        });
      }

      const response = await this.http.get<{ experiences: LocalExperience[] }>(`${TRAVEL_DATA_SERVICE_URL}/experiences`, {
        params: {
          city: query.city,
          country: query.country
        }
      });

      const experiences = response.data?.experiences ?? [];

      logger.info('✅ Fetched local experiences via HTTP', {
        city: query.city,
        count: experiences.length,
        service: TRAVEL_DATA_SERVICE_URL
      });

      return experiences;

    } catch (error) {
      logger.error('Failed to fetch experiences:', error);
      return [];
    }
  }
}
