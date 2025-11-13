import 'dotenv/config';
import { logger } from '@/utils/logger';
import { dbManager } from '@/database/connection';
import { Place } from '@/database/models';

interface CliArgs {
  city?: string;
  country?: string;
  limit?: number;
  fields?: string[];
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
      case 'fields':
        if (typeof next === 'string') {
          parsed.fields = next.split(',').map((field) => field.trim()).filter(Boolean);
          i += 1;
        }
        break;
      case 'help':
      case 'h':
        // eslint-disable-next-line no-console
        console.log(`Inspect entries stored in the places collection.

Usage:
  pnpm tsx src/scripts/check-places.ts [--city <name>] [--country <name>] [--limit <n>] [--fields title,location.country]

Examples:
  pnpm tsx src/scripts/check-places.ts --city delhi
  pnpm tsx src/scripts/check-places.ts --country india --limit 10 --fields title,metadata.category,source.domain
`);
        process.exit(0);
        break;
      default:
        break;
    }
  }

  return parsed;
};

const toRegexFilter = (value?: string): RegExp | undefined => {
  if (!value) {
    return undefined;
  }
  return new RegExp(`^${value.trim()}$`, 'i');
};

const pickFields = <T extends Record<string, unknown>>(doc: T, fields?: string[]): Record<string, unknown> => {
  if (!fields || fields.length === 0) {
    return doc;
  }

  const result: Record<string, unknown> = {};

  fields.forEach((field) => {
    const segments = field.split('.');
    let current: any = doc;
    let target: any = result;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      if (current == null || typeof current !== 'object') {
        return;
      }

      if (index === segments.length - 1) {
        target[segment] = current[segment];
        return;
      }

      current = current[segment];
      if (current == null || typeof current !== 'object') {
        return;
      }

      target[segment] = target[segment] ?? {};
      target = target[segment];
    }
  });

  return result;
};

const main = async (): Promise<void> => {
  const args = parseArgs();

  await dbManager.connectMongoDB();

  try {
    const filter: Record<string, unknown> = {};
    const cityFilter = toRegexFilter(args.city);
    const countryFilter = toRegexFilter(args.country);

    if (cityFilter) {
      filter['location.city'] = cityFilter;
    }

    if (countryFilter) {
      filter['location.country'] = countryFilter;
    }

    const total = await Place.countDocuments(filter);

    if (total === 0) {
      // eslint-disable-next-line no-console
      console.log('No matching documents in places collection.', { filter });
      return;
    }

    const limit = args.limit ?? 5;

    const docs = await Place.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // eslint-disable-next-line no-console
    console.log(`Found ${total} matching document${total === 1 ? '' : 's'} (showing up to ${limit}).`);

    docs.forEach((doc, index) => {
      const summary = pickFields(doc, args.fields);
      // eslint-disable-next-line no-console
      console.log(`\n#${index + 1}`);
      // eslint-disable-next-line no-console
      console.dir(summary, { depth: 4 });
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
    logger.error('Failed to inspect places collection', { error });
    process.exitCode = 1;
  });
