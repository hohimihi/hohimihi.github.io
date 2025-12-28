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

async function fetchWithRetry(path, query) {
    for (const proxy of PROXIES) {
        try {
            const baseUrl = path.startsWith('http') ? path : `https://games.roblox.com/v1/${path}`;
            const url = proxy + encodeURIComponent(baseUrl + query);
            const res = await fetchWithTimeout(url);
            if (res.ok) {
                const data = await res.json();
                return data.contents ? JSON.parse(data.contents) : data;
            }
        } catch (e) {
            console.warn(`Proxy ${proxy} failed for ${path}`);
        }
    }
    throw new Error(`All proxies failed for ${path}`);
}

async function fetchGames() {
    const gameConfigs = CONFIG.games;
    const cacheKey = 'roblox_cache_v7'; // Clear old state
    const CACHE_TTL = 600000; // 10 minutes

    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) return data;
        }
    } catch (e) { }

    try {
        // 1. Get Universe IDs (Place -> Universe)
        const universeResults = await Promise.all(gameConfigs.map(async config => {
            try {
                const data = await fetchWithRetry(`https://apis.roblox.com/universes/v1/places/${config.placeId}/universe`, '');
                return { placeId: config.placeId, universeId: data.universeId, role: config.role };
            } catch (e) {
                console.warn(`Universe ID fetch failed for ${config.placeId}: ${e.message}`);
                return { placeId: config.placeId, universeId: null, role: config.role };
            }
        }));

        const validUniverseIds = universeResults.map(r => r.universeId).filter(id => id);
        if (validUniverseIds.length === 0) throw new Error('No valid universe IDs found');
        const uniqueIds = [...new Set(validUniverseIds)].join(',');

        // 2. Fetch Detailed Info & Thumbnails
        const [gamesRes, thumbRes] = await Promise.all([
            fetchWithRetry('https://games.roblox.com/v1/games', `?universeIds=${uniqueIds}`),
            fetchWithRetry('https://thumbnails.roblox.com/v1/games/multiget/thumbnails', `?universeIds=${uniqueIds}&countPerUniverse=1&size=768x432&format=Webp`)
        ]);

        const gamesList = gamesRes.data || [];
        const thumbsList = thumbRes.data || [];

        // Correctly handle the multiget mapping
        const thumbsMap = {};
        thumbsList.forEach(item => {
            if (item.universeId && item.thumbnails?.[0]?.imageUrl) {
                thumbsMap[item.universeId] = item.thumbnails[0].imageUrl;
            }
        });

        // 3. Assemble Results
        const finalGames = universeResults.map(ur => {
            // Only process if a universeId was successfully retrieved
            if (!ur.universeId) return null;

            const gameData = gamesList.find(g => String(g.id) === String(ur.universeId));
            if (!gameData) return null;

            return {
                name: gameData.name,
                creator: gameData.creator.name,
                visits: gameData.visits,
                playing: gameData.playing,
                role: ur.role,
                thumbnail: thumbsMap[ur.universeId] || null,
                url: `https://www.roblox.com/games/${ur.placeId}`
            };
        }).filter(Boolean);

        if (finalGames.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: finalGames, timestamp: Date.now() }));
            return finalGames;
        }
        throw new Error('No games found after processing');

    } catch (e) {
        console.warn('Live fetch failed, using fallback:', e.message);
        const fallbacks = [
            { name: "Obby But You're Glitched", visits: 235400, playing: 42 },
            { name: "Evolve [Sniffer!]", visits: 12000000, playing: 130 },
            { name: "Space Station Tycoon", visits: 2600000, playing: 15 }
        ];
        return gameConfigs.map((g, i) => {
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
                <img class="game-thumb" src="${game.thumbnail || ''}" alt="${game.name}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; this.classList.add('broken');">
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
