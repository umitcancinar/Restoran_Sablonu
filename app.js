/**
 * GOURMET RESTAURANT - ENTERPRISE CMS CLIENT ENGINE v3.0
 * Mimar: Umitcan Cinar
 * Yenilikler: Stories, Görsel Masa Haritası, Checkout Modal, Sipariş Durumu, Sayfa Başlığı Fix
 */

// ==========================================
// PRELOADER
// ==========================================
(function () {
    const killPreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => { preloader.style.display = 'none'; }, 500);
        }
    };
    window.addEventListener('load', killPreloader);
    setTimeout(killPreloader, 1500);
})();

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // HELPERS
    // ==========================================
    function esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function safeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/javascript:/gi, '');
    }
    function sanitizeStr(str) {
        if (!str) return '';
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
    }

    // ==========================================
    // 0. KAPSAMLI CMS YUKLEYICI
    // ==========================================
    const loadSiteSettings = () => {
        db.ref('cms/settings').on('value', (snapshot) => {
            const settings = snapshot.val() || {};

            // --- PAGE TITLE (FIX) ---
            if (settings.pageTitle && settings.pageTitle.trim()) {
                document.title = settings.pageTitle.trim();
            }

            // --- HERO ---
            if (settings.heroSub && settings.heroSub.trim()) {
                const el = document.getElementById('dyn-hero-sub');
                if (el) el.innerHTML = safeHtml(settings.heroSub);
            }
            if (settings.heroTitle && settings.heroTitle.trim()) {
                const el = document.getElementById('dyn-hero-title');
                if (el) el.innerHTML = safeHtml(settings.heroTitle);
            }
            if (settings.heroDesc && settings.heroDesc.trim()) {
                const el = document.getElementById('dyn-hero-desc');
                if (el) el.innerHTML = safeHtml(settings.heroDesc);
            }
            if (settings.heroBtnPrimary && settings.heroBtnPrimary.trim()) {
                const el = document.querySelector('.hero-buttons .btn-primary');
                if (el) el.textContent = settings.heroBtnPrimary;
            }
            if (settings.heroBtnSecondary && settings.heroBtnSecondary.trim()) {
                const el = document.querySelector('.hero-buttons .btn-outline-light');
                if (el) el.textContent = settings.heroBtnSecondary;
            }
            if (settings.heroBg && settings.heroBg.trim()) {
                const el = document.querySelector('.hero-bg');
                const bgUrl = settings.heroBg.trim();
                if (/^https?:\/\//.test(bgUrl) || bgUrl.startsWith('/')) {
                    if (el) el.style.backgroundImage = `url('${bgUrl}')`;
                }
            }

            // --- HAKKIMIZDA ---
            if (settings.aboutTitle && settings.aboutTitle.trim()) {
                const el = document.getElementById('dyn-about-title');
                if (el) el.innerHTML = safeHtml(settings.aboutTitle);
            }
            if (settings.aboutDesc && settings.aboutDesc.trim()) {
                const el = document.getElementById('dyn-about-desc');
                if (el) el.innerHTML = safeHtml(settings.aboutDesc);
            }
            if (settings.aboutImg && settings.aboutImg.trim()) {
                const el = document.getElementById('dyn-about-img');
                if (el) el.src = settings.aboutImg;
            }
            if (settings.aboutImg2 && settings.aboutImg2.trim()) {
                const el = document.querySelector('.about-images .sub-img img');
                if (el) el.src = settings.aboutImg2;
            }
            if (settings.aboutYears && settings.aboutYears.trim()) {
                const el = document.querySelector('.experience-badge .years');
                if (el) el.textContent = settings.aboutYears;
            }
            if (settings.aboutFeature1 && settings.aboutFeature1.trim()) {
                const items = document.querySelectorAll('.feature-item span');
                if (items[0]) items[0].textContent = settings.aboutFeature1;
            }
            if (settings.aboutFeature2 && settings.aboutFeature2.trim()) {
                const items = document.querySelectorAll('.feature-item span');
                if (items[1]) items[1].textContent = settings.aboutFeature2;
            }
            if (settings.aboutFeature3 && settings.aboutFeature3.trim()) {
                const items = document.querySelectorAll('.feature-item span');
                if (items[2]) items[2].textContent = settings.aboutFeature3;
            }

            // --- KAMPANYA ---
            if (settings.promoTitle && settings.promoTitle.trim()) {
                const el = document.getElementById('dyn-promo-title');
                if (el) el.innerHTML = safeHtml(settings.promoTitle);
            }
            if (settings.promoDesc && settings.promoDesc.trim()) {
                const el = document.querySelector('.promo-content p');
                if (el) el.innerHTML = safeHtml(settings.promoDesc);
            }
            if (settings.promoBtn && settings.promoBtn.trim()) {
                const el = document.querySelector('.promo-content .btn-primary');
                if (el) el.textContent = settings.promoBtn;
            }

            // --- ILETISIM ---
            if (settings.contactAddr && settings.contactAddr.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[0]) items[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${esc(settings.contactAddr)}`;
            }
            if (settings.contactPhone && settings.contactPhone.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[1]) items[1].innerHTML = `<i class="fas fa-phone-alt"></i> ${esc(settings.contactPhone)}`;
                const wa = document.querySelector('.whatsapp-float');
                const cleanPhone = settings.contactPhone.replace(/\D/g, '');
                if (wa && /^\d+$/.test(cleanPhone)) {
                    wa.href = `https://wa.me/${cleanPhone}?text=Merhaba,%20web%20sitenizden%20yaziyorum.%20Bilgi%20almak%20istiyorum.`;
                }
            }
            if (settings.contactEmail && settings.contactEmail.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[2]) items[2].innerHTML = `<i class="fas fa-envelope"></i> ${esc(settings.contactEmail)}`;
            }
            if (settings.contactHours && settings.contactHours.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[3]) items[3].innerHTML = `<i class="fas fa-clock"></i> ${esc(settings.contactHours)}`;
            }

            // --- Rezervasyon saatleri (dinamik) ---
            if (settings.resTimes && settings.resTimes.trim()) {
                const timeSelect = document.getElementById('res-time');
                if (timeSelect) {
                    const times = settings.resTimes.split('\n').map(t => t.trim()).filter(Boolean);
                    if (times.length > 0) {
                        timeSelect.innerHTML = '<option value="">Seçiniz</option>' +
                            times.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
                    }
                }
            }

            // --- FOOTER ---
            if (settings.footerDesc && settings.footerDesc.trim()) {
                const el = document.querySelector('.footer-desc');
                if (el) el.textContent = settings.footerDesc;
            }
            if (settings.logoText && settings.logoText.trim()) {
                document.querySelectorAll('.logo, .footer-logo').forEach(el => {
                    el.innerHTML = `<i class="fas fa-crown"></i> ${esc(settings.logoText)}<span>.</span>`;
                });
            }
            if (settings.copyright && settings.copyright.trim()) {
                const el = document.querySelector('.footer-bottom p');
                if (el) el.innerHTML = safeHtml(settings.copyright);
            }

            // --- SOSYAL MEDYA ---
            const socials = ['instagram', 'twitter', 'facebook', 'tripadvisor'];
            socials.forEach(s => {
                if (settings[`social_${s}`] && settings[`social_${s}`].trim()) {
                    const icon = document.querySelector(`.social-icon .fa-${s === 'twitter' ? 'twitter' : s === 'facebook' ? 'facebook-f' : s === 'tripadvisor' ? 'tripadvisor' : 'instagram'}`);
                    if (icon && icon.parentElement) {
                        icon.parentElement.href = settings[`social_${s}`];
                    }
                }
            });
        });

        // --- NAVBAR ---
        db.ref('cms/navlinks').on('value', (snapshot) => {
            const navbarLinks = snapshot.val();
            if (navbarLinks && navbarLinks.length > 0) {
                const navUl = document.querySelector('.nav-links');
                const mobileNavUl = document.querySelector('.mobile-nav-links');
                if (navUl) {
                    navUl.innerHTML = navbarLinks.map((l, i) =>
                        `<li><a href="${esc(l.href)}" class="nav-link${i === 0 ? ' active' : ''}">${esc(l.label)}</a></li>`
                    ).join('');
                }
                if (mobileNavUl) {
                    mobileNavUl.innerHTML = navbarLinks.map(l =>
                        `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`
                    ).join('');
                }
            }
        });

        // --- GALERI ---
        db.ref('cms/gallery').on('value', (snapshot) => {
            const galleryItems = snapshot.val();
            if (galleryItems && galleryItems.length > 0) {
                const grid = document.querySelector('.gallery-grid');
                if (grid) {
                    grid.innerHTML = galleryItems.map((item, i) => {
                        let cls = 'gallery-item fade-in-up';
                        if (i === 0) cls += ' w-2 h-2';
                        else if (i === 3) cls += ' w-2';
                        return `
                    <div class="${cls}">
                        <img src="${item.url}" alt="${item.alt || 'Galeri ' + (i + 1)}" loading="lazy">
                        <div class="gallery-overlay"><i class="fas fa-search-plus"></i></div>
                    </div>`;
                    }).join('');
                }
            }
        });

        // --- MENU ---
        db.ref('cms/menu').on('value', (snapshot) => {
            const customMenu = snapshot.val();
            if (customMenu && customMenu.length > 0) {
                const menuGrid = document.getElementById('menu-grid');
                if (menuGrid) {
                    menuGrid.innerHTML = '';
                    customMenu.forEach(item => {
                        const badgeHtml = item.badge ? `<div class="menu-badge${item.badge === 'Yeni' ? ' hot' : ''}">${item.badge}</div>` : '';
                        const waitHtml = item.waitTime ? `<span class="menu-wait-time"><i class="fas fa-hourglass-half"></i> ~${esc(String(item.waitTime))} dk</span>` : '';
                        menuGrid.innerHTML += `
                    <div class="menu-item menu-card fade-in-up is-visible" data-category="${item.category}">
                        <div class="menu-img">
                            <img src="${item.img}" alt="${item.name}" loading="lazy">
                            ${badgeHtml}
                        </div>
                        <div class="menu-content">
                            <div class="menu-title-row">
                                <h3>${item.name}</h3>
                                <span class="price">&#8378;${item.price}</span>
                            </div>
                            <p class="menu-desc">${item.desc}</p>
                            ${waitHtml}
                            <button class="btn-add-cart" onclick="addToCart(event, '${item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${item.price}', '${item.waitTime || 0}')"><i class="fas fa-plus"></i> Siparis Ekle</button>
                        </div>
                    </div>`;
                    });
                }
            }
        });

        // --- STORIES ---
        db.ref('cms/stories').on('value', (snapshot) => {
            const storyData = snapshot.val();
            const container = document.getElementById('stories-container');
            const bar = document.getElementById('stories-bar');
            if (!container || !bar) return;

            if (!storyData || !Array.isArray(storyData) || storyData.length === 0) {
                bar.style.display = 'none';
                return;
            }
            bar.style.display = 'flex';
            storiesData = storyData;
            container.innerHTML = storyData.map((story, i) => `
                <div class="story-item" data-idx="${i}" onclick="openStory(${i})">
                    <div class="story-ring">
                        <div class="story-avatar">
                            ${story.type === 'video'
                    ? '<i class="fas fa-video"></i>'
                    : `<img src="${story.mediaUrl}" alt="${esc(story.title)}" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=fas fa-utensils></i>'">`
                }
                        </div>
                    </div>
                    <span class="story-label">${esc(story.title)}</span>
                </div>
            `).join('');
        });

        // --- TABLE MAP (for reservation) ---
        db.ref('cms/tablemap').on('value', (snap) => {
            tablemapData = snap.val() || getDefaultTablemap();
            // Also get approved reservations to mark reserved tables
            renderTablemap(tablemapData, currentResDateTime);
        });

        // Also listen to reservations to update map availability
        db.ref('cms/reservations').on('value', (snap) => {
            reservationsData = snap.val() || {};
            renderTablemap(tablemapData, currentResDateTime);
        });
    };

    loadSiteSettings();

    // ==========================================
    // 1. TEMA MOTORU
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        const savedTheme = localStorage.getItem('gourmet_theme') || 'light';
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme, themeIcon);

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('gourmet_theme', newTheme);
            updateThemeIcon(newTheme, themeIcon);
        });
    }

    function updateThemeIcon(theme, iconElement) {
        if (!iconElement) return;
        if (theme === 'dark') { iconElement.className = 'fas fa-sun'; }
        else { iconElement.className = 'fas fa-moon'; }
    }

    // ==========================================
    // 2. NAVBAR
    // ==========================================
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }
    if (mobileMenuBtn && mobileMenu) mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
    if (mobileMenuClose && mobileMenu) mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('active'));
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', () => { if (mobileMenu) mobileMenu.classList.remove('active'); });
    });

    // ==========================================
    // 3. SCROLL SPY
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                if (window.pageYOffset >= (section.offsetTop - 150)) current = section.getAttribute('id');
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (current && link.getAttribute('href').includes(current)) link.classList.add('active');
            });
        });
    }

    // ==========================================
    // 4. MENU FILTRELEME
    // ==========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(fBtn => fBtn.classList.remove('active'));
                e.target.classList.add('active');
                const targetCategory = e.target.getAttribute('data-filter');
                document.querySelectorAll('.menu-item').forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        if (targetCategory === 'all' || targetCategory === itemCategory) {
                            item.classList.remove('hide');
                            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                        } else { item.classList.add('hide'); }
                    }, 300);
                });
            });
        });
    }

    // ==========================================
    // 5. PARALLAX VE OBSERVER
    // ==========================================
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
        window.addEventListener('scroll', () => {
            let offset = window.pageYOffset;
            if (offset < window.innerHeight) parallaxBg.style.transform = `translateY(${offset * 0.4}px)`;
        });
    }
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });
        animatedElements.forEach(el => scrollObserver.observe(el));
    } else if (animatedElements.length > 0) {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // Galeri lightbox
    document.querySelector('.gallery-grid') && document.querySelector('.gallery-grid').addEventListener('click', e => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        const img = item.querySelector('img');
        if (!img) return;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
        overlay.innerHTML = `<img src="${img.src}" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.5)">`;
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
    });

    // ==========================================
    // 6. STORIES SISTEMI
    // ==========================================
    let storiesData = [];
    let currentStoryIdx = 0;
    let storyTimer = null;
    const STORY_DURATION = 5000;

    window.openStory = (idx) => {
        if (!storiesData || storiesData.length === 0) return;
        currentStoryIdx = idx;
        showStory(currentStoryIdx);
        const overlay = document.getElementById('story-modal-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            requestAnimationFrame(() => overlay.classList.add('active'));
        }
    };

    function showStory(idx) {
        if (idx < 0 || idx >= storiesData.length) {
            closeStory();
            return;
        }
        const story = storiesData[idx];
        const mediaEl = document.getElementById('story-media');
        const titleEl = document.getElementById('story-modal-title');
        const timeEl = document.getElementById('story-modal-time');
        const avatarEl = document.getElementById('story-modal-avatar');
        const progressEl = document.getElementById('story-progress-fill');

        if (titleEl) titleEl.textContent = story.title || 'Şefin Günlüğü';
        if (timeEl) timeEl.textContent = story.createdAt ? new Date(story.createdAt).toLocaleDateString('tr-TR') : '';

        // Avatar
        if (avatarEl) {
            avatarEl.innerHTML = story.type === 'video'
                ? '<i class="fas fa-video" style="color:#C9A84C;font-size:1rem"></i>'
                : `<img src="${story.mediaUrl}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        }

        // Media
        if (mediaEl) {
            if (story.type === 'video') {
                mediaEl.innerHTML = `<video src="${story.mediaUrl}" autoplay muted playsinline loop style="width:100%;height:100%;object-fit:cover;"></video>`;
            } else {
                mediaEl.innerHTML = `<img src="${story.mediaUrl}" alt="${esc(story.title)}" style="width:100%;height:100%;object-fit:cover;">`;
            }
        }

        // Progress bar reset & animate
        if (progressEl) {
            progressEl.style.transition = 'none';
            progressEl.style.width = '0%';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    progressEl.style.transition = `width ${STORY_DURATION}ms linear`;
                    progressEl.style.width = '100%';
                });
            });
        }

        // Auto advance
        clearTimeout(storyTimer);
        storyTimer = setTimeout(() => {
            showStory(currentStoryIdx + 1);
        }, STORY_DURATION);
    }

    function closeStory() {
        clearTimeout(storyTimer);
        const overlay = document.getElementById('story-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => { overlay.style.display = 'none'; }, 400);
        }
    }

    document.getElementById('story-close-btn')?.addEventListener('click', closeStory);
    document.getElementById('story-prev')?.addEventListener('click', () => {
        clearTimeout(storyTimer);
        currentStoryIdx = Math.max(0, currentStoryIdx - 1);
        showStory(currentStoryIdx);
    });
    document.getElementById('story-next')?.addEventListener('click', () => {
        clearTimeout(storyTimer);
        currentStoryIdx++;
        showStory(currentStoryIdx);
    });
    document.getElementById('story-modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('story-modal-overlay')) closeStory();
    });

    // ==========================================
    // 7. TABLEMAP — MASA HARİTASI
    // ==========================================
    let tablemapData = [];
    let reservationsData = {};
    let selectedTableId = null;
    let currentResDateTime = null;

    function getDefaultTablemap() {
        return [
            { id: 't1', zone: 'Teras', label: 'T1', capacity: 2, x: 1, y: 1 },
            { id: 't2', zone: 'Teras', label: 'T2', capacity: 2, x: 2, y: 1 },
            { id: 't3', zone: 'Teras', label: 'T3', capacity: 4, x: 3, y: 1 },
            { id: 't4', zone: 'Cam Kenarı', label: 'C1', capacity: 2, x: 1, y: 2 },
            { id: 't5', zone: 'Cam Kenarı', label: 'C2', capacity: 4, x: 2, y: 2 },
            { id: 't6', zone: 'Cam Kenarı', label: 'C3', capacity: 2, x: 3, y: 2 },
            { id: 't7', zone: 'Şömine', label: 'S1', capacity: 6, x: 1, y: 3 },
            { id: 't8', zone: 'Şömine', label: 'S2', capacity: 4, x: 2, y: 3 },
            { id: 't9', zone: 'İç Alan', label: 'İ1', capacity: 2, x: 3, y: 3 },
            { id: 't10', zone: 'İç Alan', label: 'İ2', capacity: 4, x: 4, y: 3 },
            { id: 't11', zone: 'İç Alan', label: 'İ3', capacity: 2, x: 4, y: 2 },
            { id: 't12', zone: 'VIP', label: 'V1', capacity: 8, x: 4, y: 1 }
        ];
    }

    function isTableReserved(tableId, dateStr, timeStr) {
        if (!reservationsData || !dateStr || !timeStr) return false;
        return Object.values(reservationsData).some(res => {
            if (res.tableId !== tableId) return false;
            if (res.date !== dateStr) return false;
            if (res.status !== 'onaylandi') return false;
            // Check 1-hour slot overlap
            if (res.time === timeStr) return true;
            return false;
        });
    }

    function renderTablemap(tables, resDateTime) {
        const grid = document.getElementById('tablemap-grid');
        if (!grid) return;

        const arr = Array.isArray(tables) ? tables : [];
        if (arr.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:24px">Masa haritası yükleniyor...</p>';
            return;
        }

        // Group by zone
        const zones = {};
        arr.forEach(t => {
            if (!zones[t.zone]) zones[t.zone] = [];
            zones[t.zone].push(t);
        });

        const dateStr = resDateTime ? resDateTime.date : null;
        const timeStr = resDateTime ? resDateTime.time : null;

        const zoneIcons = { 'Teras': 'sun', 'Cam Kenarı': 'water', 'Şömine': 'fire', 'İç Alan': 'chair', 'VIP': 'crown' };

        grid.innerHTML = Object.entries(zones).map(([zoneName, tables]) => `
            <div class="tablemap-zone">
                <div class="tablemap-zone-label">
                    <i class="fas fa-${zoneIcons[zoneName] || 'map-marker-alt'}"></i> ${esc(zoneName)}
                </div>
                <div class="tablemap-zone-tables">
                    ${tables.map(t => {
            const reserved = dateStr && timeStr ? isTableReserved(t.id, dateStr, timeStr) : false;
            const isSelected = selectedTableId === t.id;
            let statusClass = reserved ? 'reserved' : (isSelected ? 'selected' : 'available');
            // XSS FIX: Use data-table-id instead of inline onclick with Firebase key
            return `
                        <div class="tablemap-table ${statusClass}"
                            data-table-id="${esc(t.id)}"
                            data-label="${esc(t.label)}"
                            data-zone="${esc(t.zone)}"
                            data-cap="${esc(String(t.capacity))}"
                            ${reserved ? 'data-reserved="true"' : ''}
                            title="${esc(t.zone)} — ${t.capacity} kişilik">
                            <div class="tablemap-table-icon"><i class="fas fa-chair"></i></div>
                            <div class="tablemap-table-label">${esc(t.label)}</div>
                            <div class="tablemap-table-cap">${t.capacity} kişi</div>
                        </div>`;
        }).join('')}
                </div>
            </div>
        `).join('');

        // Event delegation for table selection (XSS-safe, no inline onclick)
        grid.querySelectorAll('.tablemap-table:not([data-reserved])').forEach(el => {
            el.addEventListener('click', () => {
                const tid = el.dataset.tableId;
                if (tid) window.selectTable(tid);
            });
        });
    }

    window.selectTable = (tableId) => {
        selectedTableId = tableId;
        renderTablemap(tablemapData, currentResDateTime);

        const tables = Array.isArray(tablemapData) ? tablemapData : [];
        const found = tables.find(t => t.id === tableId);
        const infoEl = document.getElementById('tablemap-selected-info');
        const labelEl = document.getElementById('tablemap-selected-label');
        const confirmBtn = document.getElementById('res-confirm-btn');

        if (infoEl) infoEl.style.display = 'flex';
        if (labelEl && found) labelEl.textContent = `${found.zone} — ${found.label} (${found.capacity} kişilik) seçildi`;
        if (confirmBtn) confirmBtn.disabled = false;
    };

    // ==========================================
    // 8. REZERVASYON SİSTEMİ (2 ADIMLI)
    // ==========================================
    const resForm = document.getElementById('reservation-form');
    const resStepForm = document.getElementById('res-step-form');
    const resStepMap = document.getElementById('res-step-tablemap');
    const formMessage = document.getElementById('form-message');
    const resBackBtn = document.getElementById('res-back-btn');
    const resConfirmBtn = document.getElementById('res-confirm-btn');

    if (resForm) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('res-name').value.trim();
            const phone = document.getElementById('res-phone').value.trim();
            const date = document.getElementById('res-date').value;
            const time = document.getElementById('res-time').value;
            const guests = document.getElementById('res-guests').value;

            if (!name || !phone || !date || !time || !guests) {
                if (formMessage) { formMessage.textContent = 'Lütfen tüm zorunlu alanları doldurun.'; formMessage.className = 'form-message error'; formMessage.style.display = 'block'; }
                return;
            }

            currentResDateTime = { date, time };
            selectedTableId = null;
            if (resStepForm) resStepForm.classList.add('hidden');
            if (resStepMap) resStepMap.classList.remove('hidden');
            renderTablemap(tablemapData, currentResDateTime);
            if (resConfirmBtn) resConfirmBtn.disabled = true;
            const infoEl = document.getElementById('tablemap-selected-info');
            if (infoEl) infoEl.style.display = 'none';
        });
    }

    if (resBackBtn) {
        resBackBtn.addEventListener('click', () => {
            if (resStepMap) resStepMap.classList.add('hidden');
            if (resStepForm) resStepForm.classList.remove('hidden');
            const infoEl = document.getElementById('tablemap-selected-info');
            if (infoEl) infoEl.style.display = 'none';
        });
    }

    if (resConfirmBtn) {
        resConfirmBtn.addEventListener('click', () => {
            if (!selectedTableId) return;
            const btn = resConfirmBtn;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
            btn.disabled = true;

            const found = (Array.isArray(tablemapData) ? tablemapData : []).find(t => t.id === selectedTableId);
            const newRes = {
                name: sanitizeStr(document.getElementById('res-name').value),
                phone: sanitizeStr(document.getElementById('res-phone').value),
                date: sanitizeStr(document.getElementById('res-date').value),
                time: sanitizeStr(document.getElementById('res-time').value),
                guests: sanitizeStr(document.getElementById('res-guests').value),
                note: sanitizeStr(document.getElementById('res-note').value) || 'Yok',
                tableId: selectedTableId,
                tableLabel: found ? (found.zone + ' — ' + found.label) : selectedTableId,
                status: 'beklemede',
                timestamp: new Date().getTime()
            };

            db.ref('cms/reservations').push(newRes)
                .then(() => {
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Rezervasyonu Gönder';
                    btn.disabled = false;
                    const msg2 = document.getElementById('form-message-2');
                    if (msg2) { msg2.textContent = 'Rezervasyon talebiniz alındı! Yöneticimiz onaylayacaktır.'; msg2.className = 'form-message success'; msg2.style.display = 'block'; }
                    selectedTableId = null;
                    currentResDateTime = null;
                    resForm.reset();
                    setTimeout(() => {
                        if (resStepMap) resStepMap.classList.add('hidden');
                        if (resStepForm) resStepForm.classList.remove('hidden');
                        if (msg2) msg2.style.display = 'none';
                    }, 4000);
                })
                .catch(err => {
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Rezervasyonu Gönder';
                    btn.disabled = false;
                    console.error('Rezervasyon hatası:', err);
                    const msg2 = document.getElementById('form-message-2');
                    if (msg2) { msg2.textContent = 'Hata oluştu: ' + (err.message || err); msg2.className = 'form-message error'; msg2.style.display = 'block'; }
                });
        });
    }

    // ==========================================
    // 9. YASAL MODALLER
    // ==========================================
    const openModal = (btnId, modalId) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
            });
        }
    };
    openModal('btn-gizlilik', 'modal-gizlilik');
    openModal('btn-sartlar', 'modal-sartlar');
    openModal('btn-cerez', 'modal-cerez');

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.parentElement.parentElement;
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        });
    });
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('legal-modal')) {
            e.target.classList.remove('active');
            setTimeout(() => { e.target.style.display = 'none'; }, 300);
        }
    });

    // ==========================================
    // 10. SCROLL TO TOP
    // ==========================================
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) scrollTopBtn.classList.add('show');
            else scrollTopBtn.classList.remove('show');
        });
        scrollTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // ==========================================
    // 11. SEPET ALTYAPISI
    // ==========================================
    let cart = [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartFab = document.getElementById('cart-fab');
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.getElementById('cart-count');

    if (cartFab && cartSidebar) {
        cartFab.addEventListener('click', () => { cartSidebar.classList.add('open'); });
        closeCartBtn.addEventListener('click', () => { cartSidebar.classList.remove('open'); });
    }

    window.addToCart = (eventOrName, nameOrPrice, priceArg, waitTimeArg) => {
        let event, name, price, waitTime;
        if (typeof eventOrName === 'string') {
            event = null; name = eventOrName; price = nameOrPrice; waitTime = priceArg || 0;
        } else {
            event = eventOrName; name = nameOrPrice; price = priceArg; waitTime = waitTimeArg || 0;
        }
        const numPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
        const numWait = parseInt(String(waitTime)) || 0;
        const existing = cart.find(i => i.name === name);
        if (existing) { existing.quantity += 1; }
        else { cart.push({ name, price: numPrice, quantity: 1, waitTime: numWait }); }
        updateCartUI();

        // Flying icon animation
        if (event && cartFab) {
            const btn = (event.target && event.target.closest) ? (event.target.closest('button') || event.target) : event.target;
            if (!btn || !btn.getBoundingClientRect) return;
            const btnRect = btn.getBoundingClientRect();
            const fabRect = cartFab.getBoundingClientRect();
            const flyEl = document.createElement('div');
            flyEl.classList.add('cart-fly-item');
            flyEl.innerHTML = '<i class="fas fa-shopping-basket"></i>';
            flyEl.style.left = (btnRect.left + btnRect.width / 2 - 20) + 'px';
            flyEl.style.top = (btnRect.top + btnRect.height / 2 - 20) + 'px';
            document.body.appendChild(flyEl);
            const xDist = (fabRect.left + fabRect.width / 2) - (btnRect.left + btnRect.width / 2);
            const yDist = (fabRect.top + fabRect.height / 2) - (btnRect.top + btnRect.height / 2);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flyEl.style.transform = `translate(${xDist}px, ${yDist}px) scale(0.1)`;
                    flyEl.style.opacity = '0';
                    flyEl.style.transition = 'transform 0.75s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.75s';
                });
            });
            setTimeout(() => { flyEl.remove(); cartFab.classList.add('bounce'); setTimeout(() => cartFab.classList.remove('bounce'), 300); }, 780);
        } else if (cartFab) { cartFab.classList.add('bounce'); setTimeout(() => cartFab.classList.remove('bounce'), 300); }
    };

    window.removeFromCart = (index) => { cart.splice(index, 1); updateCartUI(); };
    window.updateCartQuantity = (index, delta) => {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        updateCartUI();
    };

    function updateCartUI() {
        if (!cartItemsDiv) return;
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Sepetiniz boş.</p>';
            if (cartCount) cartCount.textContent = '0';
            if (cartTotalPrice) cartTotalPrice.textContent = '₺0';
            return;
        }
        let total = 0, cCount = 0;
        cartItemsDiv.innerHTML = cart.map((item, idx) => {
            total += (item.price * item.quantity);
            cCount += item.quantity;
            return `
                <div class="cart-item" style="border-bottom:1px solid #eee;margin-bottom:10px;padding-bottom:10px;">
                    <div class="cart-item-info" style="display:flex;justify-content:space-between;margin-bottom:5px;">
                        <h4 style="margin:0;font-size:0.95rem;">${esc(item.name)}</h4>
                        <span style="font-weight:600;">₺${item.price}</span>
                    </div>
                    ${item.waitTime ? `<div style="font-size:0.75rem;color:var(--gold);margin-bottom:4px;"><i class="fas fa-hourglass-half"></i> ~${item.waitTime}dk</div>` : ''}
                    <div class="cart-item-actions" style="display:flex;align-items:center;gap:10px;">
                        <button onclick="updateCartQuantity(${idx}, -1)" style="padding:2px 8px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${idx}, 1)" style="padding:2px 8px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${idx})" style="background:var(--danger);color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;margin-left:auto;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
        if (cartCount) cartCount.textContent = cCount;
        if (cartTotalPrice) cartTotalPrice.textContent = '₺' + total.toFixed(2);
    }

    // ==========================================
    // 12. CHECKOUT MODAL
    // ==========================================
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutClose = document.getElementById('checkout-modal-close');
    const checkoutSubmit = document.getElementById('checkout-submit-btn');
    const checkoutError = document.getElementById('checkout-error');

    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) { alert('Sepetiniz boş!'); return; }
            // Populate summary
            const summaryEl = document.getElementById('checkout-summary');
            if (summaryEl) {
                const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
                summaryEl.innerHTML = `
                    <div class="checkout-summary-title">Sipariş Özeti</div>
                    ${cart.map(i => `<div class="checkout-summary-row"><span>${esc(i.name)} x${i.quantity}</span><span>₺${(i.price * i.quantity).toFixed(2)}</span></div>`).join('')}
                    <div class="checkout-summary-total"><span>Toplam</span><span>₺${total.toFixed(2)}</span></div>
                `;
            }
            if (checkoutError) checkoutError.textContent = '';
            checkoutModal.style.display = 'flex';
            requestAnimationFrame(() => checkoutModal.classList.add('active'));
        };
    }

    if (checkoutClose) {
        checkoutClose.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
            setTimeout(() => { checkoutModal.style.display = 'none'; }, 300);
        });
    }

    checkoutModal?.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
            setTimeout(() => { checkoutModal.style.display = 'none'; }, 300);
        }
    });

    if (checkoutSubmit) {
        checkoutSubmit.addEventListener('click', () => {
            const custName = sanitizeStr(document.getElementById('co-name').value);
            const custPhone = sanitizeStr(document.getElementById('co-phone').value);
            const tableNum = document.getElementById('co-table').value.trim();

            if (!custName || !custPhone) { if (checkoutError) checkoutError.textContent = 'Ad ve telefon zorunludur!'; return; }

            checkoutSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
            checkoutSubmit.disabled = true;
            if (checkoutError) checkoutError.textContent = '';

            const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newOrder = {
                customerName: custName,
                customerPhone: custPhone,
                tableNumber: tableNum || null,
                items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, waitTime: i.waitTime || 0 })),
                totalPrice: orderTotal,
                status: 'siparis_alindi',
                timestamp: new Date().getTime(),
                date: new Date().toLocaleDateString('tr-TR'),
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            };

            db.ref('cms/orders').push(newOrder)
                .then((ref) => {
                    checkoutSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Siparişi Gönder';
                    checkoutSubmit.disabled = false;
                    checkoutModal.classList.remove('active');
                    setTimeout(() => { checkoutModal.style.display = 'none'; }, 300);
                    cart = [];
                    updateCartUI();
                    // Close cart sidebar first, then reopen after brief delay to show status
                    if (cartSidebar) cartSidebar.classList.remove('open');
                    // Start tracking this order
                    trackOrder(ref.key);
                    // Reopen cart to show status panel
                    setTimeout(() => { if (cartSidebar) cartSidebar.classList.add('open'); }, 500);
                })
                .catch(err => {
                    checkoutSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Siparişi Gönder';
                    checkoutSubmit.disabled = false;
                    console.error('Sipariş hatası:', err);
                    if (checkoutError) checkoutError.textContent = 'Hata: ' + (err.message || err);
                });
        });
    }

    // ==========================================
    // 13. SİPARİŞ DURUM TAKİBİ
    // ==========================================
    let orderTrackRef = null;
    let orderCountdownInterval = null;

    function trackOrder(orderKey) {
        if (!orderKey) return;
        // Stop previous listener
        if (orderTrackRef) { try { orderTrackRef.off(); } catch (e) { } }

        const panel = document.getElementById('order-status-panel');
        if (panel) panel.style.display = 'block';

        orderTrackRef = db.ref(`cms/orders/${orderKey}`);
        orderTrackRef.on('value', snap => {
            const order = snap.val();
            // Order deleted or doesn't exist
            if (!order) {
                if (panel) panel.style.display = 'none';
                clearInterval(orderCountdownInterval);
                return;
            }
            updateOrderStatusUI(order.status, order.items, order.timestamp);
        });
    }

    function updateOrderStatusUI(status, items, timestamp) {
        const steps = {
            'siparis_alindi': document.getElementById('sstep-received'),
            'hazirlaniyor': document.getElementById('sstep-preparing'),
            'serviste': document.getElementById('sstep-serving')
        };

        const order = ['siparis_alindi', 'hazirlaniyor', 'serviste'];
        const currentIdx = order.indexOf(status);

        Object.entries(steps).forEach(([key, el], i) => {
            if (!el) return;
            el.classList.remove('active', 'done');
            if (i < currentIdx) el.classList.add('done');
            else if (i === currentIdx) el.classList.add('active');
        });

        // Countdown
        const countdownWrapper = document.getElementById('order-status-countdown');
        const countdownVal = document.getElementById('order-countdown-val');
        if (status === 'siparis_alindi' || status === 'hazirlaniyor') {
            const maxWait = (items || []).reduce((mx, it) => Math.max(mx, (parseInt(it.waitTime || 0) * (it.quantity || 1))), 0);
            if (maxWait > 0 && countdownWrapper && countdownVal) {
                countdownWrapper.style.display = 'flex';
                clearInterval(orderCountdownInterval);
                orderCountdownInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - (timestamp || Date.now())) / 1000);
                    const remaining = (maxWait * 60) - elapsed;
                    if (remaining <= 0) {
                        countdownVal.textContent = 'HAZIR!';
                        clearInterval(orderCountdownInterval);
                    } else {
                        const m = Math.floor(remaining / 60);
                        const s = remaining % 60;
                        countdownVal.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    }
                }, 1000);
            } else {
                if (countdownWrapper) countdownWrapper.style.display = 'none';
            }
        } else {
            if (countdownWrapper) countdownWrapper.style.display = 'none';
            clearInterval(orderCountdownInterval);
        }
    }

    // ==========================================
    // 14. GİZLİ YETKİLİ GİRİŞ
    // ==========================================
    const staffTrigger = document.getElementById('staff-login-trigger');
    const staffDropdown = document.getElementById('staff-login-dropdown');
    let staffClickCount = 0;
    let staffClickTimer = null;

    if (staffTrigger && staffDropdown) {
        staffTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            staffClickCount++;
            clearTimeout(staffClickTimer);
            staffClickTimer = setTimeout(() => { staffClickCount = 0; }, 2000);

            // Requires 3 rapid clicks to open
            if (staffClickCount >= 3) {
                staffClickCount = 0;
                staffDropdown.classList.toggle('hidden');
            }
        });

        document.addEventListener('click', () => {
            if (!staffDropdown.classList.contains('hidden')) {
                staffDropdown.classList.add('hidden');
            }
        });
        staffDropdown.addEventListener('click', (e) => e.stopPropagation());
    }
});