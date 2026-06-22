document.addEventListener('DOMContentLoaded', () => {
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
    const FALLBACK_BACKDROP = 'https://placehold.co/1920x1080/141414/FFFFFF?text=DOFree';
    const FALLBACK_POSTER = 'https://placehold.co/500x750/181818/FFFFFF?text=DOFree';

    const $ = (id) => document.getElementById(id);
    const show = (el) => el && el.classList.remove('hidden');
    const hide = (el) => el && el.classList.add('hidden');
    const setText = (el, value) => {
        if (el) el.textContent = value || '';
    };

    const mainHeader = $('main-header');
    const mainContent = $('main-content');

    const heroSection = {
        backdrop: $('hero-backdrop'),
        title: $('hero-title'),
        overview: $('hero-overview'),
        infoBtn: $('hero-info-btn'),
        watchBtn: $('hero-watch-btn'),
        meta: $('hero-meta')
    };

    const modal = {
        container: $('movie-modal'),
        content: $('modal-content'),
        closeBtn: $('close-modal-btn'),
        backdrop: $('modal-backdrop'),
        title: $('modal-title'),
        releaseDate: $('modal-release-date'),
        runtime: $('modal-runtime'),
        rating: $('modal-rating'),
        overview: $('modal-overview'),
        genres: $('modal-genres'),
        addToListBtn: $('modal-add-list-btn'),
        watchBtn: $('modal-watch-btn')
    };

    const categoryModal = {
        container: $('category-modal'),
        title: $('category-modal-title'),
        grid: $('category-modal-grid'),
        closeBtn: $('close-category-modal-btn')
    };

    const searchModal = {
        container: $('search-modal'),
        closeBtn: $('close-search-modal-btn'),
        form: $('search-form'),
        input: $('search-input'),
        typeSelect: $('search-type'),
        genreSelect: $('search-genre'),
        yearSelect: $('search-year'),
        sortBySelect: $('search-sort-by'),
        grid: $('search-modal-grid'),
        title: $('search-modal-title'),
        clearBtn: $('clear-search-btn')
    };

    const loginModal = {
        container: $('login-modal'),
        closeBtn: $('close-login-modal-btn'),
        socialButtons: document.querySelectorAll('.social-login-btn')
    };

    const notificationModal = {
        container: $('notification-modal'),
        closeBtn: $('close-notification-modal-btn'),
        content: $('notification-content'),
        overlay: $('notification-overlay')
    };

    const alertModal = {
        container: $('alert-modal'),
        title: $('alert-modal-title'),
        body: $('alert-modal-body'),
        closeBtn: $('alert-modal-close-btn')
    };

    const playerPage = {
        section: $('player-page'),
        backBtn: $('back-to-main-btn'),
        container: $('player-container'),
        youtubeWrapper: $('youtube-embed-wrapper'),
        title: $('player-title'),
        releaseDate: $('player-release-date'),
        runtime: $('player-runtime'),
        rating: $('player-rating'),
        genres: $('player-genres'),
        overview: $('player-overview'),
        cast: $('player-cast')
    };

    const premiumModal = {
        container: $('premium-modal'),
        closeBtn: $('close-premium-modal-btn'),
        form: $('premium-form'),
        submitBtn: $('submit-premium-btn'),
        slipUpload: $('slip-upload'),
        slipPreview: $('slip-preview'),
        slipFilename: $('slip-filename'),
        copyBtn: $('copy-account-info-btn'),
        accountNumberText: $('account-number-text')
    };

    const adPlayer = {
        modal: $('ad-player-modal'),
        video: $('ad-video-player'),
        skipBtn: $('skip-ad-btn'),
        skipTimer: $('skip-ad-timer'),
        counter: $('ad-counter'),
        subscribeBtn: $('ad-subscribe-btn')
    };

    const chat = {
        toggleBtn: $('chat-toggle-btn'),
        window: $('chat-window'),
        closeBtn: $('chat-close-btn'),
        messages: $('chat-messages'),
        input: $('chat-input'),
        sendBtn: $('chat-send-btn')
    };

    const bellBtn = $('bell-btn');
    const searchBtn = $('search-btn');
    const loginBtn = $('login-btn');
    const headerPremiumBtn = $('header-premium-btn');
    const premiumSubscribeLink = $('premium-subscribe-link');
    const userProfile = {
        menu: $('user-profile-menu'),
        btn: $('user-profile-btn'),
        dropdown: $('user-profile-dropdown'),
        logoutBtn: $('logout-btn'),
        favoritesLink: $('favorites-link')
    };

    let heroItem = null;
    let heroImageInterval = null;
    let selectedItem = null;
    let selectedMediaType = 'movie';
    let genres = { movie: [], tv: [] };
    let isLoggedIn = localStorage.getItem('dofree_logged_in') === 'true';
    let premiumStatus = localStorage.getItem('dofree_premium_status') || 'none';
    let myFavoriteList = JSON.parse(localStorage.getItem('dofree_favorites') || '[]');
    let pendingPreview = null;
    let currentAdIndex = 0;
    let skipAdInterval = null;
    const activeAutoRows = [];

    const adVideos = [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ];

    const titleOf = (item) => item?.title || item?.name || item?.original_title || item?.original_name || 'Untitled';
    const dateOf = (item) => item?.release_date || item?.first_air_date || '';
    const poster = (path) => path ? `${IMAGE_BASE_URL}w500${path}` : FALLBACK_POSTER;
    const backdrop = (path) => path ? `${IMAGE_BASE_URL}original${path}` : FALLBACK_BACKDROP;
    const mediaTypeOf = (item, fallback = 'movie') => item?.media_type === 'tv' || item?.first_air_date || item?.name ? 'tv' : fallback;

    async function fetchAPI(endpoint, options = {}) {
        const [path, params] = String(endpoint).split('?');
        const query = new URLSearchParams(params || '');
        const url = new URL('/api/tmdb', window.location.origin);
        url.searchParams.set('path', path);
        url.searchParams.set('language', options.language || query.get('language') || 'th-TH');

        query.forEach((value, key) => {
            if (key !== 'language') url.searchParams.set(key, value);
        });

        Object.entries(options.params || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, value);
            }
        });

        try {
            const response = await fetch(url.toString());
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || data.status_message || `HTTP ${response.status}`);
            return data;
        } catch (error) {
            console.error('Fetch API Error:', error);
            return null;
        }
    }

    async function fetchPages(path, params = {}, pages = 3, language = 'th-TH') {
        const calls = [];
        for (let page = 1; page <= pages; page += 1) {
            calls.push(fetchAPI(path, { language, params: { ...params, page } }));
        }
        const results = await Promise.all(calls);
        const map = new Map();
        results.forEach((data) => {
            (data?.results || []).forEach((item) => {
                if (!item?.id) return;
                const key = `${mediaTypeOf(item, path.includes('/tv') ? 'tv' : 'movie')}-${item.id}`;
                if (!map.has(key)) map.set(key, item);
            });
        });
        return Array.from(map.values());
    }

    function formatRuntime(details, mediaType) {
        if (mediaType === 'tv') {
            const seasons = details?.number_of_seasons || 0;
            const episodes = details?.number_of_episodes || 0;
            return seasons ? `${seasons} ซีซัน • ${episodes} ตอน` : '-';
        }
        const minutes = details?.runtime || 0;
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const remain = minutes % 60;
        return hours ? `${hours} ชม. ${remain} นาที` : `${remain} นาที`;
    }

    function safeOverview(value) {
        return value || 'ยังไม่มีเรื่องย่อภาษาไทยสำหรับรายการนี้';
    }

    function showAlert(title, body) {
        setText(alertModal.title, title);
        setText(alertModal.body, body);
        show(alertModal.container);
    }

    function updateAuthUI() {
        if (isLoggedIn) {
            hide(loginBtn);
            show(userProfile.menu);
        } else {
            show(loginBtn);
            hide(userProfile.menu);
            hide(userProfile.dropdown);
        }
    }

    function updatePremiumUI() {
        if (!headerPremiumBtn) return;
        if (premiumStatus === 'active') {
            headerPremiumBtn.textContent = 'Premium Active';
            headerPremiumBtn.classList.remove('bg-amber-500');
            headerPremiumBtn.classList.add('bg-green-500');
        } else if (premiumStatus === 'pending') {
            headerPremiumBtn.textContent = 'รอตรวจสอบ';
        } else {
            headerPremiumBtn.textContent = 'Premium';
        }
    }

    function saveFavorites() {
        localStorage.setItem('dofree_favorites', JSON.stringify(myFavoriteList));
    }

    function isFavorite(id, mediaType) {
        return myFavoriteList.some((item) => String(item.id) === String(id) && item.media_type === mediaType);
    }

    function toggleFavorite(item, mediaType) {
        if (!isLoggedIn) {
            show(loginModal.container);
            return;
        }
        const exists = isFavorite(item.id, mediaType);
        if (exists) {
            myFavoriteList = myFavoriteList.filter((saved) => !(String(saved.id) === String(item.id) && saved.media_type === mediaType));
            showAlert('ลบออกแล้ว', 'นำออกจากรายการโปรดเรียบร้อย');
        } else {
            myFavoriteList.push({
                id: item.id,
                media_type: mediaType,
                title: titleOf(item),
                name: item.name,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                release_date: item.release_date,
                first_air_date: item.first_air_date,
                vote_average: item.vote_average
            });
            showAlert('เพิ่มแล้ว', 'เพิ่มเข้าในรายการโปรดเรียบร้อย');
        }
        saveFavorites();
        updateFavoriteButton(item, mediaType);
    }

    function updateFavoriteButton(item, mediaType) {
        if (!modal.addToListBtn || !item) return;
        modal.addToListBtn.innerHTML = isFavorite(item.id, mediaType)
            ? '✓ อยู่ในรายการโปรด'
            : '<span class="text-xl leading-none">＋</span> รายการโปรด';
    }

    const lazyObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.onload = () => img.classList.remove('opacity-0');
                img.removeAttribute('data-src');
            }
            observer.unobserve(img);
        });
    }, { rootMargin: '0px 0px 300px 0px' }) : null;

    function observeLazyImages(root = document) {
        root.querySelectorAll('img.lazy-load[data-src]').forEach((img) => {
            if (lazyObserver) lazyObserver.observe(img);
            else img.src = img.dataset.src;
        });
    }

    function createCard(item, fallbackType = 'movie', grid = false) {
        const mediaType = mediaTypeOf(item, fallbackType);
        const title = titleOf(item);
        const releaseDate = dateOf(item) ? new Date(dateOf(item)).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : '';
        const wrapper = document.createElement('div');
        wrapper.className = grid ? 'group cursor-pointer' : 'flex-shrink-0 w-40 md:w-52 group cursor-pointer';
        wrapper.dataset.itemId = item.id;
        wrapper.dataset.mediaType = mediaType;
        wrapper.innerHTML = `
            <div class="relative rounded-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300 bg-gray-800 aspect-[2/3] shadow-lg">
                <img data-src="${poster(item.poster_path)}" src="https://placehold.co/500x750/181818/181818?text=+" alt="${title}" class="lazy-load absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500">
                <div class="absolute top-2 left-2 flex items-center gap-2 text-xs font-bold text-white">
                    ${item.vote_average > 0 ? `<div class="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1"><span class="text-yellow-400">★</span><span>${Number(item.vote_average).toFixed(1)}</span></div>` : ''}
                    ${item.original_language ? `<div class="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1"><span>${item.original_language.toUpperCase()}</span></div>` : ''}
                </div>
            </div>
            <div class="mt-2 px-1">
                <h4 class="text-white text-sm font-semibold truncate" title="${title}">${title}</h4>
                <p class="text-gray-400 text-xs">${releaseDate}</p>
            </div>
        `;
        wrapper.addEventListener('click', () => showDetailModal(item.id, mediaType, item));
        observeLazyImages(wrapper);
        return wrapper;
    }

    function startAutoScroll(row) {
        if (!row || row.dataset.autoScrollReady === 'true') return;
        row.dataset.autoScrollReady = 'true';
        let paused = false;
        let direction = 1;
        let timer = null;

        const step = () => {
            if (paused) return;
            const max = row.scrollWidth - row.clientWidth;
            if (max <= 0) return;
            row.scrollLeft += direction;
            if (row.scrollLeft >= max - 2) direction = -1;
            if (row.scrollLeft <= 2) direction = 1;
        };

        timer = setInterval(step, 35);
        row.addEventListener('mouseenter', () => { paused = true; });
        row.addEventListener('mouseleave', () => { paused = false; });
        row.addEventListener('touchstart', () => { paused = true; }, { passive: true });
        row.addEventListener('touchend', () => { setTimeout(() => { paused = false; }, 1200); }, { passive: true });
        activeAutoRows.push(timer);
    }

    function renderRow(title, items, containerId, path, mediaType = 'movie', params = {}) {
        const container = $(containerId);
        if (!container || !items?.length) return;
        const row = document.createElement('div');
        row.className = 'movie-row flex overflow-x-scroll no-scrollbar -mx-4 px-4 py-2 gap-4 scroll-smooth';
        items.filter((item) => item.poster_path || item.backdrop_path).slice(0, 48).forEach((item) => row.appendChild(createCard(item, mediaType)));
        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl md:text-2xl font-bold">${title}</h3>
                <button class="text-sm text-gray-300 hover:text-white">ทั้งหมด</button>
            </div>
        `;
        container.appendChild(row);
        container.querySelector('button')?.addEventListener('click', () => openCategory(title, path, mediaType, params));
        startAutoScroll(row);
    }

    async function loadRow(title, containerId, path, mediaType = 'movie', params = {}) {
        const container = $(containerId);
        if (!container) return;
        container.innerHTML = `<h3 class="text-xl md:text-2xl font-bold mb-4">${title}</h3><div class="py-6 text-gray-500">กำลังโหลด...</div>`;
        const items = await fetchPages(path, params, 3);
        if (!items.length) {
            container.innerHTML = `<h3 class="text-xl md:text-2xl font-bold mb-4">${title}</h3><div class="py-6 text-red-300">โหลดข้อมูลไม่สำเร็จ</div>`;
            return;
        }
        renderRow(title, items, containerId, path, mediaType, params);
    }

    async function updateHeroSection(items) {
        const valid = (items || []).filter((item) => item.backdrop_path);
        heroItem = valid[Math.floor(Math.random() * valid.length)] || items?.[0];
        if (!heroItem) return;
        if (heroImageInterval) clearInterval(heroImageInterval);
        if (heroSection.backdrop) heroSection.backdrop.src = backdrop(heroItem.backdrop_path);
        setText(heroSection.title, titleOf(heroItem));
        setText(heroSection.overview, safeOverview(heroItem.overview));
        const fullDate = dateOf(heroItem) ? new Date(dateOf(heroItem)).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
        if (heroSection.meta) {
            heroSection.meta.innerHTML = `<span class="text-yellow-400">★ ${Number(heroItem.vote_average || 0).toFixed(1)}</span><span>•</span><span>${fullDate}</span><span>•</span><span class="border border-gray-400 px-1.5 rounded text-xs">${(heroItem.original_language || '').toUpperCase()}</span>`;
        }
        if (heroSection.infoBtn) {
            heroSection.infoBtn.dataset.itemId = heroItem.id;
            heroSection.infoBtn.dataset.mediaType = 'movie';
        }
        if (heroSection.watchBtn) {
            heroSection.watchBtn.dataset.itemId = heroItem.id;
            heroSection.watchBtn.dataset.mediaType = 'movie';
        }
        const imagesData = await fetchAPI(`/movie/${heroItem.id}/images`, { language: 'en-US' });
        const backdrops = imagesData?.backdrops || [];
        if (backdrops.length > 1) {
            heroImageInterval = setInterval(() => {
                const random = backdrops[Math.floor(Math.random() * backdrops.length)];
                if (!random?.file_path || !heroSection.backdrop) return;
                heroSection.backdrop.style.opacity = 0;
                setTimeout(() => {
                    heroSection.backdrop.src = backdrop(random.file_path);
                    heroSection.backdrop.style.opacity = 1;
                }, 500);
            }, 7000);
        }
    }

    async function loadHome() {
        const popularItems = await fetchPages('/movie/popular', {}, 2);
        if (popularItems.length) await updateHeroSection(popularItems);
        else {
            setText(heroSection.title, 'โหลดข้อมูลไม่สำเร็จ');
            setText(heroSection.overview, 'ตรวจสอบ TMDB_ACCESS_TOKEN ใน Vercel แล้ว Redeploy ใหม่');
        }
        const rows = [
            ['กำลังจะเข้าฉาย', 'coming-soon-movies', '/movie/upcoming', 'movie', {}],
            ['ยอดนิยม', 'trending-movies', '/trending/movie/week', 'movie', {}],
            ['คะแนนสูง', 'top-rated-movies', '/movie/top_rated', 'movie', {}],
            ['Action', 'action-movies', '/discover/movie', 'movie', { with_genres: 28, sort_by: 'popularity.desc' }],
            ['Adventure', 'adventure-movies', '/discover/movie', 'movie', { with_genres: 12, sort_by: 'popularity.desc' }],
            ['Animation', 'animation-movies', '/discover/movie', 'movie', { with_genres: 16, sort_by: 'popularity.desc' }],
            ['Comedy', 'comedy-movies', '/discover/movie', 'movie', { with_genres: 35, sort_by: 'popularity.desc' }],
            ['Horror', 'horror-movies', '/discover/movie', 'movie', { with_genres: 27, sort_by: 'popularity.desc' }],
            ['Romance', 'romance-movies', '/discover/movie', 'movie', { with_genres: 10749, sort_by: 'popularity.desc' }],
            ['Thriller', 'thriller-movies', '/discover/movie', 'movie', { with_genres: 53, sort_by: 'popularity.desc' }],
            ['Sci-Fi', 'scifi-movies', '/discover/movie', 'movie', { with_genres: 878, sort_by: 'popularity.desc' }],
            ['Fantasy', 'fantasy-movies', '/discover/movie', 'movie', { with_genres: 14, sort_by: 'popularity.desc' }],
            ['History', 'history-movies', '/discover/movie', 'movie', { with_genres: 36, sort_by: 'popularity.desc' }],
            ['War', 'war-movies', '/discover/movie', 'movie', { with_genres: 10752, sort_by: 'popularity.desc' }]
        ];
        rows.forEach((args) => loadRow(...args));
    }

    async function loadGenres() {
        const [movie, tv] = await Promise.all([
            fetchAPI('/genre/movie/list'),
            fetchAPI('/genre/tv/list')
        ]);
        genres.movie = movie?.genres || [];
        genres.tv = tv?.genres || [];
        fillGenres();
        fillYears();
    }

    function fillGenres() {
        if (!searchModal.genreSelect) return;
        const type = searchModal.typeSelect?.value === 'tv' ? 'tv' : 'movie';
        searchModal.genreSelect.innerHTML = '<option value="">ทุกหมวดหมู่</option>';
        genres[type].forEach((genre) => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            searchModal.genreSelect.appendChild(option);
        });
    }

    function fillYears() {
        if (!searchModal.yearSelect) return;
        searchModal.yearSelect.innerHTML = '<option value="">ทุกปี</option>';
        const now = new Date().getFullYear() + 1;
        for (let y = now; y >= 1980; y -= 1) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = y;
            searchModal.yearSelect.appendChild(option);
        }
    }

    function openModalShell() {
        show(modal.container);
        if (modal.content) {
            modal.content.classList.remove('opacity-0', 'scale-95', 'translate-y-4');
            modal.content.classList.add('opacity-100', 'scale-100', 'translate-y-0');
        }
    }

    async function showDetailModal(itemId, mediaType = 'movie', fallbackItem = null) {
        selectedMediaType = mediaType;
        selectedItem = fallbackItem;
        openModalShell();
        setText(modal.title, fallbackItem ? titleOf(fallbackItem) : 'กำลังโหลด...');
        setText(modal.overview, 'กำลังโหลดรายละเอียด...');
        if (modal.backdrop && fallbackItem) modal.backdrop.src = backdrop(fallbackItem.backdrop_path || fallbackItem.poster_path);
        const details = await fetchAPI(`/${mediaType}/${itemId}`);
        if (!details) {
            setText(modal.overview, 'โหลดข้อมูลไม่สำเร็จ');
            return;
        }
        selectedItem = details;
        setText(modal.title, titleOf(details));
        setText(modal.releaseDate, dateOf(details) || '-');
        setText(modal.runtime, formatRuntime(details, mediaType));
        setText(modal.rating, `${Number(details.vote_average || 0).toFixed(1)}/10`);
        setText(modal.overview, safeOverview(details.overview));
        if (modal.backdrop) modal.backdrop.src = backdrop(details.backdrop_path || details.poster_path);
        if (modal.genres) modal.genres.innerHTML = (details.genres || []).map((g) => `<span class="bg-gray-700 text-xs px-2 py-1 rounded">${g.name}</span>`).join('');
        updateFavoriteButton(details, mediaType);
    }

    function closeDetailModal() {
        hide(modal.container);
        if (modal.content) {
            modal.content.classList.add('opacity-0', 'scale-95');
            modal.content.classList.remove('opacity-100', 'scale-100');
        }
    }

    function pickBestVideo(data) {
        const videos = (data?.results || []).filter((v) => v.site === 'YouTube' && v.key);
        const types = ['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes'];
        for (const type of types) {
            const official = videos.find((v) => v.type === type && v.official);
            if (official) return official;
            const any = videos.find((v) => v.type === type);
            if (any) return any;
        }
        return videos[0] || null;
    }

    async function findBestTrailer(mediaType, id) {
        for (const language of ['th-TH', 'en-US']) {
            const data = await fetchAPI(`/${mediaType}/${id}/videos`, { language });
            const selected = pickBestVideo(data);
            if (selected) return selected;
        }
        return null;
    }

    async function openPlayer(mediaType, id) {
        hide(mainContent);
        closeDetailModal();
        show(playerPage.section);
        window.scrollTo(0, 0);
        if (location.hash !== `#/player/${mediaType}/${id}`) history.pushState(null, '', `#/player/${mediaType}/${id}`);
        if (playerPage.youtubeWrapper) playerPage.youtubeWrapper.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">กำลังโหลดตัวอย่าง...</div>';
        setText(playerPage.title, 'กำลังโหลด...');
        const [details, credits, trailer] = await Promise.all([
            fetchAPI(`/${mediaType}/${id}`),
            fetchAPI(`/${mediaType}/${id}/credits`).catch(() => ({ cast: [] })),
            findBestTrailer(mediaType, id)
        ]);
        if (!details) {
            setText(playerPage.title, 'โหลดข้อมูลไม่สำเร็จ');
            if (playerPage.youtubeWrapper) playerPage.youtubeWrapper.innerHTML = '<div class="w-full h-full flex items-center justify-center text-red-300 px-6 text-center">โหลดข้อมูลไม่สำเร็จ</div>';
            return;
        }
        setText(playerPage.title, titleOf(details));
        setText(playerPage.releaseDate, dateOf(details) || '-');
        setText(playerPage.runtime, formatRuntime(details, mediaType));
        if (playerPage.rating) playerPage.rating.innerHTML = `<span class="text-yellow-400">★</span><span>${Number(details.vote_average || 0).toFixed(1)}</span>`;
        setText(playerPage.overview, safeOverview(details.overview));
        if (playerPage.genres) playerPage.genres.innerHTML = (details.genres || []).map((g) => `<span class="bg-gray-800 text-sm px-3 py-1 rounded-full">${g.name}</span>`).join('');
        if (trailer) {
            playerPage.youtubeWrapper.innerHTML = `<iframe class="w-full h-full rounded-lg" src="https://www.youtube.com/embed/${trailer.key}?rel=0&controls=1&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            playerPage.youtubeWrapper.innerHTML = `<div class="relative w-full h-full bg-black rounded-lg overflow-hidden"><img src="${backdrop(details.backdrop_path || details.poster_path)}" class="w-full h-full object-cover opacity-60"><div class="absolute inset-0 flex items-center justify-center text-center px-6"><div><p class="text-xl font-bold">ยังไม่มีตัวอย่างอย่างเป็นทางการ</p><p class="text-sm text-gray-300 mt-2">แสดงข้อมูลภาพยนตร์แทน</p></div></div></div>`;
        }
        const cast = (credits?.cast || []).slice(0, 10);
        if (playerPage.cast) playerPage.cast.innerHTML = cast.length ? cast.map((p) => `<div class="text-center"><img src="${poster(p.profile_path)}" class="w-full aspect-[2/3] object-cover rounded-md bg-gray-800"><p class="text-sm font-semibold mt-2 line-clamp-1">${p.name}</p><p class="text-xs text-gray-400 line-clamp-1">${p.character || ''}</p></div>`).join('') : '<p class="text-gray-400 col-span-full">ยังไม่มีข้อมูลนักแสดง</p>';
    }

    function startPreviewFlow(mediaType, id) {
        if (premiumStatus === 'active') {
            openPlayer(mediaType, id);
            return;
        }
        pendingPreview = { mediaType, id };
        startAdSequence();
    }

    function startAdSequence() {
        if (!adPlayer.modal || !adPlayer.video) {
            if (pendingPreview) openPlayer(pendingPreview.mediaType, pendingPreview.id);
            return;
        }
        currentAdIndex = 0;
        show(adPlayer.modal);
        playNextAd();
    }

    function playNextAd() {
        if (currentAdIndex >= adVideos.length) {
            closeAdAndContinue();
            return;
        }
        if (adPlayer.counter) adPlayer.counter.textContent = `ตัวอย่างสนับสนุน ${currentAdIndex + 1}/${adVideos.length}`;
        adPlayer.video.src = adVideos[currentAdIndex];
        adPlayer.video.currentTime = 0;
        adPlayer.video.play().catch(() => {});
        let seconds = 5;
        adPlayer.skipBtn.disabled = true;
        if (adPlayer.skipTimer) adPlayer.skipTimer.textContent = `(${seconds})`;
        clearInterval(skipAdInterval);
        skipAdInterval = setInterval(() => {
            seconds -= 1;
            if (adPlayer.skipTimer) adPlayer.skipTimer.textContent = seconds > 0 ? `(${seconds})` : '';
            if (seconds <= 0) {
                adPlayer.skipBtn.disabled = false;
                clearInterval(skipAdInterval);
            }
        }, 1000);
    }

    function closeAdAndContinue() {
        clearInterval(skipAdInterval);
        hide(adPlayer.modal);
        if (adPlayer.video) {
            adPlayer.video.pause();
            adPlayer.video.removeAttribute('src');
        }
        if (pendingPreview) {
            const next = pendingPreview;
            pendingPreview = null;
            openPlayer(next.mediaType, next.id);
        }
    }

    async function openCategory(title, path, mediaType = 'movie', params = {}) {
        show(categoryModal.container);
        setText(categoryModal.title, title);
        categoryModal.grid.innerHTML = '<div class="col-span-full py-10 text-gray-400">กำลังโหลด...</div>';
        const items = await fetchPages(path, params, 5);
        categoryModal.grid.innerHTML = '';
        items.filter((item) => item.poster_path || item.backdrop_path).forEach((item) => categoryModal.grid.appendChild(createCard(item, mediaType, true)));
        if (!categoryModal.grid.children.length) categoryModal.grid.innerHTML = '<p class="col-span-full text-gray-400">ไม่พบรายการ</p>';
    }

    async function performSearch() {
        const type = searchModal.typeSelect?.value || 'movie';
        const keyword = searchModal.input?.value?.trim() || '';
        const genre = searchModal.genreSelect?.value || '';
        const year = searchModal.yearSelect?.value || '';
        const sortBy = searchModal.sortBySelect?.value || 'popularity.desc';
        setText(searchModal.title, keyword ? `ผลการค้นหา: ${keyword}` : 'ค้นหาแบบละเอียด');
        searchModal.grid.innerHTML = '<div class="col-span-full py-10 text-gray-400">กำลังค้นหา...</div>';
        let path = keyword ? `/search/${type}` : `/discover/${type}`;
        const params = keyword ? { query: keyword } : { sort_by: sortBy };
        if (genre) params.with_genres = genre;
        if (year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = year;
        const items = await fetchPages(path, params, 3);
        searchModal.grid.innerHTML = '';
        items.filter((item) => item.poster_path || item.backdrop_path).forEach((item) => searchModal.grid.appendChild(createCard(item, type, true)));
        if (!searchModal.grid.children.length) searchModal.grid.innerHTML = '<p class="col-span-full text-gray-400">ไม่พบผลลัพธ์</p>';
    }

    function openFavorites() {
        show(searchModal.container);
        setText(searchModal.title, 'รายการโปรดของฉัน');
        searchModal.grid.innerHTML = '';
        if (!myFavoriteList.length) {
            searchModal.grid.innerHTML = '<p class="col-span-full text-gray-400">ยังไม่มีรายการโปรด</p>';
            return;
        }
        myFavoriteList.forEach((item) => searchModal.grid.appendChild(createCard(item, item.media_type || 'movie', true)));
    }

    function bindEvents() {
        window.addEventListener('scroll', () => {
            if (!mainHeader) return;
            mainHeader.classList.toggle('bg-[#141414]', window.scrollY > 20);
        });

        heroSection.infoBtn?.addEventListener('click', () => {
            if (heroItem) showDetailModal(heroItem.id, 'movie', heroItem);
        });
        heroSection.watchBtn?.addEventListener('click', () => {
            if (heroItem) startPreviewFlow('movie', heroItem.id);
        });

        modal.closeBtn?.addEventListener('click', closeDetailModal);
        modal.container?.addEventListener('click', (event) => {
            if (event.target === modal.container) closeDetailModal();
        });
        modal.addToListBtn?.addEventListener('click', () => selectedItem && toggleFavorite(selectedItem, selectedMediaType));
        modal.watchBtn?.addEventListener('click', () => selectedItem && startPreviewFlow(selectedMediaType, selectedItem.id));

        categoryModal.closeBtn?.addEventListener('click', () => hide(categoryModal.container));
        categoryModal.container?.addEventListener('click', (event) => {
            if (event.target === categoryModal.container) hide(categoryModal.container);
        });

        searchBtn?.addEventListener('click', () => {
            show(searchModal.container);
            performSearch();
        });
        searchModal.closeBtn?.addEventListener('click', () => hide(searchModal.container));
        searchModal.form?.addEventListener('submit', (event) => {
            event.preventDefault();
            performSearch();
        });
        searchModal.typeSelect?.addEventListener('change', () => {
            fillGenres();
            performSearch();
        });
        searchModal.genreSelect?.addEventListener('change', performSearch);
        searchModal.yearSelect?.addEventListener('change', performSearch);
        searchModal.sortBySelect?.addEventListener('change', performSearch);
        searchModal.clearBtn?.addEventListener('click', () => {
            if (searchModal.input) searchModal.input.value = '';
            if (searchModal.genreSelect) searchModal.genreSelect.value = '';
            if (searchModal.yearSelect) searchModal.yearSelect.value = '';
            performSearch();
        });

        loginBtn?.addEventListener('click', () => show(loginModal.container));
        loginModal.closeBtn?.addEventListener('click', () => hide(loginModal.container));
        loginModal.socialButtons?.forEach((btn) => btn.addEventListener('click', () => {
            isLoggedIn = true;
            localStorage.setItem('dofree_logged_in', 'true');
            hide(loginModal.container);
            updateAuthUI();
            showAlert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับกลับสู่ DOFree');
        }));
        userProfile.btn?.addEventListener('click', () => userProfile.dropdown?.classList.toggle('hidden'));
        userProfile.logoutBtn?.addEventListener('click', () => {
            isLoggedIn = false;
            localStorage.removeItem('dofree_logged_in');
            updateAuthUI();
        });
        userProfile.favoritesLink?.addEventListener('click', (event) => {
            event.preventDefault();
            hide(userProfile.dropdown);
            openFavorites();
        });

        headerPremiumBtn?.addEventListener('click', () => show(premiumModal.container));
        premiumSubscribeLink?.addEventListener('click', (event) => {
            event.preventDefault();
            show(premiumModal.container);
        });
        premiumModal.closeBtn?.addEventListener('click', () => hide(premiumModal.container));
        premiumModal.copyBtn?.addEventListener('click', async () => {
            const text = premiumModal.accountNumberText?.textContent || '';
            if (navigator.clipboard && text) await navigator.clipboard.writeText(text);
            showAlert('คัดลอกแล้ว', 'คัดลอกเลขบัญชีเรียบร้อย');
        });
        premiumModal.slipUpload?.addEventListener('change', () => {
            const file = premiumModal.slipUpload.files?.[0];
            if (!file) return;
            setText(premiumModal.slipFilename, file.name);
            if (premiumModal.slipPreview) premiumModal.slipPreview.src = URL.createObjectURL(file);
        });
        premiumModal.form?.addEventListener('submit', (event) => {
            event.preventDefault();
            premiumStatus = 'pending';
            localStorage.setItem('dofree_premium_status', premiumStatus);
            updatePremiumUI();
            hide(premiumModal.container);
            showAlert('ส่งข้อมูลแล้ว', 'ระบบได้รับข้อมูลการสมัคร Premium แล้ว');
        });

        bellBtn?.addEventListener('click', () => {
            if (notificationModal.content) notificationModal.content.innerHTML = '<p class="text-gray-300">ยังไม่มีการแจ้งเตือนใหม่</p>';
            show(notificationModal.container);
        });
        notificationModal.closeBtn?.addEventListener('click', () => hide(notificationModal.container));
        notificationModal.overlay?.addEventListener('click', () => hide(notificationModal.container));
        alertModal.closeBtn?.addEventListener('click', () => hide(alertModal.container));

        adPlayer.skipBtn?.addEventListener('click', () => {
            currentAdIndex += 1;
            playNextAd();
        });
        adPlayer.video?.addEventListener('ended', () => {
            currentAdIndex += 1;
            playNextAd();
        });
        adPlayer.subscribeBtn?.addEventListener('click', () => show(premiumModal.container));

        playerPage.backBtn?.addEventListener('click', () => {
            hide(playerPage.section);
            show(mainContent);
            history.pushState(null, '', '#');
            window.scrollTo(0, 0);
            if (playerPage.youtubeWrapper) playerPage.youtubeWrapper.innerHTML = '';
        });

        chat.toggleBtn?.addEventListener('click', () => chat.window?.classList.toggle('hidden'));
        chat.closeBtn?.addEventListener('click', () => hide(chat.window));
        chat.sendBtn?.addEventListener('click', sendChatMessage);
        chat.input?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') sendChatMessage();
        });

        window.addEventListener('popstate', handleRoute);
    }

    function sendChatMessage() {
        const text = chat.input?.value?.trim();
        if (!text || !chat.messages) return;
        chat.messages.insertAdjacentHTML('beforeend', `<div class="text-right"><span class="inline-block bg-red-600 rounded-lg px-3 py-2 text-sm">${text}</span></div>`);
        chat.input.value = '';
        setTimeout(() => {
            chat.messages.insertAdjacentHTML('beforeend', '<div><span class="inline-block bg-gray-700 rounded-lg px-3 py-2 text-sm">รับเรื่องแล้วครับ ทีมงานจะตรวจสอบให้</span></div>');
            chat.messages.scrollTop = chat.messages.scrollHeight;
        }, 500);
        chat.messages.scrollTop = chat.messages.scrollHeight;
    }

    function handleRoute() {
        const match = location.hash.match(/^#\/player\/(movie|tv)\/(\d+)/);
        if (match) {
            openPlayer(match[1], match[2]);
        } else {
            hide(playerPage.section);
            show(mainContent);
        }
    }

    async function init() {
        updateAuthUI();
        updatePremiumUI();
        bindEvents();
        await loadGenres();
        await loadHome();
        handleRoute();
    }

    init();
});
