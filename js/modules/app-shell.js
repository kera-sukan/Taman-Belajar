// File: js/modules/app-shell.js | Build: V 0.06.11.24.2146
let activeTab = 'beranda';
let isQuickMenuOpen = false;
let toastTimer = null;
let confirmCallback = null;

function tbGetAppVersion() {
  return window.TB_APP_VERSION || 'V 0.06.11.24.2146';
}

function applyAppVersionLabels() {
  const v = tbGetAppVersion();
  document.title = `Taman Belajar (${v})`;
  document.querySelectorAll('.app-version-label').forEach(el => {
    el.textContent = v;
  });
}

function showToast(msg, type) {
  const slot = document.getElementById('slot-toast-confirm');
  if (!slot) return;
  let box = document.getElementById('tb-toast-box');
  if (!box) {
    slot.insertAdjacentHTML('beforeend', `
      <div id="tb-toast-box" class="hidden fixed top-4 left-1/2 -translate-x-1/2 z-[70] max-w-xs w-[90%] px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl text-center transition-all"></div>
    `);
    box = document.getElementById('tb-toast-box');
  }
  box.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[70] max-w-xs w-[90%] px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xl text-center transition-all ' +
    (type === 'error' ? 'bg-rose-600' : type === 'warn' ? 'bg-amber-600' : 'bg-slate-900/90');
  box.textContent = msg;
  box.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    box.classList.add('hidden');
  }, 2400);
}

function showConfirm(message, onYes) {
  const slot = document.getElementById('slot-toast-confirm');
  if (!slot) {
    if (typeof onYes === 'function') onYes();
    return;
  }
  confirmCallback = onYes;
  let modal = document.getElementById('tb-confirm-modal');
  if (!modal) {
    slot.insertAdjacentHTML('beforeend', `
      <div id="tb-confirm-modal" class="hidden fixed inset-0 z-[75] bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="liquid-glass-strong w-full max-w-xs rounded-3xl p-5 space-y-4 text-center">
          <p id="tb-confirm-text" class="text-xs font-bold text-slate-800 leading-relaxed"></p>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="closeConfirmModal(false)" class="py-2 rounded-xl bg-white/80 text-slate-700 text-xs font-bold border border-slate-200">Batal</button>
            <button type="button" onclick="closeConfirmModal(true)" class="py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm">Ya, Lanjutkan</button>
          </div>
        </div>
      </div>
    `);
    modal = document.getElementById('tb-confirm-modal');
  }
  document.getElementById('tb-confirm-text').textContent = message;
  modal.classList.remove('hidden');
}

function closeConfirmModal(confirmed) {
  const modal = document.getElementById('tb-confirm-modal');
  if (modal) modal.classList.add('hidden');
  const cb = confirmCallback;
  confirmCallback = null;
  if (confirmed && typeof cb === 'function') cb();
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function togglePinVisibility(inputId) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function toggleQuickMenu() {
  isQuickMenuOpen = !isQuickMenuOpen;
  const popup = document.getElementById('quick-action-popup');
  const btn = document.getElementById('dock-plus-btn');
  if (popup) popup.classList.toggle('open', isQuickMenuOpen);
  if (btn) btn.classList.toggle('open', isQuickMenuOpen);
}

function closeQuickMenu() {
  isQuickMenuOpen = false;
  const popup = document.getElementById('quick-action-popup');
  const btn = document.getElementById('dock-plus-btn');
  if (popup) popup.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

function quickLaunch(target) {
  closeQuickMenu();
  if (target === 'mengaji') {
    if (!hasModuleAccess('mengaji')) return showToast('Akses Mengaji tidak aktif.', 'warn');
    switchTab('mengaji');
    if (typeof openMengajiModal === 'function') openMengajiModal();
  } else if (target === 'les') {
    if (!hasModuleAccess('les')) return showToast('Akses Les tidak aktif.', 'warn');
    switchTab('les');
    if (typeof openLesModal === 'function') openLesModal();
  } else if (target === 'hadir') {
    if (!hasModuleAccess('hadir')) return showToast('Akses Kehadiran tidak aktif.', 'warn');
    switchTab('hadir');
  } else if (target === 'doc') {
    if (!hasModuleAccess('dokumentasi')) return showToast('Akses Dokumentasi tidak aktif.', 'warn');
    switchTab('beranda');
    if (typeof openDocModal === 'function') openDocModal();
  }
}

function onMainScrollRefract(el) {
  const wave = document.getElementById('capsule-wave-layer');
  if (!wave || !el) return;
  const shift = Math.max(-28, Math.min(28, (el.scrollTop % 120) - 30));
  wave.style.transform = `translateX(${shift}px)`;
}

function formatIndoDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function updateDateLabels() {
  const ds = window.TBStore.activeDate;
  const todayStr = new Date().toISOString().slice(0, 10);
  const picker = document.getElementById('date-picker');
  if (picker && picker.value !== ds) picker.value = ds;

  const shortEl = document.getElementById('short-date-label');
  const fullEl = document.getElementById('active-date-label');
  if (shortEl) shortEl.textContent = ds === todayStr ? 'Hari Ini' : ds.slice(5);
  if (fullEl) fullEl.textContent = formatIndoDate(ds);
}

function changeActiveDate(newDateStr) {
  if (!newDateStr) return;
  window.TBStore.activeDate = newDateStr;
  updateDateLabels();
  renderAllViews();
}

function stepActiveDate(deltaDays) {
  const cur = window.TBStore.activeDate || new Date().toISOString().slice(0, 10);
  const p = cur.split('-');
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + deltaDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  changeActiveDate(`${yyyy}-${mm}-${dd}`);
}

function switchTab(tabName) {
  closeQuickMenu();
  activeTab = tabName;

  const tabs = ['beranda', 'murid', 'hadir', 'mengaji', 'les', 'laporan', 'atur'];
  tabs.forEach(t => {
    const sec = document.getElementById('view-' + t);
    if (sec) sec.classList.toggle('hidden', t !== tabName);
  });

  document.querySelectorAll('.capsule-dock .dock-item').forEach(btn => {
    const nav = btn.getAttribute('data-nav');
    let isAct = nav === tabName;
    if (nav === 'les' && (tabName === 'les' || tabName === 'mengaji' || tabName === 'hadir')) isAct = true;
    btn.classList.toggle('active', isAct);
  });

  const mainArea = document.getElementById('main-scroll-area');
  if (mainArea) mainArea.scrollTop = 0;

  renderAllViews();
}

function openModule(modKey) {
  if (!hasModuleAccess(modKey)) {
    showToast('Menu ini belum diaktifkan untuk akun Anda.', 'warn');
    return;
  }
  switchTab(modKey);
}

function updatePendingIndicators() {
  const pendingCount = (window.TBStore.db.accounts || []).filter(a => a.status === 'pending').length;
  const showDot = isSuperAdmin() && pendingCount > 0;

  const dot = document.getElementById('header-pending-dot');
  if (dot) dot.classList.toggle('hidden', !showDot);

  const banner = document.getElementById('admin-pending-banner');
  const bannerText = document.getElementById('admin-pending-text');
  if (banner) banner.classList.toggle('hidden', !showDot);
  if (bannerText) bannerText.textContent = `${pendingCount} pendaftar baru menunggu izin`;

  const badge = document.getElementById('pending-badge-count');
  if (badge) badge.textContent = String(pendingCount);
}

function applyModuleVisibility() {
  const map = [
    { key: 'les', ids: ['tile-les'] },
    { key: 'mengaji', ids: ['tile-mengaji'] },
    { key: 'hadir', ids: ['tile-hadir'] },
    { key: 'laporan', ids: ['tile-laporan'] },
    { key: 'dokumentasi', ids: ['btn-add-doc'] }
  ];
  map.forEach(item => {
    const allowed = hasModuleAccess(item.key);
    item.ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('opacity-45', !allowed);
      }
    });
  });
}

function applyAuthUI() {
  const u = window.TBStore.currentUser;
  const loginScreen = document.getElementById('login-screen');
  if (!u) {
    if (loginScreen) loginScreen.classList.remove('hidden');
    return;
  }
  if (loginScreen) loginScreen.classList.add('hidden');

  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.textContent = u.name || u.username || 'User';

  const roleBadge = document.getElementById('role-badge');
  const heroTitle = document.getElementById('hero-card-title');
  const heroSub = document.getElementById('hero-card-sub');
  const heroBtnTxt = document.getElementById('hero-detail-btn-text');
  const muridLabel = document.getElementById('stat-murid-label');

  if (isSuperAdmin()) {
    if (roleBadge) roleBadge.textContent = 'Admin';
    if (heroTitle) heroTitle.textContent = 'Taman Belajar';
    if (heroSub) heroSub.textContent = 'Program Mengaji & Les Bimbel';
    if (heroBtnTxt) heroBtnTxt.textContent = 'Lihat Detail Murid';
    if (muridLabel) muridLabel.textContent = 'Murid';
  } else if (isGuru()) {
    if (roleBadge) roleBadge.textContent = 'Guru';
    if (heroTitle) heroTitle.textContent = 'Taman Belajar';
    if (heroSub) heroSub.textContent = 'Portal Pengajar & Penilaian';
    if (heroBtnTxt) heroBtnTxt.textContent = 'Lihat Detail Murid';
    if (muridLabel) muridLabel.textContent = 'Murid';
  } else {
    const kids = getAccessibleMurid();
    const kidName = kids[0] ? kids[0].name : (u.name || 'Anak');
    if (roleBadge) roleBadge.textContent = 'Orang Tua';
    if (heroTitle) heroTitle.textContent = kidName;
    if (heroSub) heroSub.textContent = kids[0] ? `${kids[0].program} • ${kids[0].kelas || '-'}` : 'Pantau Perkembangan Anak';
    if (heroBtnTxt) heroBtnTxt.textContent = 'Profil Anak';
    if (muridLabel) muridLabel.textContent = 'Profil';
  }

  const writeAllowed = canWrite();
  ['btn-add-murid', 'btn-hadir-semua', 'btn-add-mengaji', 'btn-add-les', 'btn-add-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !writeAllowed);
  });

  const adminPanel = document.getElementById('admin-approval-panel');
  const accPanel = document.getElementById('superadmin-account-panel');
  const backupPanel = document.getElementById('backup-panel');
  if (adminPanel) adminPanel.classList.toggle('hidden', !isSuperAdmin());
  if (accPanel) accPanel.classList.toggle('hidden', !isSuperAdmin());
  if (backupPanel) backupPanel.classList.toggle('hidden', !isSuperAdmin());

  applyModuleVisibility();
  updatePendingIndicators();
  updateDateLabels();
  renderAllViews();
}

function renderAllViews() {
  if (!window.TBStore.currentUser) return;
  updatePendingIndicators();
  if (typeof renderBeranda === 'function') renderBeranda();
  if (typeof renderMuridList === 'function') renderMuridList();
  if (typeof renderHadirList === 'function') renderHadirList();
  if (typeof renderMengajiList === 'function') renderMengajiList();
  if (typeof renderLesList === 'function') renderLesList();
  if (typeof renderReportOptionsAndPreview === 'function') renderReportOptionsAndPreview();
  if (typeof renderSettingsAndAccounts === 'function') renderSettingsAndAccounts();
}

function tbInitApp() {
  applyAppVersionLabels();
  updateDateLabels();
  tbRegisterListener(() => {
    if (window.TBStore.currentUser) {
      const fresh = (window.TBStore.db.accounts || []).find(a => a.id === window.TBStore.currentUser.id);
      if (fresh && fresh.status !== 'pending') {
        window.TBStore.currentUser = { ...fresh };
        tbSafeSetSession(TB_SESSION_KEY, JSON.stringify(window.TBStore.currentUser));
      }
      applyAuthUI();
    }
  });

  if (window.TBStore.currentUser) {
    applyAuthUI();
  } else {
    switchAuthMode('login');
  }

  tbPullFromCloud();
  setInterval(() => {
    if (window.TBStore.currentUser) tbPullFromCloud();
  }, 15000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tbInitApp);
} else {
  tbInitApp();
}
