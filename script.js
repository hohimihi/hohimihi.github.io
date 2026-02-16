/* =====================================================
   HOHIMIHI PORTFOLIO - JAVASCRIPT
   ===================================================== */

const CONFIG = {
    games: [
        { placeId: "94282122066477", universeId: "7811316908", role: "Head Developer", featured: true },
        { placeId: "130967462823996", universeId: "4611295202", role: "Owner" },
        { placeId: "14958096162", universeId: "5152857750", role: "Head Developer" },
        { placeId: "13421499226", universeId: "4671081879", role: "Developer" }
    ],

    reviews: [
        {
            text: "chill guy did a pretty nice job",
            name: "sapoperro",
            role: "Roblox Developer",
            avatar: "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-C87193AB6608680DAED0A274ABA660B6-Png/150/150/AvatarHeadshot/Webp/isCircular",
            profileUrl: "https://www.roblox.com/users/352535647/profile"
        },
        {
            text: "Did an awesome job, polished everything up.",
            name: "Shrani_Blind",
            role: "Game Builder",
            avatar: "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-784A29CE5C3330C731E594A20C8F2983-Png/150/150/AvatarHeadshot/Webp/isCircular",
            profileUrl: "https://www.roblox.com/users/2357507092/profile"
        },
        {
            text: "Reliable lad",
            name: "Drak",
            role: "Project Manager",
            avatar: "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-558CD38F370DC1E74E87817FA51320C1-Png/150/150/AvatarHeadshot/Webp/isCircular",
            profileUrl: "https://www.roblox.com/users/2328178033/profile"
        }
    ],

    collaborations: [
        {
            name: "Flamingo",
            subscribers: "14.2M",
            project: "Trolling Event",
            channelUrl: "https://www.youtube.com/@flamingo",
            videoUrl: "https://www.youtube.com/watch?v=Q-z1mbNQ3jw",
            avatar: "https://yt3.googleusercontent.com/7cF22TRiceqQr2Cro_X4uhRVnwCdOa2HXiwdBGPnUEqJDuCyr2CykDfDw2rCWjbjaHEdTMUC=s800-c-k-c0x00ffffff-no-rj"
        },
        {
            name: "WaffleTrades",
            subscribers: "379K",
            project: "UGC Event",
            channelUrl: "https://www.youtube.com/@WaffleTrades",
            videoUrl: "https://www.youtube.com/watch?v=mNzZROdUA7Y",
            avatar: "https://yt3.googleusercontent.com/_gZfISAhDSvPL-ayo04b2wVNoJlWsWezFdoVtdhNnlNHy3Eih3zDtO1s-H2ku_6p28RXAaL_DzU=s800-c-k-c0x00ffffff-no-rj"
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
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?'
];

async function fetchWithTimeout(url, options, timeout = 3000) {
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
            const targetUrl = baseUrl + query;
            const url = proxy.includes('allorigins')
                ? `${proxy}${encodeURIComponent(targetUrl)}&timestamp=${Date.now()}`
                : `${proxy}${targetUrl}`;

            const res = await fetchWithTimeout(url);
            if (res.ok) {
                const data = await res.json();
                // AllOrigins wraps the result in a 'contents' string
                if (data.contents) {
                    try {
                        return JSON.parse(data.contents);
                    } catch (parseError) {
                        return data.contents;
                    }
                }
                return data;
            }
        } catch (e) {
            console.warn(`Proxy ${proxy} failed for ${path}:`, e.message);
        }
    }
    throw new Error(`All proxies failed for ${path}`);
}

const FALLBACK_GAMES = [
    {
        name: "Arise Army Tycoon",
        visits: 1000000,
        playing: 500,
        role: "Developer",
        creator: "hohimihi",
        thumbnail: "https://tr.rbxcdn.com/7123184ca7873a0e9803bf2593976378/768/432/Image/Webp",
        url: "https://www.roblox.com/games/94282122066477"
    },
    {
        name: "Obby But You're Glitched",
        visits: 235400,
        playing: 42,
        role: "Owner",
        creator: "hohimihi",
        thumbnail: "https://tr.rbxcdn.com/264b38d380908866387063462d64f0f0/768/432/Image/Webp",
        url: "https://www.roblox.com/games/130967462823996"
    },
    {
        name: "Evolve [Sniffer!]",
        visits: 12100000,
        playing: 130,
        role: "Head Developer",
        creator: "hohimihi",
        thumbnail: "https://tr.rbxcdn.com/393b33362a2d48039703bf2593976378/768/432/Image/Webp",
        url: "https://www.roblox.com/games/14958096162"
    },
    {
        name: "Space Station Tycoon",
        visits: 2600000,
        playing: 15,
        role: "Developer",
        creator: "hohimihi",
        thumbnail: "https://tr.rbxcdn.com/1523184ca7873a0e9803bf2593976378/768/432/Image/Webp",
        url: "https://www.roblox.com/games/13421499226"
    }
];

async function fetchGames() {
    const gameConfigs = CONFIG.games;
    const cacheKey = `roblox_cache_${gameConfigs.length}_v2`;
    const universeIds = gameConfigs.map(g => g.universeId).join(',');

    try {
        // 1. Fetch Detailed Info & Thumbnails in parallel
        const [gamesRes, thumbRes] = await Promise.all([
            fetchWithRetry('https://games.roblox.com/v1/games', `?universeIds=${universeIds}`),
            fetchWithRetry('https://thumbnails.roblox.com/v1/games/multiget/thumbnails', `?universeIds=${universeIds}&countPerUniverse=1&size=768x432&format=Webp`)
        ]);

        const gamesList = gamesRes.data || [];
        const thumbsList = thumbRes.data || [];
        const thumbsMap = {};
        thumbsList.forEach(item => {
            if (item.universeId && item.thumbnails?.[0]?.imageUrl) {
                thumbsMap[item.universeId] = item.thumbnails[0].imageUrl;
            }
        });

        // 2. Assemble Results
        const finalGames = gameConfigs.map(config => {
            const gameData = gamesList.find(g => String(g.id) === String(config.universeId));
            if (!gameData) return null;

            return {
                name: gameData.name,
                creator: gameData.creator.name,
                visits: gameData.visits,
                playing: gameData.playing,
                role: config.role,
                thumbnail: thumbsMap[config.universeId] || null,
                url: `https://www.roblox.com/games/${config.placeId}`
            };
        }).filter(Boolean);

        if (finalGames.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: finalGames, timestamp: Date.now() }));
            return finalGames;
        }
    } catch (e) {
        console.warn('Live fetch failed, using fallback/cache:', e.message);
    }
    return null;
}

function renderFeaturedGame(game) {
    const el = document.getElementById('featuredGame');
    if (!el || !game) return;
    const bgDiv = el.querySelector('.featured-bg');
    if (game.thumbnail) bgDiv.style.backgroundImage = `url(${game.thumbnail})`;
    el.querySelector('.featured-title').textContent = game.name;
    el.querySelector('.featured-role').textContent = `${game.role} • ${formatNumber(game.visits)} visits • ${formatNumber(game.playing)} playing`;
    el.onclick = () => window.open(game.url, '_blank');
}

function renderGames(games) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
    const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:12px;height:12px;margin-left:4px;color:#4ade80"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    stack.innerHTML = CONFIG.reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <a href="${r.profileUrl}" target="_blank" rel="noopener" class="review-link-wrapper">
                    <div class="review-avatar">
                        <img src="${r.avatar}" alt="${r.name}" onerror="this.src='https://www.roblox.com/headshot-thumbnail/image?userId=1&width=48&height=48&format=png'">
                    </div>
                </a>
                <div class="review-meta">
                    <a href="${r.profileUrl}" target="_blank" rel="noopener" class="review-name-link">
                        <div class="review-name">${r.name}${checkSvg}</div>
                    </a>
                    <div class="review-role">Verified Vouch</div>
                </div>
                <div class="review-stars">${starSvg.repeat(5)}</div>
            </div>
            <p class="review-text">"${r.text}"</p>
        </div>
    `).join('');
}

function renderCollabs() {
    const grid = document.getElementById('collabsGrid');
    if (!grid) return;
    grid.innerHTML = CONFIG.collaborations.map(c => `
        <div class="collab-card">
            <div class="collab-avatar">
                <img src="${c.avatar}" alt="${c.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <span class="collab-avatar-fallback" style="display:none">${c.name[0]}</span>
            </div>
            <div class="collab-name">${c.name}</div>
            <div class="collab-subs">${c.subscribers} subscribers</div>
            <div class="collab-project">${c.project}</div>
            <div class="collab-actions">
                <a href="${c.channelUrl}" target="_blank" rel="noopener" class="collab-btn secondary">Channel</a>
                <a href="${c.videoUrl}" target="_blank" rel="noopener" class="collab-btn primary ${c.videoUrl === '#' ? 'disabled' : ''}">Watch Video</a>
            </div>
        </div>
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

function updateUI(games) {
    if (!games) return;
    renderGames(games);
    // Prioritize explicitly featured game, then sort by visits
    const featuredGame = games.find(g => {
        const config = CONFIG.games.find(c => c.placeId === g.url.split('/').pop());
        return config && config.featured;
    }) || [...games].sort((a, b) => b.visits - a.visits)[0];
    renderFeaturedGame(featuredGame);

    const totalVisits = games.reduce((sum, g) => sum + g.visits, 0);
    const heroVisitsEl = document.getElementById('heroVisits');
    if (heroVisitsEl) {
        animateCounter(heroVisitsEl, totalVisits, 2000);
    }
}

async function init() {
    renderReviews();
    renderCollabs();
    initMobileMenu();

    // 1. INSTANT RENDER (Cache or Fallback)
    let initialGames = FALLBACK_GAMES;
    const gameConfigs = CONFIG.games;
    const cacheKey = `roblox_cache_${gameConfigs.length}_${gameConfigs[0]?.placeId || 'v1'}`;

    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            initialGames = data;
            // Removed early return to ensure BACKGROUND REVALIDATE always runs
        }
    } catch (e) { }

    // Show what we have immediately
    updateUI(initialGames);

    // 2. BACKGROUND REVALIDATE (Always run to ensure versioning matches)
    const liveGames = await fetchGames();
    if (liveGames) {
        updateUI(liveGames);
    }
}

document.addEventListener('DOMContentLoaded', init);
