const fs = require('fs');
const https = require('https');

function loadApiKey(envPath) {
  try {
    const env = fs.readFileSync(envPath, 'utf8');
    const m1 = env.match(/GOOGLE_PLACES_API_KEY\s*=\s*([A-Za-z0-9_\-:]+)/i);
    if (m1 && m1[1]) return m1[1].trim();
    const m2 = env.match(/GOOGLE_PLACE_API\s*=\s*([A-Za-z0-9_\-:]+)/i);
    if (m2 && m2[1]) return m2[1].trim();
    const m3 = env.match(/GOOGLE_PLACES_API_KEY\s*=\s*"([^"]+)"/i);
    if (m3 && m3[1]) return m3[1].trim();
  } catch (err) {
    // ignore
  }
  return process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACE_API || '';
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => reject(e));
  });
}

async function main() {
  const repoEnv = __dirname + '/../.env';
  const envPaths = [repoEnv, __dirname + '/../../.env', __dirname + '/../../../.env', '.env'];
  let key = '';
  for (const p of envPaths) {
    key = loadApiKey(p);
    if (key) break;
  }

  if (!key) {
    console.error('No Google Places API key found. Please add GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_API to the .env file.');
    process.exit(1);
  }

  console.log('Using API key (first 8 chars):', key.slice(0, 8) + '...');

  const query = 'attractions in Delhi';
  const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`;

  console.log('Querying Text Search for:', query);
  const textRes = await httpsGetJson(textUrl);

  if (!textRes) {
    console.error('No response from Text Search');
    process.exit(1);
  }

  if (textRes.status && textRes.status !== 'OK' && textRes.status !== 'ZERO_RESULTS') {
    console.error('Places API error:', textRes.status, textRes.error_message || '');
    process.exit(1);
  }

  const places = (textRes.results || []).slice(0, 5);
  console.log(`Found ${textRes.results ? textRes.results.length : 0} results, fetching details for top ${places.length}`);

  const details = await Promise.all(places.map(async (p) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_address,geometry,rating,user_ratings_total,photos,types,url,website,formatted_phone_number,opening_hours,editorial_summary&key=${key}`;
      const d = await httpsGetJson(detailsUrl);
      return d.result || null;
    } catch (e) {
      console.error('Detail fetch error for', p.place_id, e.message || e);
      return null;
    }
  }));

  const normalized = details.filter(Boolean).map(place => {
    const photos = (place.photos || []).slice(0, 3).map(ph => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${ph.photo_reference}&key=${key}`);
    return {
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      location: place.geometry && place.geometry.location,
      photos
    };
  });

  console.log('--- Results ---');
  console.log(JSON.stringify(normalized, null, 2));
}

main().catch(err => {
  console.error('Script error:', err && err.message ? err.message : err);
  process.exit(1);
});
