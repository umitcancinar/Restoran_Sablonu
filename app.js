/**
 * GOURMET RESTAURANT - ENTERPRISE CMS CLIENT ENGINE v2.0
 * Mimar: Umitcan Cinar
 * Aciklama: Kapsamli CMS destegi. Tum alanlar guvenceli yuklenir.
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
    // 0. KAPSAMLI CMS YUKLEYICI
    // ==========================================
    const loadSiteSettings = () => {
        // --- AYARLAR (HERO, ABOUT, ILETISIM vb.) ---
        db.ref('cms/settings').on('value', (snapshot) => {
            const settings = snapshot.val() || {};

            // --- HERO ---
            if (settings.heroSub && settings.heroSub.trim()) {
                const el = document.getElementById('dyn-hero-sub');
                if (el) el.innerHTML = settings.heroSub;
            }
            if (settings.heroTitle && settings.heroTitle.trim()) {
                const el = document.getElementById('dyn-hero-title');
                if (el) el.innerHTML = settings.heroTitle;
            }
            if (settings.heroDesc && settings.heroDesc.trim()) {
                const el = document.getElementById('dyn-hero-desc');
                if (el) el.innerHTML = settings.heroDesc;
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
                if (el) el.style.backgroundImage = `url('${settings.heroBg}')`;
            }

            // --- HAKKIMIZDA ---
            if (settings.aboutTitle && settings.aboutTitle.trim()) {
                const el = document.getElementById('dyn-about-title');
                if (el) el.innerHTML = settings.aboutTitle;
            }
            if (settings.aboutDesc && settings.aboutDesc.trim()) {
                const el = document.getElementById('dyn-about-desc');
                if (el) el.innerHTML = settings.aboutDesc;
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
                if (el) el.innerHTML = settings.promoTitle;
            }
            if (settings.promoDesc && settings.promoDesc.trim()) {
                const el = document.querySelector('.promo-content p');
                if (el) el.innerHTML = settings.promoDesc;
            }
            if (settings.promoBtn && settings.promoBtn.trim()) {
                const el = document.querySelector('.promo-content .btn-primary');
                if (el) el.textContent = settings.promoBtn;
            }

            // --- ILETISIM / REZERVASYON ---
            if (settings.contactAddr && settings.contactAddr.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[0]) items[0].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${settings.contactAddr}`;
            }
            if (settings.contactPhone && settings.contactPhone.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[1]) items[1].innerHTML = `<i class="fas fa-phone-alt"></i> ${settings.contactPhone}`;
                // WhatsApp numarasi guncelle
                const wa = document.querySelector('.whatsapp-float');
                if (wa) wa.href = `https://wa.me/${settings.contactPhone.replace(/\D/g, '')}?text=Merhaba,%20web%20sitenizden%20yaziyorum.%20Bilgi%20almak%20istiyorum.`;
            }
            if (settings.contactEmail && settings.contactEmail.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[2]) items[2].innerHTML = `<i class="fas fa-envelope"></i> ${settings.contactEmail}`;
            }
            if (settings.contactHours && settings.contactHours.trim()) {
                const items = document.querySelectorAll('.res-contact-list li');
                if (items[3]) items[3].innerHTML = `<i class="fas fa-clock"></i> ${settings.contactHours}`;
            }

            // --- FOOTER ---
            if (settings.footerDesc && settings.footerDesc.trim()) {
                const el = document.querySelector('.footer-desc');
                if (el) el.textContent = settings.footerDesc;
            }
            if (settings.logoText && settings.logoText.trim()) {
                document.querySelectorAll('.logo, .footer-logo').forEach(el => {
                    el.innerHTML = `<i class="fas fa-crown"></i> ${settings.logoText}<span>.</span>`;
                });
            }
            if (settings.copyright && settings.copyright.trim()) {
                const el = document.querySelector('.footer-bottom p');
                if (el) el.innerHTML = settings.copyright;
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

        }); // settings listener sonu

        // --- NAVBAR LINKLERi ---
        db.ref('cms/navlinks').on('value', (snapshot) => {
            const navbarLinks = snapshot.val();
            if (navbarLinks && navbarLinks.length > 0) {
                const navUl = document.querySelector('.nav-links');
                const mobileNavUl = document.querySelector('.mobile-nav-links');
                if (navUl) {
                    navUl.innerHTML = navbarLinks.map((l, i) =>
                        `<li><a href="${l.href}" class="nav-link${i === 0 ? ' active' : ''}">${l.label}</a></li>`
                    ).join('');
                }
                if (mobileNavUl) {
                    mobileNavUl.innerHTML = navbarLinks.map(l =>
                        `<li><a href="${l.href}">${l.label}</a></li>`
                    ).join('');
                }
            }

        }); // navlinks listener sonu

        // --- GALERi ---
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
                        <img src="${item.url}" alt="${item.alt || 'Galeri ' + (i + 1)}">
                        <div class="gallery-overlay"><i class="fas fa-search-plus"></i></div>
                    </div>`;
                    }).join('');
                }
            }

        }); // gallery listener sonu

        // --- MENU ---
        db.ref('cms/menu').on('value', (snapshot) => {
            const customMenu = snapshot.val();
            if (customMenu && customMenu.length > 0) {
                const menuGrid = document.getElementById('menu-grid');
                if (menuGrid) {
                    menuGrid.innerHTML = '';
                    customMenu.forEach(item => {
                        const badgeHtml = item.badge ? `<div class="menu-badge${item.badge === 'Yeni' ? ' hot' : ''}">${item.badge}</div>` : '';
                        menuGrid.innerHTML += `
                    <div class="menu-item menu-card fade-in-up is-visible" data-category="${item.category}">
                        <div class="menu-img">
                            <img src="${item.img}" alt="${item.name}">
                            ${badgeHtml}
                        </div>
                        <div class="menu-content">
                            <div class="menu-title-row">
                                <h3>${item.name}</h3>
                                <span class="price">&#8378;${item.price}</span>
                            </div>
                            <p class="menu-desc">${item.desc}</p>
                            <button class="btn-add-cart" onclick="addToCart('${item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;")}', '${item.price}')"><i class="fas fa-plus"></i> Siparis Ekle</button>
                        </div>
                    </div>`;
                    });
                }
            }
        }); // menu listener sonu
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
    // 2. NAVBAR VE MOBiL MENU
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
    // 4. MENU FiLTRELEME
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
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            item.classList.add('hide');
                        }
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
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });
        animatedElements.forEach(el => scrollObserver.observe(el));
    } else if (animatedElements.length > 0) {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // Galeri lightbox (dinamik icin)
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
    // 6. REZERVASYON SiSTEMi
    // ==========================================
    const resForm = document.getElementById('reservation-form');
    const formMessage = document.getElementById('form-message');

    if (resForm && formMessage) {
        resForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = resForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Isleniyor...';
            btn.disabled = true;

            const newRes = {
                name: document.getElementById('res-name').value,
                phone: document.getElementById('res-phone').value,
                date: document.getElementById('res-date').value,
                time: document.getElementById('res-time').value,
                guests: document.getElementById('res-guests').value,
                note: document.getElementById('res-note').value || "Yok",
                timestamp: new Date().getTime()
            };

            setTimeout(() => {
                db.ref('cms/reservations').push(newRes)
                    .then(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        formMessage.innerText = "Rezervasyonunuz alındı! Yöneticimiz onaylayacaktır.";
                        formMessage.className = "form-message success";
                        formMessage.style.display = 'block';
                        resForm.reset();
                        setTimeout(() => { formMessage.style.display = 'none'; }, 5000);
                    })
                    .catch(err => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        formMessage.innerText = "Hata: Firebase bağlantısı sağlanamadı. Lütfen veritabanı kurallarını (Rules) kontrol edin.";
                        formMessage.className = "form-message error";
                        formMessage.style.display = 'block';
                        console.error("Firebase yazma hatası:", err);
                    });
            }, 1500);
        });
    }

    // ==========================================
    // 7. YASAL POLiTiKA MODALLARI
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
    // 8. SCROLL TO TOP
    // ==========================================
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) scrollTopBtn.classList.add('show');
            else scrollTopBtn.classList.remove('show');
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});