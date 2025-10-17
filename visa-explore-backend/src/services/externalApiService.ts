import axios, { AxiosInstance } from 'axios';
import config from '../config/env';
import logger from '../utils/logger';
import CacheService from './cacheService';

class ExternalApiService {
  private restCountriesClient: AxiosInstance;
  private iataClient: AxiosInstance;
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;

    // REST Countries API client
    this.restCountriesClient = axios.create({
      baseURL: config.externalApis.restCountries,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // IATA Timatic API client
    this.iataClient = axios.create({
      baseURL: config.externalApis.iata.endpoint,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${config.externalApis.iata.apiKey}`,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors for logging
   */
  private setupInterceptors(): void {
    // REST Countries interceptors
    this.restCountriesClient.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('REST Countries API error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );

    // IATA interceptors
    this.iataClient.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('IATA Timatic API error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch country data from REST Countries API
   */
  async fetchCountryByCode(code: string): Promise<any> {
    try {
      // Check cache first
      const cached = await this.cacheService.getCountry(code);
      if (cached) {
        logger.debug(`Country ${code} fetched from cache`);
        return cached;
      }

      // Fetch from API
      const response = await this.restCountriesClient.get(`/alpha/${code}`, {
        params: {
          fields: 'name,cca2,cca3,flags,region,subregion,latlng,population,languages,currencies,capital,timezones',
        },
      });

      const data = response.data;

      // Transform to our format
      const countryData = {
        code: data.cca3,
        code2: data.cca2,
        name: data.name.common,
        officialName: data.name.official,
        flag: data.flags.png || data.flags.svg,
        region: data.region,
        subregion: data.subregion,
        coordinates: [data.latlng[1], data.latlng[0]], // [lng, lat]
        population: data.population,
        languages: Object.values(data.languages || {}),
        currencies: Object.keys(data.currencies || {}),
        capital: data.capital || [],
        timezones: data.timezones || [],
      };

      // Cache the result
      await this.cacheService.cacheCountry(code, countryData);

      logger.info(`Country ${code} fetched from REST Countries API`);
      return countryData;
    } catch (error) {
      logger.error(`Failed to fetch country ${code}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all countries
   */
  async fetchAllCountries(): Promise<any[]> {
    try {
      const response = await this.restCountriesClient.get('/all', {
        params: {
          fields: 'name,cca2,cca3,flags,region,subregion,latlng,population,languages,currencies,capital,timezones',
        },
      });

      const countries = response.data.map((data: any) => ({
        code: data.cca3,
        code2: data.cca2,
        name: data.name.common,
        officialName: data.name.official,
        flag: data.flags.png || data.flags.svg,
        region: data.region,
        subregion: data.subregion,
        coordinates: [data.latlng?.[1] || 0, data.latlng?.[0] || 0],
        population: data.population,
        languages: Object.values(data.languages || {}),
        currencies: Object.keys(data.currencies || {}),
        capital: data.capital || [],
        timezones: data.timezones || [],
      }));

      logger.info(`Fetched ${countries.length} countries from REST Countries API`);
      return countries;
    } catch (error) {
      logger.error('Failed to fetch all countries:', error);
      throw error;
    }
  }

  /**
   * Fetch countries by region
   */
  async fetchCountriesByRegion(region: string): Promise<any[]> {
    try {
      const response = await this.restCountriesClient.get(`/region/${region}`, {
        params: {
          fields: 'name,cca2,cca3,flags,region,subregion',
        },
      });

      const countries = response.data.map((data: any) => ({
        code: data.cca3,
        code2: data.cca2,
        name: data.name.common,
        flag: data.flags.png || data.flags.svg,
        region: data.region,
        subregion: data.subregion,
      }));

      logger.info(`Fetched ${countries.length} countries from region ${region}`);
      return countries;
    } catch (error) {
      logger.error(`Failed to fetch countries by region ${region}:`, error);
      throw error;
    }
  }

  /**
   * Fetch visa requirements from IATA Timatic API
   * Note: This is a placeholder implementation. Real IATA API requires proper credentials and different endpoint structure.
   */
  async fetchVisaRequirements(origin: string, destination: string, travelPurpose: string = 'tourism'): Promise<any> {
    try {
      // Check cache first
      const cached = await this.cacheService.getVisaData(origin, destination);
      if (cached) {
        logger.debug(`Visa data for ${origin}->${destination} fetched from cache`);
        return cached;
      }

      // NOTE: This is a mock implementation
      // Real IATA Timatic API requires proper authentication and different request structure
      // You would need to replace this with actual API calls once you have credentials

      logger.warn('IATA Timatic API not configured - using mock data');

      // Return mock data structure
      const mockVisaData = this.generateMockVisaData(origin, destination);

      // Cache the result
      await this.cacheService.cacheVisaData(origin, destination, mockVisaData);

      return mockVisaData;
    } catch (error) {
      logger.error(`Failed to fetch visa requirements for ${origin}->${destination}:`, error);
      throw error;
    }
  }

  /**
   * Generate mock visa data (for development/testing)
   * Replace this with real IATA API call in production
   */
  private generateMockVisaData(origin: string, destination: string): any {
    // This is sample data - in production, this would come from IATA Timatic API
    const visaTypes: Array<'visa-free' | 'voa' | 'evisa' | 'visa-required'> = ['visa-free', 'voa', 'evisa', 'visa-required'];
    const randomType = visaTypes[Math.floor(Math.random() * visaTypes.length)];

    return {
      originCountry: origin.toUpperCase(),
      destinationCountry: destination.toUpperCase(),
      visaType: randomType,
      requirements: [
        {
          title: 'Valid Passport',
          description: 'Passport must be valid for at least 6 months beyond your intended stay',
          mandatory: true,
        },
        {
          title: 'Return Ticket',
          description: 'Proof of onward or return travel',
          mandatory: true,
        },
        {
          title: 'Proof of Funds',
          description: 'Bank statements or cash equivalent',
          mandatory: randomType !== 'visa-free',
        },
      ],
      stayDuration: randomType === 'visa-free' ? 90 : randomType === 'voa' ? 30 : 60,
      validityPeriod: randomType === 'visa-required' ? 180 : 90,
      fees: randomType === 'visa-free' ? undefined : {
        amount: randomType === 'voa' ? 35 : randomType === 'evisa' ? 50 : 100,
        currency: 'USD',
      },
      processingTime: {
        min: randomType === 'visa-required' ? 7 : randomType === 'evisa' ? 3 : 0,
        max: randomType === 'visa-required' ? 14 : randomType === 'evisa' ? 5 : 0,
        unit: 'days' as const,
      },
      complexityScore: randomType === 'visa-free' ? 10 : randomType === 'voa' ? 30 : randomType === 'evisa' ? 50 : 80,
      source: 'Mock Data',
      metadata: {
        notes: 'This is mock data for development. Replace with real IATA Timatic API integration.',
        allowedPurposes: ['tourism', 'business'],
      },
    };
  }

  /**
   * Search countries by name
   */
  async searchCountriesByName(query: string): Promise<any[]> {
    try {
      const response = await this.restCountriesClient.get(`/name/${query}`, {
        params: {
          fields: 'name,cca2,cca3,flags,region',
        },
      });

      const countries = response.data.map((data: any) => ({
        code: data.cca3,
        code2: data.cca2,
        name: data.name.common,
        flag: data.flags.png || data.flags.svg,
        region: data.region,
      }));

      return countries;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      logger.error(`Failed to search countries by name ${query}:`, error);
      throw error;
    }
  }
}

export default ExternalApiService;
