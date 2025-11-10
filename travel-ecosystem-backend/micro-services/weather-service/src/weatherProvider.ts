import axios from 'axios';

export interface WeatherPayload {
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

export class WeatherProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
  }

  async getWeather(city: string, country?: string): Promise<WeatherPayload | null> {
    if (!this.apiKey || this.apiKey === 'your_openweather_api_key_here') {
      return null;
    }

    try {
      const location = country ? `${city},${country}` : city;

      const current = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: location,
          units: 'metric',
          appid: this.apiKey
        }
      });

      const forecast = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: location,
          units: 'metric',
          appid: this.apiKey
        }
      });

      return {
        city: current.data.name,
        country: current.data.sys.country,
        current: {
          temperature: Math.round(current.data.main.temp),
          feelsLike: Math.round(current.data.main.feels_like),
          humidity: current.data.main.humidity,
          pressure: current.data.main.pressure,
          windSpeed: current.data.wind.speed,
          description: current.data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${current.data.weather[0].icon}@2x.png`
        },
        forecast: this.toDailyForecast(forecast.data.list)
      };
    } catch (error) {
      return null;
    }
  }

  private toDailyForecast(list: any[]): WeatherPayload['forecast'] {
    const groups = new Map<string, any[]>();

    for (const entry of list) {
      const date = entry.dt_txt.split(' ')[0];
      const items = groups.get(date) || [];
      items.push(entry);
      groups.set(date, items);
    }

    const result: WeatherPayload['forecast'] = [];

    for (const [date, entries] of groups.entries()) {
      if (result.length >= 5) {
        break;
      }

      const temps = entries.map((item) => item.main.temp);
      const mid = entries[Math.floor(entries.length / 2)] ?? entries[0];

      result.push({
        date,
        tempMax: Math.round(Math.max(...temps)),
        tempMin: Math.round(Math.min(...temps)),
        description: mid.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${mid.weather[0].icon}@2x.png`,
        humidity: mid.main.humidity,
        windSpeed: mid.wind.speed
      });
    }

    return result;
  }
}
