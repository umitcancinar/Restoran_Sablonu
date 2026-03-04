/**
 * RESTAURANT YÖNETİM - ADMIN ENGINE v2.0 (FIREBASE)
 * Mimar: Umitcan Cinar
 */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // 1. AUTH
    // ========================================
    const loginOverlay = document.getElementById('login-overlay');
    const adminDash = document.getElementById('admin-dashboard');
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    function showDashboard() {
        loginOverlay.classList.remove('active');
        setTimeout(() => loginOverlay.classList.add('hidden'), 400);
        adminDash.classList.remove('hidden');
        initDashboard();
    }

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            showDashboard();
        } else {
            adminDash.classList.add('hidden');
            loginOverlay.classList.remove('hidden');
            setTimeout(() => { loginOverlay.classList.add('active'); }, 10);
            emailInput.value = '';
            passInput.value = '';
        }
    });

    loginBtn.addEventListener('click', handleLogin);
    passInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });

    function handleLogin() {
        const user = emailInput.value.trim();
        const pass = passInput.value.trim();
        errorMsg.textContent = 'Giriş yapılıyor...';
        firebase.auth().signInWithEmailAndPassword(user, pass)
            .then(() => {
                errorMsg.textContent = '';
            })
            .catch(error => {
                errorMsg.textContent = 'Hatalı e-posta veya şifre!';
                document.querySelector('.login-box').classList.add('shake');
                setTimeout(() => document.querySelector('.login-box').classList.remove('shake'), 500);
            });
    }

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut();
    });

    // ========================================
    // 2. PANEL NAVIGATION
    // ========================================
    const panelNames = {
        'panel-overview': 'Özet Tablo',
        'panel-reservations': 'Rezervasyonlar',
        'panel-orders': 'Siparişler',
        'panel-navbar': 'Navigasyon Menüsü',
        'panel-hero': 'Ana Ekran (Hero)',
        'panel-about': 'Hakkımızda',
        'panel-menu': 'Menü Yönetimi',
        'panel-gallery': 'Galeri',
        'panel-promo': 'Kampanya',
        'panel-contact': 'İletişim Bilgileri',
        'panel-footer': 'Footer & Sosyal Medya',
        'panel-general': 'Genel Ayarlar'
    };

    function switchPanel(panelId) {
        document.querySelectorAll('.panel').forEach(p => {
            p.classList.remove('active');
            p.classList.add('hidden');
        });
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const target = document.getElementById(panelId);
        if (target) {
            target.classList.remove('hidden');
            setTimeout(() => target.classList.add('active'), 10);
        }
        const navItem = document.querySelector(`.nav-item[data-panel="${panelId}"]`);
        if (navItem) navItem.classList.add('active');

        const nameEl = document.getElementById('current-panel-name');
        if (nameEl) nameEl.textContent = panelNames[panelId] || panelId;

        document.getElementById('sidebar').classList.remove('mobile-open');
    }

    document.querySelectorAll('[data-panel]').forEach(el => {
        el.addEventListener('click', () => switchPanel(el.getAttribute('data-panel')));
    });

    document.getElementById('mobile-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    document.getElementById('sidebar-collapse-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // ========================================
    // 3. TOAST & MODAL
    // ========================================
    function showToast(msg, type = 'success') {
        const toast = document.getElementById('admin-toast');
        const icon = toast.querySelector('i');
        document.getElementById('toast-text').textContent = msg;
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        toast.className = `admin-toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function showConfirm(title, message) {
        return new Promise(resolve => {
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            const modal = document.getElementById('confirm-modal');
            modal.classList.remove('hidden');
            document.getElementById('confirm-yes').onclick = () => { modal.classList.add('hidden'); resolve(true); };
            document.getElementById('confirm-no').onclick = () => { modal.classList.add('hidden'); resolve(false); };
        });
    }

    // ========================================
    // 5. FIREBASE STATE & INIT
    // ========================================
    let appState = {
        settings: {}, res: {}, orders: {}, nav: [], menu: [], gallery: []
    };

    function initDashboard() {
        if (typeof db === 'undefined') return; // Ensure Firebase is initialized

        db.ref('cms/settings').on('value', snap => {
            appState.settings = snap.val() || {};
            loadHeroForm(); loadAboutForm(); loadPromoForm(); loadContactForm(); loadFooterForm(); loadGeneralForm();
        });
        db.ref('cms/reservations').on('value', snap => {
            appState.res = snap.val() || {};
            loadReservations(); loadStats();
        });
        db.ref('cms/orders').on('value', snap => {
            appState.orders = snap.val() || {};
            loadOrders(); loadStats();
        });
        db.ref('cms/navlinks').on('value', snap => {
            appState.nav = snap.val() || defaultNavLinks;
            loadNavLinks(); loadStats();
        });
        db.ref('cms/menu').on('value', snap => {
            appState.menu = snap.val() || [];
            loadMenuList(); loadStats();
        });
        db.ref('cms/gallery').on('value', snap => {
            appState.gallery = snap.val() || defaultGallery;
            loadGallery(); loadStats();
        });
    }

    // ========================================
    // 6. STATS
    // ========================================

    // XSS escape helper (admin render layer)
    function esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function loadStats() {
        const resArr = Object.values(appState.res);
        const ordersArr = Object.values(appState.orders);
        const menuCount = appState.menu.length;
        const galCount = appState.gallery.length;
        const navCount = appState.nav.length;

        document.getElementById('stat-res-count').textContent = resArr.length;
        document.getElementById('stat-menu-count').textContent = menuCount > 0 ? menuCount : 3;
        document.getElementById('stat-gallery-count').textContent = galCount > 0 ? galCount : 5;
        document.getElementById('stat-nav-count').textContent = navCount > 0 ? navCount : 5;

        const badge = document.getElementById('res-badge');
        if (badge) badge.textContent = resArr.length;

        const ordersBadge = document.getElementById('orders-badge');
        if (ordersBadge) ordersBadge.textContent = ordersArr.length;

        const recentEl = document.getElementById('recent-reservations');
        if (recentEl) {
            if (resArr.length === 0) {
                recentEl.innerHTML = '<p class="empty-state">Henüz rezervasyon yok.</p>';
            } else {
                const last3 = resArr.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
                recentEl.innerHTML = last3.map(r => `
                    <div class="recent-res-item">
                        <div class="recent-res-info">
                            <strong>${esc(r.name)}</strong>
                            <span>${esc(r.date)} ${esc(r.time)} — ${esc(r.guests)} kişi</span>
                        </div>
                        <span class="status-badge">Bekliyor</span>
                    </div>
                `).join('');
            }
        }
    }

    // ========================================
    // 7. RESERVATIONS
    // ========================================
    function loadReservations() {
        const tbody = document.getElementById('reservations-tbody');
        const resEntries = Object.entries(appState.res).sort((a, b) => b[1].timestamp - a[1].timestamp);

        if (resEntries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Henüz rezervasyon bulunmuyor.</td></tr>`;
            return;
        }
        tbody.innerHTML = resEntries.map(([key, r]) => `
            <tr>
                <td><strong>${esc(r.date)}</strong><br>${esc(r.time)}</td>
                <td>${esc(r.name)}</td>
                <td>${esc(r.phone)}</td>
                <td>${esc(r.guests)}</td>
                <td>${esc(r.note)}</td>
                <td><span class="status-badge">Bekliyor</span></td>
                <td>
                    <button class="btn-icon-danger" onclick="deleteReservation('${esc(key)}')" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.deleteReservation = async (key) => {
        const ok = await showConfirm('Rezervasyonu Sil', 'Bu rezervasyonu silmek istediğinize emin misiniz?');
        if (!ok) return;
        db.ref('cms/reservations/' + key).remove();
        showToast('Rezervasyon silindi!');
    };

    document.getElementById('clear-res-btn').addEventListener('click', async () => {
        const ok = await showConfirm('Tüm Geçmişi Temizle', 'Tüm rezervasyon verilerini silmek istediğinize emin misiniz?');
        if (!ok) return;
        db.ref('cms/reservations').remove();
        showToast('Geçmiş temizlendi!');
    });

    // ========================================
    // 7.5. ORDERS
    // ========================================
    function loadOrders() {
        const tbody = document.getElementById('orders-tbody');
        if (!tbody) return;
        const ordersEntries = Object.entries(appState.orders).sort((a, b) => b[1].timestamp - a[1].timestamp);

        if (ordersEntries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Henüz sipariş bulunmuyor.</td></tr>`;
            return;
        }
        tbody.innerHTML = ordersEntries.map(([key, o]) => `
            <tr>
                <td><strong>${esc(o.date)}</strong><br>${esc(o.time)}</td>
                <td>${esc(o.customerName)}</td>
                <td>${esc(o.customerPhone)}</td>
                <td>₺${esc(o.totalPrice)}</td>
                <td><small>${Array.isArray(o.items) ? o.items.map(i => esc(i.name) + ' (x' + esc(i.quantity) + ')').join(', ') : ''}</small></td>
                <td><span class="status-badge">Hazırlanıyor</span></td>
                <td>
                    <button class="btn-icon-danger" onclick="deleteOrder('${esc(key)}')" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.deleteOrder = async (key) => {
        const ok = await showConfirm('Siparişi Sil', 'Bu siparişi silmek istediğinize emin misiniz?');
        if (!ok) return;
        db.ref('cms/orders/' + key).remove();
        showToast('Sipariş silindi!');
    };

    const clearOrdersBtn = document.getElementById('clear-orders-btn');
    if (clearOrdersBtn) {
        clearOrdersBtn.addEventListener('click', async () => {
            const ok = await showConfirm('Tüm Geçmişi Temizle', 'Tüm sipariş verilerini silmek istediğinize emin misiniz?');
            if (!ok) return;
            db.ref('cms/orders').remove();
            showToast('Sipariş geçmişi temizlendi!');
        });
    }

    // ========================================
    // 8. NAVBAR LINKS
    // ========================================
    const defaultNavLinks = [
        { label: 'Ana Sayfa', href: '#hero' },
        { label: 'Hakkımızda', href: '#about' },
        { label: 'Menü', href: '#menu' },
        { label: 'Galeri', href: '#gallery' },
        { label: 'Rezervasyon', href: '#reservation' }
    ];

    function loadNavLinks() {
        const links = appState.nav;
        const ul = document.getElementById('nav-list');
        ul.innerHTML = links.map((l, i) => `
            <li class="sortable-item" draggable="true" data-index="${i}">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <span class="item-label">${esc(l.label)}</span>
                <span class="item-sub" title="${esc(l.href)}">${esc(l.href)}</span>
                <div class="item-actions">
                    <button class="btn-icon-edit nav-edit-btn" data-idx="${i}" title="Düzenle"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-icon-danger nav-delete-btn" data-idx="${i}" title="Sil"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `).join('');
        initDragSort(ul, 'navlinks', defaultNavLinks);

        // Event delegation: attach once on the list container
        ul.onclick = (e) => {
            const editBtn = e.target.closest('.nav-edit-btn');
            const delBtn = e.target.closest('.nav-delete-btn');
            if (editBtn) editNavLink(parseInt(editBtn.dataset.idx));
            if (delBtn) deleteNavLink(parseInt(delBtn.dataset.idx));
        };
    }

    document.getElementById('add-nav-btn').addEventListener('click', () => {
        const label = document.getElementById('nav-label').value.trim();
        const href = document.getElementById('nav-href').value.trim();
        if (!label || !href) { showToast('Başlık ve bağlantı gerekli!', 'error'); return; }
        const links = [...appState.nav];
        links.push({ label, href });
        db.ref('cms/navlinks').set(links);
        document.getElementById('nav-label').value = '';
        document.getElementById('nav-href').value = '';
        showToast('Menüye eklendi!');
    });

    // Save button for nav (manual save not strictly needed since add/delete auto-saves, but kept for UX)
    const saveNavBtn = document.getElementById('save-nav-btn');
    if (saveNavBtn) {
        saveNavBtn.addEventListener('click', () => {
            db.ref('cms/navlinks').set(appState.nav);
            showToast('Navigasyon kaydedildi!');
        });
    }

    function deleteNavLink(i) {
        showConfirm('Linki Sil', 'Bu menü linkini silmek istediğinize emin misiniz?').then(ok => {
            if (!ok) return;
            const links = [...appState.nav];
            links.splice(i, 1);
            db.ref('cms/navlinks').set(links);
            showToast('Link silindi!');
        });
    }

    function editNavLink(i) {
        const l = appState.nav[i];
        showEditModal('Linki Düzenle', `
            <div class="form-field">
                <label>Başlık</label>
                <input type="text" id="em-nav-label" class="field-input">
            </div>
            <div class="form-field">
                <label>Bağlantı</label>
                <input type="text" id="em-nav-href" class="field-input">
            </div>
        `, () => {
            const links = [...appState.nav];
            links[i].label = document.getElementById('em-nav-label').value.trim();
            links[i].href = document.getElementById('em-nav-href').value.trim();
            db.ref('cms/navlinks').set(links);
            showToast('Link güncellendi!');
        });
        // Set values safely via JS (not via HTML attribute) to avoid XSS / encoding issues
        setTimeout(() => {
            const labelInput = document.getElementById('em-nav-label');
            const hrefInput = document.getElementById('em-nav-href');
            if (labelInput) labelInput.value = l.label;
            if (hrefInput) hrefInput.value = l.href;
        }, 0);
    }

    // ========================================
    // 9. HERO
    // ========================================
    function loadHeroForm() {
        const s = appState.settings;
        setValue('cms-hero-sub', s.heroSub);
        setValue('cms-hero-title', s.heroTitle);
        setValue('cms-hero-desc', s.heroDesc);
        setValue('cms-hero-btn1', s.heroBtnPrimary);
        setValue('cms-hero-btn2', s.heroBtnSecondary);
        setValue('cms-hero-bg', s.heroBg);
        if (s.heroBg) updateImgPreview('hero-bg-preview', s.heroBg);
    }

    document.getElementById('preview-hero-bg-btn').addEventListener('click', () => {
        updateImgPreview('hero-bg-preview', v('cms-hero-bg'));
    });

    document.getElementById('save-hero-btn').addEventListener('click', () => {
        updateSettings({
            heroSub: v('cms-hero-sub'),
            heroTitle: v('cms-hero-title'),
            heroDesc: v('cms-hero-desc'),
            heroBtnPrimary: v('cms-hero-btn1'),
            heroBtnSecondary: v('cms-hero-btn2'),
            heroBg: v('cms-hero-bg')
        });
        showToast('Hero bölümü kaydedildi!');
    });

    // ========================================
    // 10. ABOUT
    // ========================================
    function loadAboutForm() {
        const s = appState.settings;
        setValue('cms-about-title', s.aboutTitle);
        setValue('cms-about-desc', s.aboutDesc);
        setValue('cms-about-years', s.aboutYears);
        setValue('cms-about-f1', s.aboutFeature1);
        setValue('cms-about-f2', s.aboutFeature2);
        setValue('cms-about-f3', s.aboutFeature3);
        setValue('cms-about-img', s.aboutImg);
        setValue('cms-about-img2', s.aboutImg2);
        if (s.aboutImg) updateImgPreview('about-img1-preview', s.aboutImg, true);
        if (s.aboutImg2) updateImgPreview('about-img2-preview', s.aboutImg2, true);
    }

    ['cms-about-img', 'cms-about-img2'].forEach(id => {
        document.getElementById(id).addEventListener('blur', function () {
            const previewId = id === 'cms-about-img' ? 'about-img1-preview' : 'about-img2-preview';
            if (this.value.trim()) updateImgPreview(previewId, this.value.trim(), true);
        });
    });

    document.getElementById('save-about-btn').addEventListener('click', () => {
        updateSettings({
            aboutTitle: v('cms-about-title'),
            aboutDesc: v('cms-about-desc'),
            aboutYears: v('cms-about-years'),
            aboutFeature1: v('cms-about-f1'),
            aboutFeature2: v('cms-about-f2'),
            aboutFeature3: v('cms-about-f3'),
            aboutImg: v('cms-about-img'),
            aboutImg2: v('cms-about-img2')
        });
        showToast('Hakkımızda bölümü kaydedildi!');
    });

    // ========================================
    // 11. MENU
    // ========================================
    function loadMenuList() {
        const menu = appState.menu;
        const ul = document.getElementById('menu-sortable-list');
        const catLabels = { starters: 'Başlangıç', mains: 'Ana Yemek', desserts: 'Tatlı', drinks: 'İçecek' };

        if (menu.length === 0) {
            ul.innerHTML = '<li class="empty-state">Henüz özel menü yok. Sitede varsayılanlar görünüyor.</li>';
            return;
        }

        ul.innerHTML = menu.map((item, i) => `
            <li class="sortable-item menu-item-row" draggable="true" data-index="${i}">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <img class="menu-thumb" src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/40'">
                <div class="item-info">
                    <span class="item-label">${item.name}</span>
                    <span class="item-sub">${catLabels[item.category] || item.category} — ₺${item.price}</span>
                </div>
                ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
                <div class="item-actions">
                    <button class="btn-icon-edit" onclick="editMenuItem(${i})" title="Düzenle"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-icon-danger" onclick="deleteMenuItem(${i})" title="Sil"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `).join('');
        initDragSort(ul, 'menu', []);
    }

    document.getElementById('add-menu-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            name: v('menu-name'),
            category: v('menu-cat'),
            price: v('menu-price'),
            img: v('menu-img'),
            desc: v('menu-desc'),
            badge: v('menu-badge')
        };
        const menu = [...appState.menu];
        menu.push(newItem);
        db.ref('cms/menu').set(menu);
        e.target.reset();
        showToast('Menüye ürün eklendi!');
    });

    document.getElementById('reset-menu-btn').addEventListener('click', async () => {
        const ok = await showConfirm('Menüyü Sıfırla', 'Özel menü silinecek ve site varsayılan ürünleri gösterecek. Emin misiniz?');
        if (!ok) return;
        db.ref('cms/menu').remove();
        showToast('Menü sıfırlandı!');
    });

    window.deleteMenuItem = async (i) => {
        const ok = await showConfirm('Ürünü Sil', 'Bu menü ürününü silmek istediğinize emin misiniz?');
        if (!ok) return;
        const menu = [...appState.menu];
        menu.splice(i, 1);
        db.ref('cms/menu').set(menu);
        showToast('Ürün silindi!');
    };

    window.editMenuItem = (i) => {
        const item = appState.menu[i];
        showEditModal('Ürünü Düzenle', `
            <div class="form-field"><label>Ürün Adı</label><input type="text" id="em-mn" class="field-input" value="${item.name}"></div>
            <div class="form-row">
                <div class="form-field">
                    <label>Kategori</label>
                    <select id="em-mc" class="field-input">
                        <option value="starters" ${item.category === 'starters' ? 'selected' : ''}>Başlangıç</option>
                        <option value="mains" ${item.category === 'mains' ? 'selected' : ''}>Ana Yemek</option>
                        <option value="desserts" ${item.category === 'desserts' ? 'selected' : ''}>Tatlı</option>
                        <option value="drinks" ${item.category === 'drinks' ? 'selected' : ''}>İçecek</option>
                    </select>
                </div>
                <div class="form-field"><label>Fiyat</label><input type="number" id="em-mp" class="field-input" value="${item.price}"></div>
            </div>
            <div class="form-field"><label>Görsel URL</label><input type="text" id="em-mi" class="field-input" value="${item.img}"></div>
            <div class="form-field"><label>Açıklama</label><textarea id="em-md" class="field-input field-textarea" rows="2">${item.desc}</textarea></div>
            <div class="form-field">
                <label>Rozet</label>
                <select id="em-mb" class="field-input">
                    <option value="" ${!item.badge ? 'selected' : ''}>Yok</option>
                    <option value="Şefin Tavsiyesi" ${item.badge === 'Şefin Tavsiyesi' ? 'selected' : ''}>Şefin Tavsiyesi</option>
                    <option value="Yeni" ${item.badge === 'Yeni' ? 'selected' : ''}>Yeni</option>
                    <option value="Popüler" ${item.badge === 'Popüler' ? 'selected' : ''}>Popüler</option>
                    <option value="Özel" ${item.badge === 'Özel' ? 'selected' : ''}>Özel</option>
                </select>
            </div>
        `, () => {
            const menu = [...appState.menu];
            menu[i] = { name: v('em-mn'), category: v('em-mc'), price: v('em-mp'), img: v('em-mi'), desc: v('em-md'), badge: v('em-mb') };
            db.ref('cms/menu').set(menu);
            showToast('Ürün güncellendi!');
        });
    };

    // ========================================
    // 12. GALLERY
    // ========================================
    const defaultGallery = [
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', alt: 'Galeri 1' },
        { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', alt: 'Galeri 2' },
        { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', alt: 'Galeri 3' },
        { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', alt: 'Galeri 4' },
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', alt: 'Galeri 5' }
    ];

    function loadGallery() {
        const gallery = appState.gallery;
        const grid = document.getElementById('gallery-admin-grid');
        grid.innerHTML = gallery.map((item, i) => `
            <div class="gallery-admin-item" data-index="${i}">
                <img src="${item.url}" alt="${item.alt}" onerror="this.src='https://via.placeholder.com/200x150?text=Hata'">
                <div class="gallery-item-overlay">
                    <button class="btn-icon-edit" onclick="editGalleryItem(${i})" title="Düzenle"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-icon-danger" onclick="deleteGalleryItem(${i})" title="Sil"><i class="fas fa-trash"></i></button>
                </div>
                <p class="gallery-item-label">${item.alt || 'Görsel ' + (i + 1)}</p>
            </div>
        `).join('');
    }

    document.getElementById('add-gallery-btn').addEventListener('click', () => {
        const url = document.getElementById('gallery-new-url').value.trim();
        const alt = document.getElementById('gallery-new-alt').value.trim() || 'Galeri Görseli';
        if (!url) { showToast('Görsel URL gerekli!', 'error'); return; }
        const gallery = [...appState.gallery];
        gallery.push({ url, alt });
        db.ref('cms/gallery').set(gallery);
        document.getElementById('gallery-new-url').value = '';
        document.getElementById('gallery-new-alt').value = '';
        showToast('Galeri görseli eklendi!');
    });

    window.deleteGalleryItem = async (i) => {
        const ok = await showConfirm('Görseli Sil', 'Bu galeri görselini silmek istediğinize emin misiniz?');
        if (!ok) return;
        const gallery = [...appState.gallery];
        gallery.splice(i, 1);
        db.ref('cms/gallery').set(gallery);
        showToast('Görsel silindi!');
    };

    window.editGalleryItem = (i) => {
        const item = appState.gallery[i];
        showEditModal('Görseli Düzenle', `
            <div class="form-field"><label>Görsel URL</label><input type="text" id="em-gurl" class="field-input" value="${item.url}"></div>
            <div class="form-field"><label>Açıklama (alt)</label><input type="text" id="em-galt" class="field-input" value="${item.alt}"></div>
            <div class="img-preview-sm" id="em-gallery-preview" style="margin-top:8px"></div>
        `, () => {
            const gallery = [...appState.gallery];
            gallery[i] = { url: v('em-gurl'), alt: v('em-galt') };
            db.ref('cms/gallery').set(gallery);
            showToast('Görsel güncellendi!');
        });
        setTimeout(() => {
            const previewInput = document.getElementById('em-gurl');
            if (previewInput) updateImgPreview('em-gallery-preview', previewInput.value, true);
        }, 100);
    };

    // ========================================
    // 13. PROMO
    // ========================================
    function loadPromoForm() {
        setValue('cms-promo-title', appState.settings.promoTitle);
        setValue('cms-promo-desc', appState.settings.promoDesc);
        setValue('cms-promo-btn', appState.settings.promoBtn);
    }

    document.getElementById('save-promo-btn').addEventListener('click', () => {
        updateSettings({ promoTitle: v('cms-promo-title'), promoDesc: v('cms-promo-desc'), promoBtn: v('cms-promo-btn') });
        showToast('Kampanya bölümü kaydedildi!');
    });

    // ========================================
    // 14. CONTACT
    // ========================================
    function loadContactForm() {
        const s = appState.settings;
        setValue('cms-contact-addr', s.contactAddr);
        setValue('cms-contact-phone', s.contactPhone);
        setValue('cms-contact-email', s.contactEmail);
        setValue('cms-contact-hours', s.contactHours);
        const times = s.resTimes || '18:00\n19:00\n20:00\n21:00\n22:00';
        setValue('cms-res-times', times);
    }

    document.getElementById('save-contact-btn').addEventListener('click', () => {
        const timesRaw = v('cms-res-times');
        updateSettings({
            contactAddr: v('cms-contact-addr'),
            contactPhone: v('cms-contact-phone'),
            contactEmail: v('cms-contact-email'),
            contactHours: v('cms-contact-hours'),
            resTimes: timesRaw
        });
        // We do not save to localstorage, just let setting it handle it.
        showToast('İletişim bilgileri kaydedildi!');
    });

    // ========================================
    // 15. FOOTER
    // ========================================
    function loadFooterForm() {
        const s = appState.settings;
        setValue('cms-footer-desc', s.footerDesc);
        setValue('cms-copyright', s.copyright);
        setValue('cms-social-instagram', s.social_instagram);
        setValue('cms-social-twitter', s.social_twitter);
        setValue('cms-social-facebook', s.social_facebook);
        setValue('cms-social-tripadvisor', s.social_tripadvisor);
    }

    document.getElementById('save-footer-btn').addEventListener('click', () => {
        updateSettings({
            footerDesc: v('cms-footer-desc'),
            copyright: v('cms-copyright'),
            social_instagram: v('cms-social-instagram'),
            social_twitter: v('cms-social-twitter'),
            social_facebook: v('cms-social-facebook'),
            social_tripadvisor: v('cms-social-tripadvisor')
        });
        showToast('Footer & sosyal medya kaydedildi!');
    });

    // ========================================
    // 16. GENERAL
    // ========================================
    function loadGeneralForm() {
        setValue('cms-logo-text', appState.settings.logoText);
        setValue('cms-page-title', appState.settings.pageTitle);
    }

    document.getElementById('save-general-btn').addEventListener('click', () => {
        updateSettings({ logoText: v('cms-logo-text'), pageTitle: v('cms-page-title') });
        showToast('Genel ayarlar kaydedildi!');
    });

    document.getElementById('change-pass-btn').addEventListener('click', () => {
        // Since we are moving to hardcoded obfuscated pass, changing it locally won't persist on refresh correctly unless we save somewhere.
        // But for this simulation, we can just save it into settings or session so it works temporarily.
        showToast('Uyarı: Firebase yapısında şifre firebase-config.js içinden manuel değiştirilmelidir.', 'error');
    });

    // ========================================
    // 17. RESET SITE
    // ========================================
    document.getElementById('reset-site-btn').addEventListener('click', async () => {
        const ok = await showConfirm(
            'Siteyi Sıfırla',
            'Tüm özelleştirmeler silinecek ve veritabanı boşaltılacaktır (Rezervasyonlar korunacak). Emin misiniz?'
        );
        if (!ok) return;
        db.ref('cms/settings').remove();
        db.ref('cms/navlinks').remove();
        db.ref('cms/gallery').remove();
        db.ref('cms/menu').remove();
        showToast('Site varsayılanlara sıfırlandı!');
    });

    // ========================================
    // 18. EDIT MODAL
    // ========================================
    let editSaveCallback = null;

    function showEditModal(title, bodyHtml, onSave) {
        document.getElementById('edit-modal-title').textContent = title;
        document.getElementById('edit-modal-body').innerHTML = bodyHtml;
        document.getElementById('edit-modal').classList.remove('hidden');
        editSaveCallback = onSave;
    }

    document.getElementById('edit-modal-save').addEventListener('click', () => {
        if (editSaveCallback) editSaveCallback();
        document.getElementById('edit-modal').classList.add('hidden');
    });

    document.getElementById('edit-modal-cancel').addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
    });

    document.getElementById('edit-modal-close').addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
    });

    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-modal')) {
            document.getElementById('edit-modal').classList.add('hidden');
        }
    });

    // ========================================
    // 19. DRAG & DROP SORTING
    // ========================================
    function initDragSort(ul, storageKey, fallback) {
        let dragSrc = null;

        ul.querySelectorAll('li[draggable]').forEach(item => {
            item.addEventListener('dragstart', function () {
                dragSrc = this;
                this.classList.add('dragging');
            });
            item.addEventListener('dragend', function () {
                this.classList.remove('dragging');
                ul.querySelectorAll('li').forEach(li => li.classList.remove('drag-over'));
                // Save new order to Firebase
                const newOrder = [...ul.querySelectorAll('li[draggable]')].map(li => {
                    const idx = parseInt(li.getAttribute('data-index'));
                    const data = appState[storageKey] || fallback;
                    return data[idx];
                });
                db.ref(`cms/${storageKey}`).set(newOrder);
            });
            item.addEventListener('dragover', function (e) {
                e.preventDefault();
                if (this !== dragSrc) {
                    ul.querySelectorAll('li').forEach(li => li.classList.remove('drag-over'));
                    this.classList.add('drag-over');
                    const items = [...ul.querySelectorAll('li[draggable]')];
                    const srcIdx = items.indexOf(dragSrc);
                    const dstIdx = items.indexOf(this);
                    if (srcIdx < dstIdx) ul.insertBefore(dragSrc, this.nextSibling);
                    else ul.insertBefore(dragSrc, this);
                }
            });
        });
    }

    // ========================================
    // HELPERS
    // ========================================
    function v(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function setValue(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
    }

    function updateSettings(partial) {
        const s = appState.settings;
        Object.assign(s, partial);
        db.ref('cms/settings').set(s);
    }

    function updateImgPreview(containerId, url, small = false) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!url) {
            container.innerHTML = small ? '' : '<i class="fas fa-image"></i><p>Görsel URL gir, önizleme burada görünür</p>';
            return;
        }
        container.innerHTML = `<img src="${url}" alt="Önizleme" onerror="this.parentElement.innerHTML='<p style=\\'color:var(--danger)\\'>Görsel yüklenemedi.</p>'">`;
    }
});