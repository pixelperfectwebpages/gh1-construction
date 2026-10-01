// Cloudflare Pages Function: GET /api/reviews
//
// Fetches GH1 Construction's Google rating + reviews via the Places API (New)
// and returns them as JSON. Results are cached at the edge so the Places API
// is only hit a few times a day, not on every page view.
//
// Requires a Cloudflare Pages environment variable (set in the dashboard,
// never committed to the repo): GOOGLE_PLACES_API_KEY
//
// The key must be restricted (in Google Cloud Console) to:
//   - API restriction: Places API (New) only
//   - Application restriction: HTTP referrers -> gh1construction.com/*
// Since this function runs server-side on Cloudflare, the key is never sent
// to the browser.

const BUSINESS_QUERY = 'GH1 Construction, 5828 W Waveland Ave, Chicago, IL 60634';
const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

export async function onRequestGet(context) {
  const { env, request } = context;
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  if (!env.GOOGLE_PLACES_API_KEY) {
    return jsonResponse({ error: 'Reviews are not configured yet.' }, 503);
  }

  try {
    const placeId = await resolvePlaceId(env.GOOGLE_PLACES_API_KEY);
    if (!placeId) {
      return jsonResponse({ error: 'Could not locate the business listing.' }, 502);
    }

    const details = await fetchPlaceDetails(placeId, env.GOOGLE_PLACES_API_KEY);

    const payload = {
      rating: details.rating || null,
      reviewCount: details.userRatingCount || 0,
      reviews: (details.reviews || []).map((r) => ({
        name: r.authorAttribution?.displayName || 'Google user',
        photoUrl: r.authorAttribution?.photoUri || null,
        rating: r.rating || 0,
        text: r.text?.text || r.originalText?.text || '',
        relativeTime: r.relativePublishTimeDescription || '',
        publishTime: r.publishTime || null,
      })),
      fetchedAt: new Date().toISOString(),
    };

    const response = jsonResponse(payload, 200, CACHE_TTL_SECONDS);
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (err) {
    return jsonResponse({ error: 'Unable to fetch reviews right now.' }, 502);
  }
}

async function resolvePlaceId(apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: BUSINESS_QUERY }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.places && data.places[0] ? data.places[0].id : null;
}

async function fetchPlaceDetails(placeId, apiKey) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
  });
  if (!res.ok) throw new Error('Place Details request failed');
  return res.json();
}

function jsonResponse(data, status, cacheSeconds) {
  const headers = { 'Content-Type': 'application/json' };
  if (cacheSeconds) headers['Cache-Control'] = `public, max-age=${cacheSeconds}`;
  return new Response(JSON.stringify(data), { status, headers });
}
