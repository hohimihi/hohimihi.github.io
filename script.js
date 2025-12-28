/* =====================================================
   HOHIMIHI PORTFOLIO - JAVASCRIPT
   ===================================================== */

const CONFIG = {
    games: [
        { placeId: "130967462823996", role: "Owner" },
        { placeId: "14958096162", role: "Head Developer" },
        { placeId: "13421499226", role: "Developer" }
    ],

    reviews: [
        {
            text: "Delivered exactly what was promised. Clean code, on time, and great communication throughout the project. Would definitely hire again.",
            name: "RiftGaming",
            role: "Game Owner",
            initial: "R"
        },
        {
            text: "Helped optimize our game's performance significantly. Scripts are clean and well-documented. Highly recommended.",
            name: "DevStudio",
            role: "Dev Team Lead",
            initial: "D"
        },
        {
            text: "Professional and skilled developer. Took our concept and brought it to life exactly how we envisioned it.",
            name: "PixelForge",
            role: "Studio Owner",
            initial: "P"
        }
    ],

    collaborations: [
        {
            name: "Flamingo",
            subscribers: "14.2M",
            project: "Trolling Event",
            channelUrl: "https://www.youtube.com/@flamingo",
            avatar: "https://yt3.ggpht.com/ytc/AIdro_kAFDQr9bXzOyaLsNXQn4Y7IXUhbSO6E7gNdqYNymh_Rg=s800-c-k-c0x00ffffff-no-rj"
        },
        {
            name: "WaffleTrades",
            subscribers: "379K",
            project: "UGC Event",
            channelUrl: "https://www.youtube.com/@WaffleTrades",
            avatar: "https://yt3.ggpht.com/mKth_FwPnBKllPFyC7groU3YhRB2gwmvTsLMwZ6R9lb8qOeS8x2LBKV-v_Vppx6VNJgFXNGzCQ=s800-c-k-c0x00ffffff-no-rj"
        }
    ]
};

function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

function formatFull(num) {
    return num.toLocaleString('en-US');
}

function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatFull(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

const PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
];

async function fetchWithTimeout(url, options, timeout = 7000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

async function fetchWithRetry(baseUrl, endpoints) {
    for (const proxy of PROXIES) {
        try {
            const url = proxy + encodeURIComponent(baseUrl + endpoints);
            const res = await fetchWithTimeout(url);
            if (res.ok) {
                const data = await res.json();
                // Handle AllOrigins wrapping if it happens
                return data.contents ? JSON.parse(data.contents) : data;
            }
        } catch (e) {
            console.warn(`Proxy ${proxy} failed, trying next...`);
        }
    }
    throw new Error('All proxies failed');
}

async function fetchGames() {
    const gameConfigs = CONFIG.games;
    const cacheKey = 'roblox_games_cache';
    const CACHE_TTL = 300000; // 5 minutes

    // 0. Check Cache
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                console.log('Using cached Roblox data');
                return data;
            }
        }
    } catch (e) { console.warn('Cache read error', e); }

    try {
        const placeIds = gameConfigs.map(g => g.placeId).join(',');

        // 1. Get Universe IDs
        const placesData = await fetchWithRetry('https://games.roblox.com/v1/games/', `multiget-place-details?placeIds=${placeIds}`);
        const places = Array.isArray(placesData) ? placesData : (placesData.data || []);

        if (!Array.isArray(places) || places.length === 0) throw new Error('No place data');

        const universeIds = places.map(p => p.universeId).filter(id => id).join(',');

        // 2. Fetch Game Info & Thumbnails
        const [gamesData, thumbData] = await Promise.all([
            fetchWithRetry('https://games.roblox.com/v1/games', `?universeIds=${universeIds}`),
            fetchWithRetry('https://thumbnails.roblox.com/v1/games/multiget/thumbnails', `?universeIds=${universeIds}&countPerUniverse=1&size=768x432&format=Webp`)
        ]);

        const gamesList = gamesData.data || [];
        const thumbsList = thumbData.data || [];

        const thumbs = {};
        thumbsList.forEach(t => {
            if (t.thumbnails?.[0]?.imageUrl) thumbs[t.targetId] = t.thumbnails[0].imageUrl;
        });

        // 3. Merge
        const results = gameConfigs.map(config => {
            const place = places.find(p => String(p.placeId) === String(config.placeId));
            const game = gamesList.find(g => String(g.id) === String(place?.universeId));

            if (game) {
                return {
                    name: game.name,
                    creator: game.creator.name,
                    visits: game.visits,
                    playing: game.playing,
                    role: config.role,
                    thumbnail: thumbs[game.id] || null,
                    url: `https://www.roblox.com/games/${config.placeId}`
                };
            }
            return null;
        }).filter(Boolean);

        if (results.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: results, timestamp: Date.now() }));
            return results;
        }
        throw new Error('No games matched');

    } catch (e) {
        console.warn('Live fetch failed, using realistic fallback:', e.message);

        // Final fallback with REAL names as requested
        return gameConfigs.map((g, i) => {
            const fallbacks = [
                { name: "Obby But You're Glitched", visits: 235400, playing: 42 },
                { name: "Evolve [Sniffer!]", visits: 12000000, playing: 130 },
                { name: "Space Station Tycoon", visits: 2600000, playing: 15 }
            ];
            const data = fallbacks[i] || { name: `Project ${g.placeId}`, visits: 0, playing: 0 };
            return {
                ...data,
                creator: 'hohimihi',
                role: g.role,
                thumbnail: null,
                url: `https://www.roblox.com/games/${g.placeId}`
            };
        });
    }
}

function renderFeaturedGame(game) {
    const el = document.getElementById('featuredGame');
    if (!el || !game) return;

    const bgDiv = el.querySelector('.featured-bg');

    if (game.thumbnail) {
        bgDiv.style.backgroundImage = `url(${game.thumbnail})`;
    }

    el.querySelector('.featured-title').textContent = game.name;
    el.querySelector('.featured-role').textContent = game.role + ' • ' + formatNumber(game.visits) + ' visits';
    el.onclick = () => window.open(game.url, '_blank');
}

function renderGames(games) {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = games.map(game => `
        <a href="${game.url}" target="_blank" class="game-card">
            <div class="game-thumb-wrap">
                <img class="game-thumb" src="${game.thumbnail || 'https://t0.rbxcdn.com/180DAY-b8ce6c56be16d9008ef43278d0b64d19/768/432/Image/Webp/noFilter'}" alt="${game.name}" onerror="this.style.background='linear-gradient(135deg, #1f1408, #2e1d05)'">
            </div>
            <div class="game-info">
                <div class="game-name">${game.name}</div>
                <div class="game-creator">by ${game.creator}</div>
                <div class="game-meta">
                    <div class="game-stats">
                        <span class="game-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            ${formatNumber(game.visits)}
                        </span>
                        <span class="game-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            ${formatNumber(game.playing)}
                        </span>
                    </div>
                    <span class="game-role-tag">${game.role}</span>
                </div>
            </div>
        </a>
    `).join('');
}

function renderReviews() {
    const stack = document.getElementById('reviewsStack');
    const starSvg = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

    stack.innerHTML = CONFIG.reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">${r.initial}</div>
                <div class="review-meta">
                    <div class="review-name">${r.name}</div>
                    <div class="review-role">${r.role}</div>
                </div>
                <div class="review-stars">${starSvg.repeat(5)}</div>
            </div>
            <p class="review-text">"${r.text}"</p>
        </div>
    `).join('');
}

function renderCollabs() {
    const grid = document.getElementById('collabsGrid');
    grid.innerHTML = CONFIG.collaborations.map(c => `
        <a href="${c.channelUrl}" target="_blank" rel="noopener" class="collab-card">
            <div class="collab-avatar">
                <img src="${c.avatar}" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <span class="collab-avatar-fallback" style="display:none">${c.name[0]}</span>
            </div>
            <div class="collab-name">${c.name}</div>
            <div class="collab-subs">${c.subscribers} subscribers</div>
            <div class="collab-project">${c.project}</div>
        </a>
    `).join('');
}

function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.mobile-menu');

    btn?.addEventListener('click', () => {
        btn.classList.toggle('active');
        menu.classList.toggle('active');
    });

    menu?.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            btn.classList.remove('active');
            menu.classList.remove('active');
        });
    });
}

async function init() {
    renderReviews();
    renderCollabs();
    initMobileMenu();

    const games = await fetchGames();
    renderGames(games);

    const featuredGame = games.find(g => g.role === 'Owner') || games[0];
    renderFeaturedGame(featuredGame);

    const totalVisits = games.reduce((sum, g) => sum + g.visits, 0);
    const heroVisitsEl = document.getElementById('heroVisits');
    if (heroVisitsEl) {
        animateCounter(heroVisitsEl, totalVisits, 2000);
    }
}

document.addEventListener('DOMContentLoaded', init);
