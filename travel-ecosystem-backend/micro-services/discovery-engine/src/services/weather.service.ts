export interface WeatherData {
  city: string;
  country?: string;
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

export class WeatherService {
  async getWeatherData(city: string, country?: string): Promise<WeatherData | null> {
    const now = new Date();
    return {
      city,
      country,
      current: {
        temperature: 24,
        feelsLike: 25,
  humidity: 65,
        pressure: 1013,
        windSpeed: 6,
        description: 'Partly cloudy',
        icon: '03d'
      },
      forecast: Array.from({ length: 5 }).map((_, index) => {
        const date = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString(),
          tempMax: 27,
          tempMin: 19,
          description: 'Clear sky',
          icon: '01d',
          humidity: 60,
          windSpeed: 5
        };
      })
    };
  }
}
