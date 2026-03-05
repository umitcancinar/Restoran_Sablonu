/**
 * MUTFAK PANELİ - KITCHEN ENGINE v1.0
 * Firebase Realtime Database + Auth tabanlı canlı sipariş yönetimi.
 */

document.addEventListener('DOMContentLoaded', () => {

    const loginOverlay = document.getElementById('kitchen-login');
    const dashboard = document.getElementById('kitchen-dashboard');
    const loginBtn = document.getElementById('kitchen-login-btn');
    const emailInput = document.getElementById('kitchen-email');
    const passInput = document.getElementById('kitchen-pass');
    const errorMsg = document.getElementById('kitchen-error');
    const logoutBtn = document.getElementById('kitchen-logout');
    const clockEl = document.getElementById('kitchen-clock');

    // =============================================
    // CLOCK
    // =============================================
    function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // =============================================
    // AUTH — sessionStorage for persistence
    // =============================================
    function showDashboard() {
        loginOverlay.classList.add('hidden');
        dashboard.classList.remove('hidden');
        initOrders();
    }

    function showLogin() {
        loginOverlay.classList.remove('hidden');
        dashboard.classList.add('hidden');
    }

    // Check if already logged in this session
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            showDashboard();
        } else {
            showLogin();
        }
    });

    function handleLogin() {
        const email = emailInput.value.trim();
        const pass = passInput.value.trim();
        if (!email || !pass) { errorMsg.textContent = 'E-posta ve şifre gerekli.'; return; }
        errorMsg.textContent = 'Giriş yapılıyor...';
        loginBtn.disabled = true;

        // firebase.auth().setPersistence keeps session active via localStorage by default
        firebase.auth().signInWithEmailAndPassword(email, pass)
            .then(() => { errorMsg.textContent = ''; })
            .catch(() => {
                errorMsg.textContent = 'Hatalı e-posta veya şifre!';
                loginBtn.disabled = false;
            });
    }

    loginBtn.addEventListener('click', handleLogin);
    passInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut();
    });

    // =============================================
    // XSS helper
    // =============================================
    function esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // =============================================
    // ORDERS — realtime
    // =============================================
    let ordersCache = {};
    let countdownTimers = {};
    let previousOrderKeys = new Set();

    function initOrders() {
        db.ref('cms/orders').on('value', snap => {
            const raw = snap.val() || {};
            const currentKeys = new Set(Object.keys(raw));

            // BUG FIX: capture old set BEFORE reassigning, otherwise isNewOrders is always false
            const isNewOrders = Object.keys(raw).some(k => !previousOrderKeys.has(k));
            previousOrderKeys = currentKeys; // reassign AFTER the check
            ordersCache = raw;

            renderOrders(raw, isNewOrders);
        });
    }

    function renderOrders(orders, hasNew) {
        const colNew = document.getElementById('col-new');
        const colPrep = document.getElementById('col-prep');
        const colServe = document.getElementById('col-serve');

        colNew.innerHTML = '';
        colPrep.innerHTML = '';
        colServe.innerHTML = '';

        let countNew = 0, countPrep = 0, countServe = 0;

        const entries = Object.entries(orders).sort((a, b) => b[1].timestamp - a[1].timestamp);

        if (entries.length === 0) {
            const emptyHtml = `<div class="kitchen-empty"><i class="fas fa-utensils"></i>Henüz sipariş yok.</div>`;
            colNew.innerHTML = emptyHtml;
            colPrep.innerHTML = emptyHtml;
            colServe.innerHTML = emptyHtml;
            updateStats(0, 0, 0);
            return;
        }

        entries.forEach(([key, order]) => {
            const status = order.status || 'siparis_alindi';
            const cardHtml = buildOrderCard(key, order, hasNew && !previousOrderKeys.has(key));

            if (status === 'siparis_alindi') {
                colNew.innerHTML += cardHtml;
                countNew++;
            } else if (status === 'hazirlaniyor') {
                colPrep.innerHTML += cardHtml;
                countPrep++;
            } else if (status === 'serviste') {
                colServe.innerHTML += cardHtml;
                countServe++;
            }
        });

        if (!colNew.innerHTML.trim()) colNew.innerHTML = `<div class="kitchen-empty"><i class="fas fa-check-circle"></i>Bekleme yok.</div>`;
        if (!colPrep.innerHTML.trim()) colPrep.innerHTML = `<div class="kitchen-empty"><i class="fas fa-fire-alt"></i>Hazırlanan sipariş yok.</div>`;
        if (!colServe.innerHTML.trim()) colServe.innerHTML = `<div class="kitchen-empty"><i class="fas fa-concierge-bell"></i>Serviste sipariş yok.</div>`;

        updateStats(countNew, countPrep, countServe);
        startCountdowns();

        if (hasNew && countNew > 0) {
            const indicator = document.getElementById('new-order-indicator');
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 5000);
        }
    }

    function buildOrderCard(key, order, isNew) {
        const status = order.status || 'siparis_alindi';
        const items = Array.isArray(order.items) ? order.items : [];

        // Max wait time
        let maxWait = 0;
        items.forEach(item => {
            const wt = parseInt(item.waitTime || item.wait_time || 0) * (item.quantity || 1);
            if (wt > maxWait) maxWait = wt;
        });

        const elapsed = Math.floor((Date.now() - (order.timestamp || Date.now())) / 1000);
        const waitSec = maxWait * 60;
        const remaining = waitSec - elapsed;

        let countdownHtml = '';
        if (maxWait > 0 && (status === 'siparis_alindi' || status === 'hazirlaniyor')) {
            countdownHtml = `<span class="order-countdown ${remaining <= 0 ? 'done' : ''}" data-key="${esc(key)}" data-wait="${waitSec}" data-ts="${order.timestamp || Date.now()}">
                <i class="fas fa-clock"></i>
                <span class="countdown-val">--:--</span>
            </span>`;
        }

        const itemsHtml = items.map(item => `
            <div class="order-item-row">
                <span class="order-item-name">${esc(item.name)}</span>
                <div class="order-item-meta">
                    ${item.waitTime ? `<span class="wait-time-badge"><i class="fas fa-hourglass-half"></i>${esc(item.waitTime)}dk</span>` : ''}
                    <span class="order-item-qty">x${esc(String(item.quantity || 1))}</span>
                </div>
            </div>
        `).join('');

        // Action buttons based on status
        let actionBtns = '';
        if (status === 'siparis_alindi') {
            actionBtns = `
                <button class="order-action-btn btn-prepare" onclick="kitchenSetStatus('${key}', 'hazirlaniyor')">
                    <i class="fas fa-fire"></i> Hazırlamaya Başla
                </button>
                <button class="order-action-btn btn-del" onclick="kitchenDelete('${key}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (status === 'hazirlaniyor') {
            actionBtns = `
                <button class="order-action-btn btn-serve" onclick="kitchenSetStatus('${key}', 'serviste')">
                    <i class="fas fa-concierge-bell"></i> Servise Gönder
                </button>
                <button class="order-action-btn btn-del" onclick="kitchenDelete('${key}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (status === 'serviste') {
            actionBtns = `
                <button class="order-action-btn btn-del" style="flex:1" onclick="kitchenDelete('${key}')">
                    <i class="fas fa-check"></i> Tamamlandı — Kaldır
                </button>
            `;
        }

        const tableNum = order.tableNumber ? `<span class="order-table-badge"><i class="fas fa-chair"></i> Masa ${esc(String(order.tableNumber))}</span>` : '';

        return `
        <div class="order-card status-${esc(status)} ${isNew ? 'new-ping' : ''}">
            <div class="order-card-top">
                <span class="order-id"><i class="fas fa-hashtag"></i> ${esc(key.slice(-6).toUpperCase())}</span>
                ${tableNum}
            </div>
            <div class="order-customer">
                <h3>${esc(order.customerName || 'Müşteri')}</h3>
                <p><i class="fas fa-phone"></i> ${esc(order.customerPhone || '')}</p>
                <p style="margin-top:2px"><i class="fas fa-clock"></i> ${esc(order.date || '')} ${esc(order.time || '')}</p>
            </div>
            <div class="order-items">${itemsHtml || '<p style="font-size:0.8rem;color:var(--text-muted)">Ürün bilgisi yok.</p>'}</div>
            <div class="order-footer">
                <span class="order-total">₺${esc(String(order.totalPrice || 0))}</span>
                ${countdownHtml}
            </div>
            <div class="order-actions">${actionBtns}</div>
        </div>`;
    }

    function updateStats(n, p, s) {
        document.getElementById('stat-new').textContent = n;
        document.getElementById('stat-prep').textContent = p;
        document.getElementById('stat-serve').textContent = s;
        document.getElementById('badge-new').textContent = n;
        document.getElementById('badge-prep').textContent = p;
        document.getElementById('badge-serve').textContent = s;
    }

    // =============================================
    // COUNTDOWN TIMERS
    // =============================================
    function startCountdowns() {
        // Clear existing
        Object.values(countdownTimers).forEach(t => clearInterval(t));
        countdownTimers = {};

        document.querySelectorAll('.order-countdown').forEach(el => {
            const waitSec = parseInt(el.dataset.wait);
            const ts = parseInt(el.dataset.ts);
            const valEl = el.querySelector('.countdown-val');
            if (!valEl || !waitSec) return;

            function tick() {
                const elapsed = Math.floor((Date.now() - ts) / 1000);
                const remaining = waitSec - elapsed;
                if (remaining <= 0) {
                    valEl.textContent = 'HAZIR!';
                    el.classList.add('done');
                    clearInterval(countdownTimers[el.dataset.key]); // stop timer when done
                    return;
                }
                const m = Math.floor(remaining / 60);
                const s = remaining % 60;
                valEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                el.classList.remove('done');
            }
            tick();
            const id = setInterval(tick, 1000);
            countdownTimers[el.dataset.key] = id;
        });
    }

    // =============================================
    // ACTIONS (global for onclick)
    // =============================================
    window.kitchenSetStatus = (key, newStatus) => {
        db.ref(`cms/orders/${key}/status`).set(newStatus).catch(err => {
            console.error('Durum güncelleme hatası:', err);
        });
    };

    window.kitchenDelete = async (key) => {
        if (!confirm('Bu siparişi kaldırmak istiyor musunuz?')) return;
        db.ref(`cms/orders/${key}`).remove().catch(err => {
            console.error('Silme hatası:', err);
        });
    };
});
