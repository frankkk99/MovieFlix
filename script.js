document.addEventListener('DOMContentLoaded', () => {
  const IMG = 'https://image.tmdb.org/t/p/';
  const FALLBACK = 'https://placehold.co/1280x720/141414/FFFFFF?text=DOFree';
  const $ = (id) => document.getElementById(id);

  const mainContent = $('main-content');
  const playerPage = $('player-page');
  const heroBackdrop = $('hero-backdrop');
  const heroTitle = $('hero-title');
  const heroOverview = $('hero-overview');
  const heroMeta = $('hero-meta');
  const heroWatchBtn = $('hero-watch-btn');
  const heroInfoBtn = $('hero-info-btn');
  const youtubeWrapper = $('youtube-embed-wrapper');
  const playerTitle = $('player-title');
  const playerReleaseDate = $('player-release-date');
  const playerRuntime = $('player-runtime');
  const playerRating = $('player-rating');
  const playerGenres = $('player-genres');
  const playerOverview = $('player-overview');
  const playerCast = $('player-cast');
  const backToMainBtn = $('back-to-main-btn');
  const movieModal = $('movie-modal');
  const modalBackdrop = $('modal-backdrop');
  const modalTitle = $('modal-title');
  const modalReleaseDate = $('modal-release-date');
  const modalRuntime = $('modal-runtime');
  const modalRating = $('modal-rating');
  const modalOverview = $('modal-overview');
  const modalGenres = $('modal-genres');
  const modalWatchBtn = $('modal-watch-btn');
  const closeModalBtn = $('close-modal-btn');
  const searchBtn = $('search-btn');
  const searchModal = $('search-modal');
  const closeSearchModalBtn = $('close-search-modal-btn');
  const searchInput = $('search-input');
  const searchType = $('search-type');
  const searchGenre = $('search-genre');
  const searchYear = $('search-year');
  const searchSortBy = $('search-sort-by');
  const clearSearchBtn = $('clear-search-btn');
  const searchGrid = $('search-modal-grid');
  const categoryModal = $('category-modal');
  const categoryModalTitle = $('category-modal-title');
  const categoryModalGrid = $('category-modal-grid');
  const closeCategoryModalBtn = $('close-category-modal-btn');

  let heroItem = null;
  let selectedItem = null;
  let selectedType = 'movie';
  let genres = { movie: [], tv: [] };

  const text = (node, value) => { if (node) node.textContent = value || ''; };
  const show = (node) => node && node.classList.remove('hidden');
  const hide = (node) => node && node.classList.add('hidden');
  const titleOf = (item) => item?.title || item?.name || item?.original_title || item?.original_name || 'Untitled';
  const dateOf = (item) => item?.release_date || item?.first_air_date || '';
  const yearOf = (item) => dateOf(item)?.slice(0, 4) || '-';
  const poster = (path) => path ? `${IMG}w500${path}` : 'https://placehold.co/500x750/181818/FFFFFF?text=DOFree';
  const backdrop = (path) => path ? `${IMG}original${path}` : FALLBACK;
  const typeOf = (item, fallback = 'movie') => item?.media_type === 'tv' || item?.name ? 'tv' : fallback;

  async function api(path, options = {}) {
    const url = new URL('/api/tmdb', window.location.origin);
    url.searchParams.set('path', path);
    url.searchParams.set('language', options.language || 'th-TH');
    Object.entries(options.params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString());
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.status_message || 'Load failed');
    return data;
  }

  function runtime(details, mediaType) {
    if (mediaType === 'tv') {
      const seasons = details.number_of_seasons || 0;
      const episodes = details.number_of_episodes || 0;
      return seasons ? `${seasons} ซีซัน • ${episodes} ตอน` : '-';
    }
    const minutes = details.runtime || 0;
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h} ชม. ${m} นาที` : `${m} นาที`;
  }

  function card(item, fallbackType = 'movie', grid = false) {
    const mediaType = typeOf(item, fallbackType);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = grid
      ? 'group text-left w-full transition-transform duration-300 hover:scale-105'
      : 'group text-left flex-shrink-0 w-36 sm:w-44 md:w-48 transition-transform duration-300 hover:scale-105';
    button.innerHTML = `
      <div class="aspect-[2/3] rounded-md overflow-hidden bg-[#222] shadow-lg">
        <img src="${poster(item.poster_path)}" alt="${titleOf(item)}" class="w-full h-full object-cover group-hover:opacity-80" loading="lazy">
      </div>
      <h3 class="mt-2 text-sm font-semibold line-clamp-2">${titleOf(item)}</h3>
      <p class="text-xs text-gray-400">${yearOf(item)}</p>
    `;
    button.addEventListener('click', () => openModal(item, mediaType));
    return button;
  }

  async function loadRow(containerId, label, path, mediaType = 'movie', params = {}) {
    const container = $(containerId);
    if (!container) return;
    container.innerHTML = `<section><h2 class="text-xl md:text-2xl font-bold mb-3">${label}</h2><div class="py-6 text-gray-500">Loading...</div></section>`;
    try {
      const data = await api(path, { params });
      const rowId = `${containerId}-row`;
      container.innerHTML = `
        <section>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xl md:text-2xl font-bold">${label}</h2>
            <button class="text-sm text-gray-300 hover:text-white">ทั้งหมด</button>
          </div>
          <div id="${rowId}" class="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-4"></div>
        </section>
      `;
      const row = $(rowId);
      (data.results || []).filter((item) => item.poster_path || item.backdrop_path).slice(0, 20).forEach((item) => row.appendChild(card(item, mediaType)));
      container.querySelector('button')?.addEventListener('click', () => openCategory(label, path, mediaType, params));
    } catch (error) {
      container.innerHTML = `<section><h2 class="text-xl md:text-2xl font-bold mb-3">${label}</h2><div class="py-6 text-red-300">${error.message}</div></section>`;
    }
  }

  async function loadHome() {
    try {
      const popular = await api('/movie/popular');
      heroItem = popular.results?.find((item) => item.backdrop_path) || popular.results?.[0];
      if (heroItem) {
        if (heroBackdrop) heroBackdrop.src = backdrop(heroItem.backdrop_path);
        text(heroTitle, titleOf(heroItem));
        text(heroOverview, heroItem.overview || 'No overview available.');
        if (heroMeta) heroMeta.innerHTML = `<span>${yearOf(heroItem)}</span><span>•</span><span class="text-yellow-400">★ ${Number(heroItem.vote_average || 0).toFixed(1)}</span>`;
      }
    } catch (error) {
      text(heroTitle, 'ต้องตั้งค่า TMDB_ACCESS_TOKEN');
      text(heroOverview, 'เพิ่ม Environment Variable ใน Vercel แล้ว Deploy ใหม่');
    }

    const rows = [
      ['coming-soon-movies', 'กำลังจะเข้าฉาย', '/movie/upcoming', 'movie', {}],
      ['trending-movies', 'ยอดนิยม', '/trending/movie/week', 'movie', {}],
      ['top-rated-movies', 'คะแนนสูง', '/movie/top_rated', 'movie', {}],
      ['action-movies', 'Action', '/discover/movie', 'movie', { with_genres: 28, sort_by: 'popularity.desc' }],
      ['adventure-movies', 'Adventure', '/discover/movie', 'movie', { with_genres: 12, sort_by: 'popularity.desc' }],
      ['animation-movies', 'Animation', '/discover/movie', 'movie', { with_genres: 16, sort_by: 'popularity.desc' }],
      ['comedy-movies', 'Comedy', '/discover/movie', 'movie', { with_genres: 35, sort_by: 'popularity.desc' }],
      ['horror-movies', 'Horror', '/discover/movie', 'movie', { with_genres: 27, sort_by: 'popularity.desc' }],
      ['romance-movies', 'Romance', '/discover/movie', 'movie', { with_genres: 10749, sort_by: 'popularity.desc' }],
      ['thriller-movies', 'Thriller', '/discover/movie', 'movie', { with_genres: 53, sort_by: 'popularity.desc' }],
      ['scifi-movies', 'Sci-Fi', '/discover/movie', 'movie', { with_genres: 878, sort_by: 'popularity.desc' }],
      ['fantasy-movies', 'Fantasy', '/discover/movie', 'movie', { with_genres: 14, sort_by: 'popularity.desc' }],
      ['history-movies', 'History', '/discover/movie', 'movie', { with_genres: 36, sort_by: 'popularity.desc' }],
      ['war-movies', 'War', '/discover/movie', 'movie', { with_genres: 10752, sort_by: 'popularity.desc' }]
    ];
    rows.forEach((item) => loadRow(...item));
  }

  async function loadGenres() {
    try {
      const [movie, tv] = await Promise.all([api('/genre/movie/list'), api('/genre/tv/list')]);
      genres.movie = movie.genres || [];
      genres.tv = tv.genres || [];
    } catch (error) {
      genres = { movie: [], tv: [] };
    }
    fillGenres();
    fillYears();
  }

  function fillGenres() {
    if (!searchGenre) return;
    const list = searchType?.value === 'tv' ? genres.tv : genres.movie;
    searchGenre.innerHTML = '<option value="">ทุกหมวดหมู่</option>';
    list.forEach((genre) => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      searchGenre.appendChild(option);
    });
  }

  function fillYears() {
    if (!searchYear) return;
    const now = new Date().getFullYear();
    searchYear.innerHTML = '<option value="">ทุกปี</option>';
    for (let year = now + 1; year >= 1980; year -= 1) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      searchYear.appendChild(option);
    }
  }

  async function openModal(item, mediaType) {
    selectedItem = item;
    selectedType = mediaType;
    show(movieModal);
    text(modalTitle, titleOf(item));
    text(modalOverview, 'Loading...');
    if (modalBackdrop) modalBackdrop.src = backdrop(item.backdrop_path);

    try {
      const details = await api(`/${mediaType}/${item.id}`);
      selectedItem = details;
      text(modalTitle, titleOf(details));
      text(modalReleaseDate, dateOf(details) || '-');
      text(modalRuntime, runtime(details, mediaType));
      text(modalRating, `${Number(details.vote_average || 0).toFixed(1)}/10`);
      text(modalOverview, details.overview || 'No overview available.');
      if (modalBackdrop) modalBackdrop.src = backdrop(details.backdrop_path || item.backdrop_path);
      if (modalGenres) modalGenres.innerHTML = (details.genres || []).map((g) => `<span class="bg-gray-700 text-xs px-2 py-1 rounded">${g.name}</span>`).join('');
    } catch (error) {
      text(modalOverview, error.message);
    }
  }

  function pickVideo(data) {
    const videos = (data.results || []).filter((v) => v.site === 'YouTube' && v.key);
    const types = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'];
    for (const type of types) {
      const official = videos.find((v) => v.type === type && v.official);
      if (official) return official;
      const any = videos.find((v) => v.type === type);
      if (any) return any;
    }
    return videos[0] || null;
  }

  async function findTrailer(mediaType, id) {
    for (const language of ['th-TH', 'en-US']) {
      try {
        const data = await api(`/${mediaType}/${id}/videos`, { language });
        const selected = pickVideo(data);
        if (selected) return selected;
      } catch (error) {}
    }
    return null;
  }

  async function openPlayer(mediaType, id) {
    hide(mainContent);
    show(playerPage);
    hide(movieModal);
    window.scrollTo(0, 0);
    if (location.hash !== `#/player/${mediaType}/${id}`) history.pushState(null, '', `#/player/${mediaType}/${id}`);

    if (youtubeWrapper) youtubeWrapper.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">Loading official preview...</div>';
    text(playerTitle, 'Loading...');

    try {
      const [details, credits, trailer] = await Promise.all([
        api(`/${mediaType}/${id}`),
        api(`/${mediaType}/${id}/credits`).catch(() => ({ cast: [] })),
        findTrailer(mediaType, id)
      ]);

      text(playerTitle, titleOf(details));
      text(playerReleaseDate, dateOf(details) || '-');
      text(playerRuntime, runtime(details, mediaType));
      if (playerRating) playerRating.innerHTML = `<span class="text-yellow-400">★</span><span>${Number(details.vote_average || 0).toFixed(1)}</span>`;
      text(playerOverview, details.overview || 'No overview available.');
      if (playerGenres) playerGenres.innerHTML = (details.genres || []).map((g) => `<span class="bg-gray-800 text-sm px-3 py-1 rounded-full">${g.name}</span>`).join('');

      if (trailer) {
        youtubeWrapper.innerHTML = `<iframe class="w-full h-full rounded-lg" src="https://www.youtube.com/embed/${trailer.key}?rel=0&controls=1&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else {
        youtubeWrapper.innerHTML = `<div class="relative w-full h-full bg-black rounded-lg overflow-hidden"><img src="${backdrop(details.backdrop_path || details.poster_path)}" class="w-full h-full object-cover opacity-60"><div class="absolute inset-0 flex items-center justify-center text-center px-6"><div><p class="text-xl font-bold">ยังไม่มีตัวอย่างอย่างเป็นทางการ</p><p class="text-sm text-gray-300 mt-2">แสดงข้อมูลแทน</p></div></div></div>`;
      }

      if (playerCast) {
        const cast = (credits.cast || []).slice(0, 10);
        playerCast.innerHTML = cast.length ? cast.map((p) => `<div class="text-center"><img src="${poster(p.profile_path)}" class="w-full aspect-[2/3] object-cover rounded-md bg-gray-800"><p class="text-sm font-semibold mt-2 line-clamp-1">${p.name}</p><p class="text-xs text-gray-400 line-clamp-1">${p.character || ''}</p></div>`).join('') : '<p class="text-gray-400 col-span-full">No cast data.</p>';
      }
    } catch (error) {
      text(playerTitle, 'Load failed');
      text(playerOverview, error.message);
      if (youtubeWrapper) youtubeWrapper.innerHTML = `<div class="w-full h-full flex items-center justify-center text-red-300 px-6 text-center">${error.message}</div>`;
    }
  }

  async function openCategory(label, path, mediaType, params) {
    show(categoryModal);
    text(categoryModalTitle, label);
    categoryModalGrid.innerHTML = '<div class="col-span-full py-10 text-center text-gray-400">Loading...</div>';
    try {
      const data = await api(path, { params });
      categoryModalGrid.innerHTML = '';
      (data.results || []).filter((item) => item.poster_path || item.backdrop_path).forEach((item) => categoryModalGrid.appendChild(card(item, mediaType, true)));
    } catch (error) {
      categoryModalGrid.innerHTML = `<div class="col-span-full py-10 text-center text-red-300">${error.message}</div>`;
    }
  }

  async function runSearch() {
    if (!searchGrid) return;
    searchGrid.innerHTML = '<div class="col-span-full py-10 text-center text-gray-400">Loading...</div>';
    const keyword = searchInput?.value.trim() || '';
    const type = searchType?.value || 'multi';
    const genre = searchGenre?.value || '';
    const year = searchYear?.value || '';
    const sort = searchSortBy?.value || 'popularity.desc';
    try {
      let path = '/discover/movie';
      let params = { page: 1, sort_by: sort };
      let fallbackType = 'movie';
      if (keyword) {
        path = type === 'multi' ? '/search/multi' : `/search/${type}`;
        params = { page: 1, query: keyword };
        fallbackType = type === 'tv' ? 'tv' : 'movie';
      } else if (type === 'tv') {
        path = '/discover/tv';
        fallbackType = 'tv';
      }
      if (!keyword && genre) params.with_genres = genre;
      if (!keyword && year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = year;
      const data = await api(path, { params });
      let results = (data.results || []).filter((item) => item.media_type !== 'person' && (item.poster_path || item.backdrop_path));
      if (keyword && genre) results = results.filter((item) => (item.genre_ids || []).includes(Number(genre)));
      if (keyword && year) results = results.filter((item) => yearOf(item) === year);
      searchGrid.innerHTML = '';
      if (!results.length) searchGrid.innerHTML = '<div class="col-span-full py-10 text-center text-gray-400">No results.</div>';
      results.forEach((item) => searchGrid.appendChild(card(item, typeOf(item, fallbackType), true)));
    } catch (error) {
      searchGrid.innerHTML = `<div class="col-span-full py-10 text-center text-red-300">${error.message}</div>`;
    }
  }

  function wire() {
    heroWatchBtn?.addEventListener('click', () => heroItem && openPlayer('movie', heroItem.id));
    heroInfoBtn?.addEventListener('click', () => heroItem && openModal(heroItem, 'movie'));
    modalWatchBtn?.addEventListener('click', () => selectedItem && openPlayer(selectedType, selectedItem.id));
    closeModalBtn?.addEventListener('click', () => hide(movieModal));
    movieModal?.addEventListener('click', (e) => { if (e.target === movieModal) hide(movieModal); });
    backToMainBtn?.addEventListener('click', () => { hide(playerPage); show(mainContent); history.pushState(null, '', '#'); window.scrollTo(0, 0); });
    searchBtn?.addEventListener('click', () => { show(searchModal); runSearch(); });
    closeSearchModalBtn?.addEventListener('click', () => hide(searchModal));
    clearSearchBtn?.addEventListener('click', () => { if (searchInput) searchInput.value = ''; runSearch(); });
    searchInput?.addEventListener('input', () => { clearTimeout(window.__searchTimer); window.__searchTimer = setTimeout(runSearch, 350); });
    searchType?.addEventListener('change', () => { fillGenres(); runSearch(); });
    searchGenre?.addEventListener('change', runSearch);
    searchYear?.addEventListener('change', runSearch);
    searchSortBy?.addEventListener('change', runSearch);
    closeCategoryModalBtn?.addEventListener('click', () => hide(categoryModal));
    categoryModal?.addEventListener('click', (e) => { if (e.target === categoryModal) hide(categoryModal); });
    window.addEventListener('popstate', route);
  }

  function route() {
    const match = location.hash.match(/^#\/player\/(movie|tv)\/(\d+)/);
    if (match) openPlayer(match[1], match[2]);
    else { hide(playerPage); show(mainContent); }
  }

  wire();
  loadGenres();
  loadHome().then(route);
});
