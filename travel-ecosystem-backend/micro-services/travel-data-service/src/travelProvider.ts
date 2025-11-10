import axios from 'axios';
import {
  articles,
  experiences,
  tips,
  type LocalExperience,
  type TravelArticle,
  type TravelTip
} from './staticData.js';

interface ArticleOptions {
  city: string;
  country: string;
  limit?: number;
}

interface ExperienceOptions {
  city: string;
  country: string;
  type?: string;
}

const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

export class TravelProvider {
  private readonly tavilyKey: string;

  constructor() {
    this.tavilyKey = process.env.TAVILY_API_KEY || '';
  }

  async getArticles(options: ArticleOptions): Promise<TravelArticle[]> {
    const base = articles[options.city.toLowerCase()] ?? [];

    if (!this.tavilyKey || this.tavilyKey === 'your_tavily_api_key_here') {
      return this.limit(base, options.limit);
    }

    try {
      const response = await axios.post(
        TAVILY_ENDPOINT,
        {
          query: `${options.city} ${options.country} travel guide tips best places`,
          max_results: options.limit ?? 5
        },
        {
          headers: { Authorization: `Bearer ${this.tavilyKey}` }
        }
      );

      if (!Array.isArray(response.data?.results)) {
        return this.limit(base, options.limit);
      }

      const remote: TravelArticle[] = response.data.results.map((item: any, index: number) => ({
        id: item.id ?? `tavily-${Date.now()}-${index}`,
        title: item.title,
        description: item.content,
        publishedDate: new Date().toISOString(),
        url: item.url,
        source: item.source ?? 'web',
        category: 'guide',
        tags: [options.city.toLowerCase(), options.country.toLowerCase(), 'travel'],
        images: item.image ? [item.image] : [],
        location: { city: options.city, country: options.country },
        readTime: item.content ? Math.ceil(item.content.length / 200) : undefined
      }));

      const combined = remote.length > 0 ? remote : base;
      return this.limit(combined, options.limit);
    } catch (error) {
      return this.limit(base, options.limit);
    }
  }

  getTips(city: string, country: string): TravelTip[] {
    return tips[city.toLowerCase()] ?? [];
  }

  getExperiences(options: ExperienceOptions): LocalExperience[] {
    const items = experiences[options.city.toLowerCase()] ?? [];

    if (!options.type) {
      return items;
    }

    return items.filter((item) => item.type === options.type);
  }

  private limit<T>(list: T[], limit?: number): T[] {
    if (!limit) {
      return list;
    }

    return list.slice(0, limit);
  }
}
