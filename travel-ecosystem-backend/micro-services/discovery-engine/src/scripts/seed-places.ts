import 'dotenv/config';
import { logger } from '@/utils/logger';
import { dbManager } from '@/database/connection';
import { Place } from '@/database/models';
import { GooglePlacesService } from '@/services/google-places.service';
import {
  categorizeGooglePlaceByTypes,
  convertCoordinatesToGeoJSON,
  normalizeRating
} from '@/utils/data-transformers';

interface CliArgs {
  city?: string;
  country?: string;
  limit?: number;
  dryRun?: boolean;
}

const parseArgs = (): CliArgs => {
  const args = process.argv.slice(2);
  const parsed: CliArgs = {};

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];

    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = args[i + 1];

    switch (key) {
      case 'city':
        if (typeof next === 'string') {
          parsed.city = next;
          i += 1;
        }
        break;
      case 'country':
        if (typeof next === 'string') {
          parsed.country = next;
          i += 1;
        }
        break;
      case 'limit': {
        const limitValue = typeof next === 'string' ? parseInt(next, 10) : NaN;
        if (Number.isFinite(limitValue) && limitValue > 0) {
          parsed.limit = limitValue;
          i += 1;
        }
        break;
      }
      case 'dry-run':
        parsed.dryRun = true;
        break;
      case 'help':
      case 'h':
        // eslint-disable-next-line no-console
        console.log(`Seed Google Places attractions into MongoDB

Usage:
  pnpm tsx src/scripts/seed-places.ts --city <name> [--country <name>] [--limit <n>] [--dry-run]

Examples:
  pnpm tsx src/scripts/seed-places.ts --city delhi --country india
  pnpm tsx src/scripts/seed-places.ts --city tokyo --limit 10
  pnpm tsx src/scripts/seed-places.ts --city dubai --dry-run
`);
        process.exit(0);
        break;
      default:
        break;
    }
  }

  return parsed;
};

const toTitleCase = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const normaliseLocation = (raw?: string): string | undefined => {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  return toTitleCase(trimmed) ?? trimmed;
};

const extractDomain = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    logger.warn('Failed to parse place URL, falling back to maps.google.com', { url, error });
    return 'maps.google.com';
  }
};

const buildOpeningHours = (weekdayText?: string[]): string | undefined => {
  if (!weekdayText || weekdayText.length === 0) {
    return undefined;
  }
  return weekdayText.join('\n');
};

const seedAttractions = async (options: {
  city: string;
  country?: string;
  limit?: number;
  dryRun?: boolean;
}): Promise<{ inserted: number; updated: number; skipped: number; total: number; }> => {
  const { city, country, limit, dryRun } = options;

  const service = new GooglePlacesService();

  if (!service.isEnabled()) {
    throw new Error('Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY before running the seed script.');
  }

  // Prefer cached attractions so the seed script does not hit Google Places repeatedly
  const cache = await service['getCachedAttractions']?.(
    service['getLocationKeys']?.(city, country ?? '')
  );

  const response = cache ?? await service.getPopularAttractions(city, country ?? '');

  const combined = [
    ...(response.monuments ?? []),
    ...(response.museums ?? []),
    ...(response.parks ?? []),
    ...(response.religious ?? [])
  ];

  if (combined.length === 0) {
    logger.warn('Google Places returned no attractions for the requested location', { city, country });
    return { inserted: 0, updated: 0, skipped: 0, total: 0 };
  }

  const uniqueByPlaceId = new Map<string, typeof combined[number]>();
  combined.forEach((item) => {
    if (!uniqueByPlaceId.has(item.placeId)) {
      uniqueByPlaceId.set(item.placeId, item);
    }
  });

  let attractions = Array.from(uniqueByPlaceId.values());

  if (typeof limit === 'number' && limit > 0) {
    attractions = attractions.slice(0, limit);
  }

  const stats = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    total: attractions.length
  };

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.table(attractions.map((item) => ({
      name: item.name,
      rating: item.rating ?? 'n/a',
      address: item.address
    })));
    return stats;
  }

  const seededAt = new Date();
  const locationCity = normaliseLocation(city) ?? city;
  const locationCountry = normaliseLocation(country) ?? country;

  for (const attraction of attractions) {
    const filter = { 'source.url': attraction.url } as const;
    const existing = await Place.findOne(filter);

    const popularity = normalizeRating(attraction.rating);
    const metadataCategory = categorizeGooglePlaceByTypes(attraction.types ?? []);
    const openingHours = buildOpeningHours(attraction.openingHours?.weekday_text);

    const payload = {
      type: 'attraction' as const,
      title: attraction.name,
      description: attraction.description || `${attraction.name} is a popular attraction in ${locationCity}.`,
      location: {
        city: locationCity,
        country: locationCountry,
        venue: attraction.address,
        coordinates: convertCoordinatesToGeoJSON(attraction.coordinates)
      },
      metadata: {
        category: [metadataCategory],
        tags: Array.from(new Set([...(attraction.types ?? []), attraction.placeId])).filter(Boolean),
        popularity,
        openingHours
      },
      media: {
        images: attraction.photos?.slice(0, 10) ?? []
      },
      source: {
        url: attraction.url,
        domain: extractDomain(attraction.url),
        crawledAt: seededAt,
        lastUpdated: seededAt
      },
      confidence: popularity || 0.6
    };

    if (existing) {
      existing.set(payload);
      existing.source.lastUpdated = seededAt;
      if (!existing.source.crawledAt) {
        existing.source.crawledAt = seededAt;
      }
      await existing.save();
      stats.updated += 1;
      continue;
    }

    const newPlace = new Place(payload);
    await newPlace.save();
    stats.inserted += 1;
  }

  return stats;
};

const main = async (): Promise<void> => {
  const args = parseArgs();

  if (!args.city) {
    throw new Error('City is required. Pass it via --city <name>.');
  }

  await dbManager.connectMongoDB();

  try {
    const stats = await seedAttractions({
      city: args.city,
      country: args.country,
      limit: args.limit,
      dryRun: args.dryRun
    });

    logger.info('Google Places seed completed', {
      city: args.city,
      country: args.country,
      inserted: stats.inserted,
      updated: stats.updated,
      skipped: stats.skipped,
      total: stats.total,
      dryRun: Boolean(args.dryRun)
    });
  } finally {
    await dbManager.disconnectAll();
  }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    logger.error('Seed script failed', { error });
    process.exitCode = 1;
  });
