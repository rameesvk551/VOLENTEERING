import 'dotenv/config';
import { logger } from '@/utils/logger';
import { dbManager } from '@/database/connection';
import { AttractionCache } from '@/database/models';

type ArgMap = Record<string, string | boolean>;

const parseArgs = (): ArgMap => {
  const args = process.argv.slice(2);
  const parsed: ArgMap = {};

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];

    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = args[i + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      i -= 1;
    } else {
      parsed[key] = next;
    }
  }

  return parsed;
};

const formatDate = (date?: Date | string | null): string => {
  if (!date) {
    return 'n/a';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.toISOString()} (${Math.round((Date.now() - d.getTime()) / 1000)}s ago)`;
};

const toKey = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  return value.trim().toLowerCase();
};

const printDocSummary = (options: {
  city: string;
  country?: string;
  fetchedAt: Date;
  expiresAt: Date;
  hitCount: number;
  counts: Record<string, number>;
}): void => {
  const { city, country, fetchedAt, expiresAt, hitCount, counts } = options;
  const location = country ? `${city}, ${country}` : city;

  // eslint-disable-next-line no-console
  console.log('────────────────────────────────────────────');
  // eslint-disable-next-line no-console
  console.log(`📍 ${location}`);
  // eslint-disable-next-line no-console
  console.log(`   fetchedAt : ${formatDate(fetchedAt)}`);
  // eslint-disable-next-line no-console
  console.log(`   expiresAt : ${formatDate(expiresAt)}`);
  // eslint-disable-next-line no-console
  console.log(`   hitCount  : ${hitCount}`);
  // eslint-disable-next-line no-console
  console.log(`   monuments : ${counts.monuments}`);
  // eslint-disable-next-line no-console
  console.log(`   museums   : ${counts.museums}`);
  // eslint-disable-next-line no-console
  console.log(`   parks     : ${counts.parks}`);
  // eslint-disable-next-line no-console
  console.log(`   religious : ${counts.religious}`);
};

const main = async (): Promise<void> => {
  const args = parseArgs();

  if (args.help || args.h) {
    // eslint-disable-next-line no-console
    console.log(`Usage: pnpm tsx src/scripts/check-attraction-cache.ts [--city <name>] [--country <name>] [--limit <n>]

Examples:
  pnpm tsx src/scripts/check-attraction-cache.ts --city delhi
  pnpm tsx src/scripts/check-attraction-cache.ts --city paris --country france --limit 3
`);
    return;
  }

  try {
    await dbManager.connectMongoDB();
  } catch (error) {
    logger.error('Unable to connect to MongoDB', { error });
    throw error;
  }

  const cityKey = toKey(typeof args.city === 'string' ? args.city : undefined);
  const countryKey = toKey(typeof args.country === 'string' ? args.country : undefined);
  const limitRaw = typeof args.limit === 'string' ? parseInt(args.limit, 10) : NaN;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 5;

  const query: Record<string, unknown> = {};

  if (cityKey) {
    query.cityKey = cityKey;
  }

  if (countryKey) {
    query.countryKey = countryKey;
  }

  const docs = await AttractionCache.find(query)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  if (docs.length === 0) {
    // eslint-disable-next-line no-console
    console.log('No cached attraction entries match the provided filters.');
    await dbManager.disconnectAll();
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Found ${docs.length} cached entr${docs.length === 1 ? 'y' : 'ies'} (limit ${limit}).`);

  docs.forEach((doc) => {
    printDocSummary({
      city: doc.city,
      country: doc.country,
      fetchedAt: doc.fetchedAt,
      expiresAt: doc.expiresAt,
      hitCount: doc.hitCount,
      counts: {
        monuments: doc.data?.monuments?.length ?? 0,
        museums: doc.data?.museums?.length ?? 0,
        parks: doc.data?.parks?.length ?? 0,
        religious: doc.data?.religious?.length ?? 0
      }
    });
  });

  await dbManager.disconnectAll();
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Cache inspection script failed', { error });
    process.exitCode = 1;
  });