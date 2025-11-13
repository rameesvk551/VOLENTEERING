export interface CrawlOptions {
  limit?: number;
}

export interface TravelArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  publishedAt: string;
  source: string;
}

export class TravelCrawlerService {
  async crawlTravelArticles(city: string, country: string, options: CrawlOptions = {}): Promise<TravelArticle[]> {
    const limit = options.limit ?? 6;
    return Array.from({ length: limit }).map((_, index) => ({
      id: `${city.toLowerCase()}-article-${index + 1}`,
      title: `${city} travel story ${index + 1}`,
      description: `Curated highlights, dining picks, and walking routes for ${city}.`,
      imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
      url: `https://travel.example.com/${city.toLowerCase()}/story-${index + 1}`,
      publishedAt: new Date(Date.now() - index * 86400000).toISOString(),
      source: 'Travel Digest'
    }));
  }

  async getTravelTips(city: string, country: string): Promise<string[]> {
    return [
      `Reserve skip-the-line passes in ${city} during peak season.`,
      `Carry a reusable water bottle while exploring ${city}'s historic neighborhoods.`,
      `Use the local transit day pass to save on transport in ${city}.`
    ];
  }

  async getLocalExperiences(city: string, country: string, type?: string): Promise<Array<Record<string, unknown>>> {
    return [
      {
        id: `${city.toLowerCase()}-experience-1`,
        name: `${city} street food walk`,
        type: type ?? 'food',
        description: 'Guided tasting tour with local vendors and hidden cafes.',
        price: {
          amount: 45,
          currency: 'USD'
        }
      }
    ];
  }
}
