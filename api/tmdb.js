export default async function handler(request, response) {
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    return response.status(500).json({
      error: 'TMDB_ACCESS_TOKEN is not configured on Vercel.'
    });
  }

  const { path = '', language = 'th-TH', page, query, ...rest } = request.query;
  const safePath = Array.isArray(path) ? path[0] : path;

  if (!safePath || !safePath.startsWith('/')) {
    return response.status(400).json({
      error: 'Invalid TMDB path.'
    });
  }

  if (safePath.includes('..') || safePath.includes('://')) {
    return response.status(400).json({
      error: 'Unsafe TMDB path.'
    });
  }

  const tmdbUrl = new URL(`https://api.themoviedb.org/3${safePath}`);

  const appendParam = (key, value) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => tmdbUrl.searchParams.append(key, item));
      return;
    }
    tmdbUrl.searchParams.set(key, value);
  };

  appendParam('language', language || 'th-TH');
  appendParam('page', page);
  appendParam('query', query);

  Object.entries(rest).forEach(([key, value]) => {
    if (key === 'path') return;
    appendParam(key, value);
  });

  try {
    const tmdbResponse = await fetch(tmdbUrl.toString(), {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await tmdbResponse.json();

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return response.status(tmdbResponse.status).json(data);
  } catch (error) {
    return response.status(500).json({
      error: 'Failed to fetch TMDB data.'
    });
  }
}
