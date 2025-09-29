document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ODkwYWEwNjllZmJjOTk4NjBjZDQ1N2JlZjg4ZWQxNCIsIm5iZiI6MTc1ODUyMzY5OC4xNzQsInN1YiI6IjY4ZDBmMTMyY2E3YzE3OTM0YWFjODRmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.cjVaV2wgtP3ULfegMqWy80B-8PvGCavC4imE04IIgBs';
    
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

    let heroImageInterval = null; 
    let areFiltersPopulated = false;
    let myFavoriteList = []; 
    let isDetailModalOpenFromSearch = false;
    let fuse;
    let searchData = [];

    // --- DOM Elements ---
    const mainHeader = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    const heroSection = {
        backdrop: document.getElementById('hero-backdrop'),
        title: document.getElementById('hero-title'),
        overview: document.getElementById('hero-overview'),
        infoBtn: document.getElementById('hero-info-btn'),
        watchBtn: document.getElementById('hero-watch-btn'),
        meta: document.getElementById('hero-meta'),
    };
    const modal = {
        container: document.getElementById('movie-modal'),
        content: document.getElementById('modal-content'),
        closeBtn: document.getElementById('close-modal-btn'),
        backdrop: document.getElementById('modal-backdrop'),
        title: document.getElementById('modal-title'),
        releaseDate: document.getElementById('modal-release-date'),
        runtime: document.getElementById('modal-runtime'),
        rating: document.getElementById('modal-rating'),
        overview: document.getElementById('modal-overview'),
        genres: document.getElementById('modal-genres'),
        addToListBtn: document.getElementById('modal-add-list-btn'),
        watchBtn: document.getElementById('modal-watch-btn')
    };
     const categoryModal = {
        container: document.getElementById('category-modal'),
        title: document.getElementById('category-modal-title'),
        grid: document.getElementById('category-modal-grid'),
        closeBtn: document.getElementById('close-category-modal-btn')
    };
    const searchModal = {
        container: document.getElementById('search-modal'),
        closeBtn: document.getElementById('close-search-modal-btn'),
        form: document.getElementById('search-form'),
        input: document.getElementById('search-input'),
        typeSelect: document.getElementById('search-type'),
        genreSelect: document.getElementById('search-genre'),
        yearSelect: document.getElementById('search-year'),
        sortBySelect: document.getElementById('search-sort-by'),
        grid: document.getElementById('search-modal-grid'),
        title: document.getElementById('search-modal-title'),
        clearBtn: document.getElementById('clear-search-btn'),
    };
    const loginModal = {
        container: document.getElementById('login-modal'),
        closeBtn: document.getElementById('close-login-modal-btn'),
        socialButtons: document.querySelectorAll('.social-login-btn')
    };
    const notificationModal = {
        container: document.getElementById('notification-modal'),
        closeBtn: document.getElementById('close-notification-modal-btn'),
        content: document.getElementById('notification-content'),
        overlay: document.getElementById('notification-overlay'),
    };
     const alertModal = {
        container: document.getElementById('alert-modal'),
        title: document.getElementById('alert-modal-title'),
        body: document.getElementById('alert-modal-body'),
        closeBtn: document.getElementById('alert-modal-close-btn'),
    };
    const playerPage = {
        section: document.getElementById('player-page'),
        backBtn: document.getElementById('back-to-main-btn'),
        container: document.getElementById('player-container'),
        youtubeWrapper: document.getElementById('youtube-embed-wrapper'),
        playBtn: document.getElementById('player-play-btn'),
        title: document.getElementById('player-title'),
        releaseDate: document.getElementById('player-release-date'),
        runtime: document.getElementById('player-runtime'),
        rating: document.getElementById('player-rating'),
        genres: document.getElementById('player-genres'),
        overview: document.getElementById('player-overview'),
        cast: document.getElementById('player-cast'),
    };
    const chat = {
        toggleBtn: document.getElementById('chat-toggle-btn'),
        window: document.getElementById('chat-window'),
        closeBtn: document.getElementById('chat-close-btn'),
        messages: document.getElementById('chat-messages'),
        input: document.getElementById('chat-input'),
        sendBtn: document.getElementById('chat-send-btn')
    };
    const premiumModal = {
        container: document.getElementById('premium-modal'),
        closeBtn: document.getElementById('close-premium-modal-btn'),
        form: document.getElementById('premium-form'),
        submitBtn: document.getElementById('submit-premium-btn'),
        slipUpload: document.getElementById('slip-upload'),
        slipPreview: document.getElementById('slip-preview'),
        slipFilename: document.getElementById('slip-filename'),
        copyBtn: document.getElementById('copy-account-info-btn'),
        accountNumberText: document.getElementById('account-number-text'),
    };
    const premiumSubscribeLink = document.getElementById('premium-subscribe-link');
    const headerPremiumBtn = document.getElementById('header-premium-btn');
    const adPlayer = {
        modal: document.getElementById('ad-player-modal'),
        video: document.getElementById('ad-video-player'),
        skipBtn: document.getElementById('skip-ad-btn'),
        skipTimer: document.getElementById('skip-ad-timer'),
        counter: document.getElementById('ad-counter'),
        subscribeBtn: document.getElementById('ad-subscribe-btn'),
    };
    const bellBtn = document.getElementById('bell-btn');
    const searchBtn = document.getElementById('search-btn');
    const loginBtn = document.getElementById('login-btn');
    const userProfile = {
        menu: document.getElementById('user-profile-menu'),
        btn: document.getElementById('user-profile-btn'),
        dropdown: document.getElementById('user-profile-dropdown'),
        logoutBtn: document.getElementById('logout-btn'),
        favoritesLink: document.getElementById('favorites-link')
    }

    // --- State ---
    let isLoggedIn = false;
    let premiumStatus = 'none'; // 'none', 'pending', 'active'
    let currentAdIndex = 0;
    let skipAdInterval = null;
    const adVideos = [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ];

    // --- Lazy Loading Logic ---
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (!src) return;

                img.src = src;
                img.onload = () => {
                    img.classList.remove('opacity-0');
                };
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: "0px 0px 300px 0px" });

    const observeAllLazyImages = () => {
        const lazyImages = document.querySelectorAll('img.lazy-load[data-src]');
        lazyImages.forEach(img => lazyLoadObserver.observe(img));
    };

    // --- API Fetching ---
    async function fetchAPI(endpoint) {
        const [path, params] = endpoint.split('?');
        const query = new URLSearchParams(params);
        query.set('language', 'th-TH');
        
        const url = `${BASE_URL}${path}?${query.toString()}`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${API_ACCESS_TOKEN}`
            }
        };
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch API Error:', error);
            return null;
        }
    }

    // --- Rendering ---
    function createMovieRow(title, movies, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !movies || movies.length === 0) return;

        const shuffledMovies = [...movies].sort(() => 0.5 - Math.random());

        const moviesHtml = shuffledMovies.map(movie => {
            if (!movie.poster_path) return '';
            
            const cardTopInfo = `
                <div class="absolute top-2 left-2 flex items-center gap-2 text-xs font-bold text-white">
                    ${movie.vote_average > 0 ? `
                        <div class="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>${movie.vote_average.toFixed(1)}</span>
                        </div>
                    ` : ''}
                    ${movie.original_language ? `
                        <div class="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                            <span>${movie.original_language.toUpperCase()}</span>
                        </div>
                    ` : ''}
                </div>
            `;

            const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('th-TH', {
                month: 'short',
                year: 'numeric'
            }) : '';

            return `
                <div class="flex-shrink-0 w-40 md:w-52 group cursor-pointer" data-item-id="${movie.id}" data-media-type="movie">
                    <div class="relative rounded-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300 bg-gray-800 aspect-[2/3]">
                        <img data-src="${IMAGE_BASE_URL}w500${movie.poster_path}" src="https://placehold.co/500x750/181818/181818?text=+" alt="${movie.title}" class="lazy-load absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500">
                        ${cardTopInfo}
                    </div>
                    <div class="mt-2 px-1">
                        <h4 class="text-white text-sm font-semibold truncate" title="${movie.title}">${movie.title}</h4>
                        <p class="text-gray-400 text-xs">${releaseDate}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h3 class="text-xl md:text-2xl font-bold mb-4">${title}</h3>
            <div class="flex overflow-x-scroll no-scrollbar -mx-4 px-4 py-2 gap-4">
                ${moviesHtml}
            </div>
        `;
        
        container.querySelectorAll('[data-item-id]').forEach(poster => {
            poster.addEventListener('click', () => {
                const itemId = poster.dataset.itemId;
                const mediaType = poster.dataset.mediaType;
                showDetailModal(itemId, mediaType);
            });
        });
    }

    async function updateHeroSection(movies) {
        if (!movies || movies.length === 0) return;
        const shuffledMovies = [...movies].sort(() => 0.5 - Math.random());
        const featuredMovie = shuffledMovies[0];
        
        if (heroImageInterval) clearInterval(heroImageInterval);

        heroSection.backdrop.src = `${IMAGE_BASE_URL}original${featuredMovie.backdrop_path}`;
        heroSection.title.textContent = featuredMovie.title;
        heroSection.overview.textContent = featuredMovie.overview;

        const fullReleaseDate = featuredMovie.release_date ? new Date(featuredMovie.release_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
        heroSection.meta.innerHTML = `
            <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>${featuredMovie.vote_average.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>${fullReleaseDate}</span>
            <span>•</span>
            <span class="border border-gray-400 px-1.5 rounded text-xs">${featuredMovie.original_language.toUpperCase()}</span>
        `;

        heroSection.infoBtn.dataset.itemId = featuredMovie.id;
        heroSection.infoBtn.dataset.mediaType = 'movie';
        heroSection.watchBtn.dataset.itemId = featuredMovie.id;
        heroSection.watchBtn.dataset.mediaType = 'movie';

        const imagesData = await fetchAPI(`/movie/${featuredMovie.id}/images`);
        if (imagesData && imagesData.backdrops && imagesData.backdrops.length > 1) {
            startHeroImageRotation(imagesData.backdrops);
        }
    }

    function startHeroImageRotation(backdrops) {
        heroImageInterval = setInterval(() => {
            const randomBackdrop = backdrops[Math.floor(Math.random() * backdrops.length)];
            const newSrc = `${IMAGE_BASE_URL}original${randomBackdrop.file_path}`;

            if (heroSection.backdrop.src !== newSrc) {
                heroSection.backdrop.style.opacity = '0.7';
                setTimeout(() => {
                    heroSection.backdrop.src = newSrc;
                    heroSection.backdrop.style.opacity = '1';
                }, 500);
            }
        }, 7000);
    }
    
    async function showDetailModal(itemId, mediaType) {
        const details = await fetchAPI(`/${mediaType}/${itemId}`);
        if (!details) return;

        const title = details.title || details.name;
        const releaseDate = details.release_date || details.first_air_date;
        const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null);

        modal.backdrop.src = `${IMAGE_BASE_URL}w1280${details.backdrop_path}`;
        modal.title.textContent = title;
        modal.releaseDate.textContent = releaseDate ? new Date(releaseDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        modal.runtime.textContent = runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : '';
        modal.rating.textContent = `คะแนน: ${details.vote_average.toFixed(1)}`;
        modal.overview.textContent = details.overview;
        modal.genres.innerHTML = details.genres.map(g => `<span class="bg-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-red-600 transition-colors" data-genre-id="${g.id}" data-genre-name="${g.name}">${g.name}</span>`).join('');
        
        modal.genres.querySelectorAll('[data-genre-id]').forEach(genreTag => {
            genreTag.addEventListener('click', () => {
                const genreId = genreTag.dataset.genreId;
                const genreName = genreTag.dataset.genreName;
                hideMovieModal();
                setTimeout(() => {
                   showMoviesByGenreModal(genreId, genreName);
                }, 300);
            });
        });
        
        modal.watchBtn.dataset.itemId = details.id;
        modal.watchBtn.dataset.mediaType = mediaType;
        modal.addToListBtn.dataset.itemId = details.id;
        
        updateFavoriteButtonState(details.id);
        
        modal.container.classList.remove('hidden');
        setTimeout(() => {
            modal.container.classList.add('is-visible', 'opacity-100');
        }, 10);
    }

    function hideMovieModal() {
        if (isDetailModalOpenFromSearch) {
            searchModal.container.classList.remove('is-inactive');
            isDetailModalOpenFromSearch = false;
        }
        modal.container.classList.remove('is-visible', 'opacity-100');
        setTimeout(() => {
            modal.container.classList.add('hidden');
        }, 400); 
    }

    function updateFavoriteButtonState(itemId) {
        if (myFavoriteList.includes(String(itemId))) {
            modal.addToListBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                เพิ่มแล้ว
            `;
            modal.addToListBtn.classList.remove('bg-gray-500/70', 'hover:bg-gray-500/50');
            modal.addToListBtn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-700');
        } else {
            modal.addToListBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                รายการโปรด
            `;
            modal.addToListBtn.classList.add('bg-gray-500/70', 'hover:bg-gray-500/50');
            modal.addToListBtn.classList.remove('bg-green-600', 'text-white', 'hover:bg-green-700');
        }
    }
    
    function handleToggleFavorite(event) {
        event.stopPropagation();
        const itemId = modal.addToListBtn.dataset.itemId;
        if (!itemId) return;

        const itemIndex = myFavoriteList.indexOf(itemId);
        if (itemIndex > -1) {
            myFavoriteList.splice(itemIndex, 1);
        } else {
            myFavoriteList.push(itemId);
        }
        
        updateFavoriteButtonState(itemId);
    }

    // --- Category Modal Logic ---
    function createGridItemsHtml(items) {
        if (!items || items.length === 0) return '<p class="text-gray-400 col-span-full text-center">ไม่พบข้อมูล</p>';
        
        return items.map(item => {
            if (!item.poster_path) return '';

            const title = item.title || item.name; 
            const releaseDate = item.release_date || item.first_air_date;
            let mediaType = item.media_type;
            if (!mediaType) {
                mediaType = item.title ? 'movie' : 'tv';
            }

             const cardTopInfo = `
                <div class="absolute top-2 left-2 flex items-center gap-2 text-xs font-bold text-white">
                    ${item.vote_average > 0 ? `
                        <div class="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span>${item.vote_average.toFixed(1)}</span>
                        </div>
                    ` : ''}
                </div>
            `;

            const dateStr = releaseDate ? new Date(releaseDate).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : '';

            return `
                <div class="flex-shrink-0 group cursor-pointer" data-item-id="${item.id}" data-media-type="${mediaType}">
                    <div class="relative rounded-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300 bg-gray-800 aspect-[2/3]">
                        <img data-src="${IMAGE_BASE_URL}w500${item.poster_path}" src="https://placehold.co/500x750/181818/181818?text=+" alt="${title}" class="lazy-load absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500">
                        ${cardTopInfo}
                    </div>
                    <div class="mt-2 px-1">
                        <h4 class="text-white text-sm font-semibold truncate" title="${title}">${title}</h4>
                        <p class="text-gray-400 text-xs">${dateStr}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function hideCategoryModal() {
        categoryModal.container.classList.add('hidden');
    }

    async function showFavoritesModal() {
        if (!isLoggedIn) {
            showLoginModal();
            return;
        }

        categoryModal.title.textContent = 'รายการโปรดของฉัน';
        categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">กำลังโหลดรายการโปรด...</p>`;
        categoryModal.container.classList.remove('hidden');
        userProfile.dropdown.classList.add('hidden');

        if (myFavoriteList.length === 0) {
            categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">คุณยังไม่มีรายการโปรด</p>`;
            return;
        }

        try {
            const favoritePromises = myFavoriteList.map(id => fetchAPI(`/movie/${id}`));
            const favoriteMoviesDetails = await Promise.all(favoritePromises);
            
            const validFavoriteMovies = favoriteMoviesDetails.filter(details => details !== null);

            if (validFavoriteMovies.length > 0) {
                const itemsHtml = createGridItemsHtml(validFavoriteMovies);
                categoryModal.grid.innerHTML = itemsHtml;

                categoryModal.grid.querySelectorAll('[data-item-id]').forEach(poster => {
                    poster.addEventListener('click', () => {
                        const itemId = poster.dataset.itemId;
                        const mediaType = poster.dataset.mediaType;
                        hideCategoryModal();
                        showDetailModal(itemId, mediaType); 
                    });
                });
                observeAllLazyImages();
            } else {
                categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">ไม่สามารถโหลดรายการโปรดได้</p>`;
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
            categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">เกิดข้อผิดพลาดในการโหลดรายการโปรด</p>`;
        }
    }
    
    async function showMoviesByGenreModal(genreId, genreName) {
        categoryModal.title.textContent = `ภาพยนตร์หมวดหมู่: ${genreName}`;
        categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">กำลังโหลดข้อมูล...</p>`;
        categoryModal.container.classList.remove('hidden');

        const data = await fetchAPI(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`);
        if (data && data.results) {
            const itemsHtml = createGridItemsHtml(data.results);
            categoryModal.grid.innerHTML = itemsHtml;

            categoryModal.grid.querySelectorAll('[data-item-id]').forEach(poster => {
                poster.addEventListener('click', () => {
                    const itemId = poster.dataset.itemId;
                    const mediaType = poster.dataset.mediaType;
                    hideCategoryModal();
                    showDetailModal(itemId, mediaType);
                });
            });
            observeAllLazyImages();
        } else {
             categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">ไม่สามารถโหลดข้อมูลได้</p>`;
        }
    }
    
    async function showMoviesByActorModal(actorId, actorName) {
        categoryModal.title.textContent = `ผลงานของ: ${actorName}`;
        categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">กำลังโหลดข้อมูล...</p>`;
        categoryModal.container.classList.remove('hidden');

        const data = await fetchAPI(`/person/${actorId}/movie_credits`);
        if (data && data.cast) {
            const sortedMovies = data.cast.sort((a, b) => b.popularity - a.popularity);
            const itemsHtml = createGridItemsHtml(sortedMovies);
            categoryModal.grid.innerHTML = itemsHtml;

            categoryModal.grid.querySelectorAll('[data-item-id]').forEach(poster => {
                poster.addEventListener('click', () => {
                    const itemId = poster.dataset.itemId;
                    hideCategoryModal();
                    showDetailModal(itemId, 'movie');
                });
            });
            observeAllLazyImages();
        } else {
             categoryModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">ไม่สามารถโหลดข้อมูลผลงานได้</p>`;
        }
    }
    
    // --- Carousel Logic ---
    function initCarousel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const scrollContainer = container.querySelector('.overflow-x-scroll');
        if (!scrollContainer) return;

        const originalItems = Array.from(scrollContainer.children);
        if (originalItems.length === 0) return;
        originalItems.forEach(item => {
            scrollContainer.appendChild(item.cloneNode(true));
        });
        
        scrollContainer.style.width = 'fit-content'; 
        scrollContainer.classList.remove('overflow-x-scroll', 'no-scrollbar'); 

        const wrapper = document.createElement('div');
        wrapper.classList.add('overflow-hidden'); 
        scrollContainer.parentNode.insertBefore(wrapper, scrollContainer);
        wrapper.appendChild(scrollContainer);

        scrollContainer.classList.add('auto-carousel');

        const itemCount = originalItems.length;
        const duration = itemCount * 4;
        scrollContainer.style.animationDuration = `${duration}s`;

        wrapper.addEventListener('mouseenter', () => {
            scrollContainer.style.animationPlayState = 'paused';
        });

        wrapper.addEventListener('mouseleave', () => {
            scrollContainer.style.animationPlayState = 'running';
        });
    }

    // --- ROUTING LOGIC ---
    function router() {
        const path = window.location.hash.slice(1);
        if (path.startsWith('/player/')) {
            const [, , mediaType, itemId] = path.split('/');
            showPlayerPage(itemId, mediaType);
        } else {
            showMainPage();
            if (!document.getElementById('trending-movies').innerHTML) {
                 loadMainPageContent();
            }
        }
    }

    function showMainPage() {
        mainContent.classList.remove('hidden');
        playerPage.section.classList.add('hidden');
        if (document.getElementById('youtube-player')) {
            playerPage.youtubeWrapper.innerHTML = '';
        }
    }
    
    // --- Search Modal Logic ---
    async function initializeSearch() {
        // Fetch a broad set of data for client-side searching
        const moviePages = [1, 2, 3, 4, 5].map(page => fetchAPI(`/movie/popular?page=${page}`));
        const tvPages = [1, 2, 3, 4, 5].map(page => fetchAPI(`/tv/popular?page=${page}`));

        const allData = await Promise.all([...moviePages, ...tvPages]);
        
        searchData = allData.flatMap(data => data ? data.results : []).filter(item => item.title || item.name);
        
        searchData.forEach(item => {
            item.media_type = item.title ? 'movie' : 'tv';
        });

        const options = {
            includeScore: true,
            threshold: 0.4,
            keys: ['title', 'name', 'overview', 'original_title', 'original_name']
        };
        fuse = new Fuse(searchData, options);
        performSearch(); // Perform initial search after data is loaded
    }
    
    async function populateSearchFilters() {
        if (areFiltersPopulated) return;
        initializeSearch(); // Initialize Fuse.js and perform initial search
        const [movieGenres, tvGenres] = await Promise.all([
            fetchAPI('/genre/movie/list'),
            fetchAPI('/genre/tv/list')
        ]);
        const genres = { movie: movieGenres?.genres || [], tv: tvGenres?.genres || [] };

        function updateGenreOptions() {
            const type = searchModal.typeSelect.value;
            const genreList = type === 'multi' ? [...genres.movie, ...genres.tv] : genres[type];
            const uniqueGenres = [...new Map(genreList.map(item => [item['id'], item])).values()];
            
            const genreOptions = uniqueGenres.map(genre => `<option value="${genre.id}">${genre.name}</option>`).join('');
            searchModal.genreSelect.innerHTML = `<option value="">ทุกหมวดหมู่</option>${genreOptions}`;
        }

        updateGenreOptions();
        searchModal.typeSelect.addEventListener('change', updateGenreOptions);

        const currentYear = new Date().getFullYear();
        let yearOptions = '';
        for (let year = currentYear; year >= 1950; year--) {
            yearOptions += `<option value="${year}">${year}</option>`;
        }
        searchModal.yearSelect.innerHTML += yearOptions;
        areFiltersPopulated = true;
    }


    function showSearchModal() {
        searchModal.container.classList.remove('hidden');
        if (!areFiltersPopulated) {
            populateSearchFilters();
        } else {
            performSearch();
        }
    }

    function hideSearchModal() {
        if (isDetailModalOpenFromSearch) {
            hideMovieModal();
        }
        searchModal.container.classList.add('hidden');
        searchModal.container.classList.remove('is-inactive');
    }
    
    function showLoginModal() {
        loginModal.container.classList.remove('hidden');
    }

    function hideLoginModal() {
        loginModal.container.classList.add('hidden');
    }

    function showAlert(title, message) {
        alertModal.title.textContent = title;
        alertModal.body.innerHTML = message;
        alertModal.container.classList.remove('hidden');
    }

    function hideAlertModal() {
        alertModal.container.classList.add('hidden');
    }
    
    function showNotificationModal() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
        notificationModal.content.innerHTML = `
            <div class="border-l-4 border-amber-400 pl-4 py-2">
                <p class="font-semibold">ฟีเจอร์ใหม่เร็วๆ นี้!</p>
                <p class="text-sm text-gray-300">ดูวีดีโอ Exclusive แบบไม่มีโฆษณา</p>
                <p class="text-xs text-gray-500 mt-2">${dateString}, ${timeString}</p>
            </div>
        `;
        notificationModal.container.classList.remove('hidden');
    }
    
    function hideNotificationModal() {
        notificationModal.container.classList.add('hidden');
    }

    function handleLogin() {
        isLoggedIn = true;
        hideLoginModal();
        updateLoginState();
    }

    function handleLogout() {
        isLoggedIn = false;
        premiumStatus = 'none';
        userProfile.dropdown.classList.add('hidden');
        updateLoginState();
    }

    function updateLoginState() {
        if(isLoggedIn) {
            loginBtn.classList.add('hidden');
            userProfile.menu.classList.remove('hidden');
            premiumSubscribeLink.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            userProfile.menu.classList.add('hidden');
            premiumSubscribeLink.classList.add('hidden');
        }
        updatePremiumButtonState();
    }


    async function performSearch() {
        const query = searchModal.input.value.trim().toLowerCase();
        const type = searchModal.typeSelect.value;
        const genreId = searchModal.genreSelect.value;
        const year = searchModal.yearSelect.value;
        const sortBy = searchModal.sortBySelect.value;
        
        searchModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">กำลังค้นหา...</p>`;
        
        let filteredData = searchData;

        if (query && fuse) {
            const fuseResults = fuse.search(query);
            filteredData = fuseResults.map(result => result.item);
        }

        if (type !== 'multi') {
            filteredData = filteredData.filter(item => {
                return item.media_type === type;
            });
        }
        if (genreId) {
            filteredData = filteredData.filter(item => item.genre_ids && item.genre_ids.includes(parseInt(genreId)));
        }
        if (year) {
            filteredData = filteredData.filter(item => {
                const releaseDate = item.release_date || item.first_air_date;
                return releaseDate && releaseDate.startsWith(year);
            });
        }
        
        // Sorting logic
        filteredData.sort((a, b) => {
            switch(sortBy) {
                case 'popularity.desc': return b.popularity - a.popularity;
                case 'vote_average.desc': return b.vote_average - a.vote_average;
                case 'release_date.desc': return new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date);
                case 'release_date.asc': return new Date(a.release_date || a.first_air_date) - new Date(b.release_date || b.first_air_date);
                case 'original_title.asc': return (a.title || a.name).localeCompare(b.title || b.name);
                case 'original_title.desc': return (b.title || b.name).localeCompare(a.title || a.name);
                default: return 0;
            }
        });

        if (filteredData.length > 0) {
            const itemsHtml = createGridItemsHtml(filteredData);
            searchModal.grid.innerHTML = itemsHtml;
            searchModal.grid.querySelectorAll('[data-item-id]').forEach(poster => {
                poster.addEventListener('click', () => {
                    const itemId = poster.dataset.itemId;
                    const mediaType = poster.dataset.mediaType;
                    isDetailModalOpenFromSearch = true;
                    searchModal.container.classList.add('is-inactive');
                    showDetailModal(itemId, mediaType); 
                });
            });
            observeAllLazyImages();
        } else {
            searchModal.grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-lg">ไม่พบผลลัพธ์ที่ตรงกัน</p>`;
        }
    }


    async function showPlayerPage(itemId, mediaType) {
        mainContent.classList.add('hidden');
        playerPage.section.classList.remove('hidden');
        window.scrollTo(0, 0);

        const [details, videos, credits] = await Promise.all([
            fetchAPI(`/${mediaType}/${itemId}`),
            fetchAPI(`/${mediaType}/${itemId}/videos`),
            fetchAPI(`/${mediaType}/${itemId}/credits`)
        ]);

        if (!details) {
            playerPage.title.textContent = "ไม่พบข้อมูล";
            playerPage.container.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>`;
            return;
        }
        
        const title = details.title || details.name;
        const releaseDate = details.release_date || details.first_air_date;
        const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null);

        playerPage.title.textContent = title;
        playerPage.overview.textContent = details.overview;
        playerPage.releaseDate.textContent = releaseDate ? new Date(releaseDate).toLocaleDateString('th-TH', { year: 'numeric' }) : '';
        playerPage.runtime.textContent = runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : '';
        
        playerPage.genres.innerHTML = details.genres.map(g => `<span class="bg-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-red-600 transition-colors" data-genre-id="${g.id}" data-genre-name="${g.name}">${g.name}</span>`).join('');
        playerPage.genres.querySelectorAll('[data-genre-id]').forEach(genreTag => {
            genreTag.addEventListener('click', () => {
                const genreId = genreTag.dataset.genreId;
                const genreName = genreTag.dataset.genreName;
                showMoviesByGenreModal(genreId, genreName);
            });
        });

        playerPage.rating.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-white font-bold">${details.vote_average.toFixed(1)}</span>`;

        if (credits && credits.cast) {
            const castHtml = credits.cast.slice(0, 10).map(actor => {
                const profilePic = actor.profile_path ? `${IMAGE_BASE_URL}w185${actor.profile_path}` : 'https://placehold.co/185x278/334155/FFFFFF?text=?';
                return `
                    <div class="text-center group cursor-pointer" data-actor-id="${actor.id}" data-actor-name="${actor.name}">
                        <div class="overflow-hidden rounded-lg mb-2">
                             <img src="${profilePic}" alt="${actor.name}" class="w-full object-cover aspect-[2/3] transform group-hover:scale-110 transition-transform duration-300">
                        </div>
                        <p class="font-semibold text-white text-sm">${actor.name}</p>
                        <p class="text-gray-400 text-xs">${actor.character}</p>
                    </div>`;
            }).join('');
            playerPage.cast.innerHTML = castHtml;
            
            playerPage.cast.querySelectorAll('[data-actor-id]').forEach(actorCard => {
                actorCard.addEventListener('click', () => {
                    const actorId = actorCard.dataset.actorId;
                    const actorName = actorCard.dataset.actorName;
                    showMoviesByActorModal(actorId, actorName);
                });
            });
        }

        const trailer = videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            const embedUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&controls=1&showinfo=0&modestbranding=1`;
            playerPage.youtubeWrapper.innerHTML = `<iframe id="youtube-player" class="w-full h-full rounded-lg" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            playerPage.youtubeWrapper.innerHTML = `<img src="${IMAGE_BASE_URL}original${details.backdrop_path}" class="w-full h-full object-cover rounded-lg">`;
        }
    }
    
    // --- Premium Modal Logic ---
    function showPremiumModal() {
        updatePremiumButtonState();
        premiumModal.container.classList.remove('hidden');
    }

    function hidePremiumModal() {
        premiumModal.container.classList.add('hidden');
    }

    function updatePremiumButtonState() {
        if (premiumStatus === 'pending') {
            premiumModal.submitBtn.disabled = true;
            premiumModal.submitBtn.textContent = 'รอการอนุมัติ';
            premiumSubscribeLink.innerHTML = `⭐ สถานะ: รออนุมัติ`;
            premiumSubscribeLink.classList.add('text-yellow-500');
            premiumSubscribeLink.classList.remove('text-amber-400');
        } else if (premiumStatus === 'active') {
            premiumModal.submitBtn.disabled = true;
            premiumModal.submitBtn.textContent = 'คุณเป็นสมาชิก Premium แล้ว';
             premiumSubscribeLink.innerHTML = `⭐ สมาชิก Premium`;
             premiumSubscribeLink.classList.add('text-green-400');
             premiumSubscribeLink.classList.remove('text-amber-400', 'text-yellow-500');
        } else { // 'none'
            premiumModal.submitBtn.disabled = false;
            premiumModal.submitBtn.textContent = 'ยืนยันการชำระเงิน';
            premiumSubscribeLink.innerHTML = `⭐ สมัคร Premium`;
            premiumSubscribeLink.classList.remove('text-yellow-500', 'text-green-400');
            premiumSubscribeLink.classList.add('text-amber-400');
        }
    }

    function handlePremiumSubmit(e) {
        e.preventDefault();
        if (premiumModal.slipUpload.files.length === 0) {
            showAlert('เกิดข้อผิดพลาด', 'กรุณาแนบสลิปการโอนเงิน');
            return;
        }
        premiumStatus = 'pending';
        updatePremiumButtonState();
        hidePremiumModal();
        showAlert('แจ้งปัญหา', 'หากพบปัญหาการชำระเงิน กรุณาติดต่อ <a href="https://line.me/R/ti/p/@638iagag" target="_blank" class="text-green-400 font-bold underline hover:text-green-300">LINE Official</a> ของเรา');
    }

    function handleSlipUploadChange(e) {
        const file = e.target.files[0];
        if (file) {
            premiumModal.slipFilename.textContent = file.name;
            premiumModal.slipPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Slip preview" class="h-28 w-auto object-contain">`;
        } else {
            premiumModal.slipFilename.textContent = '';
            premiumModal.slipPreview.innerHTML = `
               <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               <p class="text-sm text-gray-400 mt-1">คลิกเพื่ออัปโหลด</p>
            `;
        }
    }

    function copyAccountInfo() {
        const textToCopy = premiumModal.accountNumberText.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalIcon = premiumModal.copyBtn.innerHTML;
            premiumModal.copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`;
            setTimeout(() => {
                premiumModal.copyBtn.innerHTML = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }


    // --- Ad Player Logic ---
    function startAdSequence(targetItemId, targetMediaType) {
        if (premiumStatus === 'active') {
            hideAdPlayer();
            window.location.hash = `#/player/${targetMediaType}/${targetItemId}`;
            return;
        }
        
        currentAdIndex = 0;
        adPlayer.modal.classList.remove('hidden');
        adPlayer.modal.dataset.targetItemId = targetItemId;
        adPlayer.modal.dataset.targetMediaType = targetMediaType;
        playNextAd();
    }

    function playNextAd() {
        if (skipAdInterval) clearInterval(skipAdInterval);
        
        if (currentAdIndex >= adVideos.length) {
            hideAdPlayerAndPlayContent();
            return;
        }

        adPlayer.counter.textContent = `โฆษณา ${currentAdIndex + 1} จาก ${adVideos.length}`;
        adPlayer.video.src = adVideos[currentAdIndex];
        adPlayer.video.play();
        
        let countdown = 3;
        adPlayer.skipBtn.disabled = true;
        adPlayer.skipTimer.textContent = `(${countdown})`;

        skipAdInterval = setInterval(() => {
            countdown--;
            adPlayer.skipTimer.textContent = `(${countdown})`;
            if (countdown <= 0) {
                clearInterval(skipAdInterval);
                adPlayer.skipBtn.disabled = false;
                adPlayer.skipTimer.textContent = '';
            }
        }, 1000);

        currentAdIndex++;
    }

    function hideAdPlayer() {
        adPlayer.modal.classList.add('hidden');
        adPlayer.video.pause();
        adPlayer.video.src = '';
        if (skipAdInterval) clearInterval(skipAdInterval);
    }

    function hideAdPlayerAndPlayContent() {
        hideAdPlayer();
        const itemId = adPlayer.modal.dataset.targetItemId;
        const mediaType = adPlayer.modal.dataset.targetMediaType;
        if (itemId && mediaType) {
            window.location.hash = `#/player/${mediaType}/${itemId}`;
        }
    }


    // --- Event Listeners ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    window.addEventListener('scroll', () => {
        mainHeader.classList.toggle('bg-black', window.scrollY > 50);
        mainHeader.classList.toggle('bg-opacity-80', window.scrollY > 50);
        mainHeader.classList.toggle('backdrop-blur-sm', window.scrollY > 50);
    });
    heroSection.infoBtn.addEventListener('click', () => {
        const itemId = heroSection.infoBtn.dataset.itemId;
        const mediaType = heroSection.infoBtn.dataset.mediaType;
        if (itemId) showDetailModal(itemId, mediaType);
    });
    heroSection.watchBtn.addEventListener('click', () => {
        const itemId = heroSection.watchBtn.dataset.itemId;
        const mediaType = heroSection.watchBtn.dataset.mediaType;
        if (itemId) {
            if (isLoggedIn && premiumStatus !== 'active') {
                startAdSequence(itemId, mediaType);
            } else {
                window.location.hash = `#/player/${mediaType}/${itemId}`;
            }
        }
    });
    headerPremiumBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            showPremiumModal();
        } else {
            showLoginModal();
        }
    });

    modal.closeBtn.addEventListener('click', hideMovieModal);
    modal.container.addEventListener('click', (e) => { if (e.target === modal.container) hideMovieModal(); });

    modal.addToListBtn.addEventListener('click', handleToggleFavorite);

    modal.watchBtn.addEventListener('click', () => {
        const itemId = modal.watchBtn.dataset.itemId;
        const mediaType = modal.watchBtn.dataset.mediaType;
        if (itemId) {
            if(isDetailModalOpenFromSearch) {
                hideSearchModal();
            }
            hideMovieModal();
            if (isLoggedIn && premiumStatus !== 'active') {
                startAdSequence(itemId, mediaType);
            } else {
                window.location.hash = `#/player/${mediaType}/${itemId}`;
            }
        }
    });
    playerPage.backBtn.addEventListener('click', () => { window.location.hash = '#'; });
    
    categoryModal.closeBtn.addEventListener('click', hideCategoryModal);
    categoryModal.container.addEventListener('click', (e) => { if (e.target === categoryModal.container) hideCategoryModal(); });
    
    searchBtn.addEventListener('click', showSearchModal);
    searchModal.closeBtn.addEventListener('click', hideSearchModal);
    searchModal.form.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });

    searchModal.input.addEventListener('input', debounce(performSearch, 500));
    const searchRelatedElements = [searchModal.typeSelect, searchModal.genreSelect, searchModal.yearSelect, searchModal.sortBySelect];
    searchRelatedElements.forEach(el => el.addEventListener('change', performSearch));
    
    searchModal.clearBtn.addEventListener('click', () => {
        searchModal.form.reset();
        searchModal.grid.innerHTML = '';
        searchModal.input.focus();
        performSearch();
    });
    
    loginBtn.addEventListener('click', showLoginModal);
    loginModal.closeBtn.addEventListener('click', hideLoginModal);
    loginModal.container.addEventListener('click', (e) => { if (e.target === loginModal.container) hideLoginModal(); });
    loginModal.socialButtons.forEach(btn => btn.addEventListener('click', handleLogin));
    
    bellBtn.addEventListener('click', showNotificationModal);
    notificationModal.closeBtn.addEventListener('click', hideNotificationModal);
    notificationModal.overlay.addEventListener('click', hideNotificationModal);

    alertModal.closeBtn.addEventListener('click', hideAlertModal);
    
    userProfile.logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    userProfile.btn.addEventListener('click', () => {
        userProfile.dropdown.classList.toggle('hidden');
        userProfile.btn.querySelector('svg').classList.toggle('rotate-180');
    });
    
    userProfile.favoritesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFavoritesModal();
    });
    
    window.addEventListener('click', (e) => {
        if (!userProfile.menu.contains(e.target)) {
            userProfile.dropdown.classList.add('hidden');
            userProfile.btn.querySelector('svg').classList.remove('rotate-180');
        }
    });
    
    premiumSubscribeLink.addEventListener('click', (e) => {
        e.preventDefault();
        if(premiumStatus !== 'active') { 
           showPremiumModal();
        }
        userProfile.dropdown.classList.add('hidden');
    });

    premiumModal.closeBtn.addEventListener('click', hidePremiumModal);
    premiumModal.container.addEventListener('click', (e) => { if (e.target === premiumModal.container) hidePremiumModal(); });
    premiumModal.form.addEventListener('submit', handlePremiumSubmit);
    premiumModal.slipUpload.addEventListener('change', handleSlipUploadChange);
    premiumModal.copyBtn.addEventListener('click', copyAccountInfo);

    adPlayer.video.addEventListener('ended', playNextAd);
    adPlayer.skipBtn.addEventListener('click', playNextAd);
    adPlayer.subscribeBtn.addEventListener('click', () => {
        hideAdPlayer();
        showPremiumModal();
    });

    function toggleChatWindow() {
        if (chat.window.classList.contains('hidden')) {
            chat.window.classList.remove('hidden');
            setTimeout(() => chat.window.classList.remove('opacity-0', 'translate-y-4'), 10);
            if(chat.messages.children.length === 0) {
                const welcomeMessage = `สวัสดีครับ! มีอะไรให้ช่วยไหมครับ? <br>หรือติดต่อเร่งด่วนผ่าน <a href="https://line.me/R/ti/p/@638iagag" target="_blank" class="text-green-400 font-bold underline hover:text-green-300">LINE Official</a> ของเรา`;
                addMessage('admin', welcomeMessage);
            }
        } else {
            chat.window.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => chat.window.classList.add('hidden'), 300);
        }
    }

    function addMessage(sender, text) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `flex flex-col ${sender === 'user' ? 'items-end' : 'items-start'}`;
        const messageBubble = document.createElement('div');
        messageBubble.className = `p-2 rounded-lg max-w-[80%] text-sm ${sender === 'user' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'}`;
        messageBubble.innerHTML = text;
        const messageFooter = document.createElement('div');
        messageFooter.className = `flex items-center gap-2 mt-1 ${sender === 'user' ? 'justify-end' : ''}`;
        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-400';
        timestamp.textContent = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        messageFooter.appendChild(timestamp);
        if (sender === 'user') {
            const statusIcon = document.createElement('div');
            statusIcon.className = 'message-status text-gray-400';
            statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
            messageFooter.appendChild(statusIcon);
        }
        messageWrapper.appendChild(messageBubble);
        messageWrapper.appendChild(messageFooter);
        chat.messages.appendChild(messageWrapper);
        chat.messages.scrollTop = chat.messages.scrollHeight;
        return messageWrapper;
    }

    function sendMessage() {
        const text = chat.input.value.trim();
        if (text) {
            const userMessage = addMessage('user', text);
            chat.input.value = '';
            setTimeout(() => {
                const statusIcon = userMessage.querySelector('.message-status');
                if (statusIcon) {
                    statusIcon.className = 'message-status text-blue-400';
                    statusIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6-4l-6.5 6.5" /></svg>`;
                }
            }, 1000);
            setTimeout(() => addMessage('admin', 'ได้รับข้อความของคุณแล้วครับ กำลังตรวจสอบสักครู่'), 1500);
        }
    }

    chat.toggleBtn.addEventListener('click', toggleChatWindow);
    chat.closeBtn.addEventListener('click', toggleChatWindow);
    chat.sendBtn.addEventListener('click', sendMessage);
    chat.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    async function loadMainPageContent() {
        const [
            upcomingData, trendingData, topRatedData, actionData, comedyData, romanceData,
            adventureData, animationData, horrorData, thrillerData, scifiData, fantasyData, historyData, warData
        ] = await Promise.all([
            fetchAPI('/discover/movie?primary_release_date.gte=2025-10-01&sort_by=popularity.desc'),
            fetchAPI('/trending/movie/week'),
            fetchAPI('/movie/top_rated'),
            fetchAPI('/discover/movie?with_genres=28'),
            fetchAPI('/discover/movie?with_genres=12'),
            fetchAPI('/discover/movie?with_genres=16'),
            fetchAPI('/discover/movie?with_genres=35'),
            fetchAPI('/discover/movie?with_genres=27'),
            fetchAPI('/discover/movie?with_genres=10749'),
            fetchAPI('/discover/movie?with_genres=53'),
            fetchAPI('/discover/movie?with_genres=878'),
            fetchAPI('/discover/movie?with_genres=14'),
            fetchAPI('/discover/movie?with_genres=36'),
            fetchAPI('/discover/movie?with_genres=10752')
        ]);

        if (trendingData?.results) updateHeroSection(trendingData.results);
        if (upcomingData?.results) {
            createMovieRow('เร็วๆ นี้', upcomingData.results, 'coming-soon-movies');
            initCarousel('coming-soon-movies');
        }
        if (trendingData?.results) createMovieRow('กำลังฮิต', trendingData.results, 'trending-movies');
        if (topRatedData?.results) createMovieRow('คะแนนสูงสุด', topRatedData.results, 'top-rated-movies');
        if (actionData?.results) createMovieRow('แอ็คชั่น', actionData.results, 'action-movies');
        if (adventureData?.results) createMovieRow('ผจญภัย', adventureData.results, 'adventure-movies');
        if (animationData?.results) createMovieRow('แอนิเมชั่น', animationData.results, 'animation-movies');
        if (comedyData?.results) createMovieRow('คอมเมดี้', comedyData.results, 'comedy-movies');
        if (horrorData?.results) createMovieRow('สยองขวัญ', horrorData.results, 'horror-movies');
        if (romanceData?.results) createMovieRow('โรแมนติก', romanceData.results, 'romance-movies');
        if (thrillerData?.results) createMovieRow('ระทึกขวัญ', thrillerData.results, 'thriller-movies');
        if (scifiData?.results) createMovieRow('วิทยาศาสตร์', scifiData.results, 'scifi-movies');
        if (fantasyData?.results) createMovieRow('แฟนตาซี', fantasyData.results, 'fantasy-movies');
        if (historyData?.results) createMovieRow('ประวัติศาสตร์', historyData.results, 'history-movies');
        if (warData?.results) createMovieRow('สงคราม', warData.results, 'war-movies');
        
        observeAllLazyImages();
    }

    // --- Initializer ---
    premiumSubscribeLink.classList.add('hidden');
    updatePremiumButtonState();
    window.addEventListener('hashchange', router);
    router();
});
