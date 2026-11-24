// File: js/modules/dokumentasi.js | Build: V 0.06.11.24.2151
let pendingDocDataUrl = '';
const DOC_RETENTION_DAYS = 7;

function purgeExpiredDocs() {
  const db = window.TBStore.db;
  if (!Array.isArray(db.docs)) {
    db.docs = [];
    return false;
  }
  const now = Date.now();
  const maxAgeMs = DOC_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const before = db.docs.length;
  db.docs = db.docs.filter(d => {
    const created = Number(d.createdAt || 0);
    if (!created) return true;
    return (now - created) <= maxAgeMs;
  });
  return db.docs.length !== before;
}

function openDocModal() {
  if (!hasModuleAccess('dokumentasi')) {
    return showToast('Akses Dokumentasi Foto tidak aktif untuk akun ini.', 'warn');
  }
  if (!canWrite()) {
    return showToast('Hanya Admin/Guru yang dapat menambah dokumentasi kegiatan.', 'warn');
  }
  pendingDocDataUrl = '';
  const inp = document.getElementById('doc-photo-input');
  const prev = document.getElementById('doc-photo-preview');
  const cap = document.getElementById('doc-caption');
  const dateLbl = document.getElementById('doc-auto-date-label');

  if (inp) inp.value = '';
  if (prev) {
    prev.src = '';
    prev.classList.add('hidden');
  }
  if (cap) cap.value = '';
  if (dateLbl) dateLbl.textContent = formatIndoDate(window.TBStore.activeDate);
  openModal('modal-doc');
}

function compressImageFile(file, maxWidth, quality, cb) {
  const reader = new FileReader();
  reader.onload = function (ev) {
    const img = new Image();
    img.onload = function () {
      const ratio = Math.min(1, (maxWidth || 900) / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * ratio));
      canvas.height = Math.max(1, Math.round(img.height * ratio));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const outUrl = canvas.toDataURL('image/jpeg', quality || 0.72);
      cb(outUrl);
    };
    img.onerror = function () { cb(ev.target.result); };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function previewDocPhoto(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  compressImageFile(file, 900, 0.72, dataUrl => {
    pendingDocDataUrl = dataUrl;
    const prev = document.getElementById('doc-photo-preview');
    if (prev) {
      prev.src = dataUrl;
      prev.classList.remove('hidden');
    }
  });
}

function saveDocForm() {
  if (!canWrite()) return;
  const caption = (document.getElementById('doc-caption')?.value || '').trim();
  if (!pendingDocDataUrl) {
    return showToast('Pilih atau ambil foto kegiatan terlebih dahulu.', 'warn');
  }
  if (!caption) {
    return showToast('Keterangan singkat kegiatan wajib diisi.', 'warn');
  }

  const db = window.TBStore.db;
  if (!Array.isArray(db.docs)) db.docs = [];
  const ds = window.TBStore.activeDate || new Date().toISOString().slice(0, 10);

  db.docs.unshift({
    id: 'doc-' + Date.now(),
    date: ds,
    createdAt: Date.now(),
    caption,
    photoUrl: pendingDocDataUrl,
    author: (window.TBStore.currentUser && window.TBStore.currentUser.name) || 'Admin'
  });

  purgeExpiredDocs();
  pendingDocDataUrl = '';
  closeModal('modal-doc');
  tbPushNode('docs');
  showToast('Dokumentasi foto disimpan (otomatis terhapus setelah 7 hari).');
  renderBerandaDocs();
}

function openDocViewer(docId) {
  const doc = (window.TBStore.db.docs || []).find(d => d.id === docId);
  if (!doc) return;
  const img = document.getElementById('doc-view-img');
  const meta = document.getElementById('doc-view-meta');
  const cap = document.getElementById('doc-view-caption');
  if (img) img.src = doc.photoUrl || '';
  if (meta) meta.textContent = `${formatIndoDate(doc.date)} • ${doc.author || 'Taman Belajar'}`;
  if (cap) cap.textContent = doc.caption || '';
  openModal('modal-doc-view');
}

function deleteDoc(docId) {
  if (!canWrite()) return;
  showConfirm('Hapus foto dokumentasi ini?', () => {
    window.TBStore.db.docs = (window.TBStore.db.docs || []).filter(d => d.id !== docId);
    tbPushNode('docs');
    showToast('Dokumentasi dihapus.');
    renderBerandaDocs();
  });
}

function updateDocCarouselDots() {
  const listEl = document.getElementById('dashboard-doc-list');
  const dotsEl = document.getElementById('doc-dots-indicator');
  if (!listEl || !dotsEl) return;
  const cards = listEl.querySelectorAll('[data-doc-card]');
  if (cards.length <= 1) {
    dotsEl.innerHTML = '';
    return;
  }
  const idx = Math.min(cards.length - 1, Math.max(0, Math.round(listEl.scrollLeft / Math.max(1, cards[0].offsetWidth + 10))));
  dotsEl.innerHTML = Array.from(cards).map((_, i) =>
    `<span class="h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300'}"></span>`
  ).join('');
}

function renderBerandaDocs() {
  const listEl = document.getElementById('dashboard-doc-list');
  const dotsEl = document.getElementById('doc-dots-indicator');
  if (!listEl) return;

  if (!hasModuleAccess('dokumentasi')) {
    listEl.innerHTML = `<div class="w-full p-4 rounded-2xl bg-white/60 text-center text-[11px] text-slate-500">Dokumentasi foto tidak diaktifkan untuk akun ini.</div>`;
    if (dotsEl) dotsEl.innerHTML = '';
    return;
  }

  const changed = purgeExpiredDocs();
  if (changed) tbSaveLocalDB();

  const docs = window.TBStore.db.docs || [];
  if (docs.length === 0) {
    listEl.innerHTML = `<div class="w-full p-4 rounded-2xl bg-white/60 text-center text-[11px] text-slate-500">Belum ada foto dokumentasi kegiatan (maksimal simpan 7 hari).</div>`;
    if (dotsEl) dotsEl.innerHTML = '';
    return;
  }

  const writeAllowed = canWrite();
  listEl.innerHTML = docs.map(d => `
    <div data-doc-card class="shrink-0 w-44 rounded-2xl bg-white/75 border border-white/90 overflow-hidden shadow-xs relative group">
      <img src="${escapeHtml(d.photoUrl)}" alt="${escapeHtml(d.caption)}" onclick="openDocViewer('${escapeHtml(d.id)}')" class="w-full h-24 object-cover cursor-pointer bg-slate-200" />
      ${writeAllowed ? `
        <button type="button" onclick="deleteDoc('${escapeHtml(d.id)}')" aria-label="Hapus Foto" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 text-white text-[10px] font-bold flex items-center justify-center">×</button>
      ` : ''}
      <div class="p-2" onclick="openDocViewer('${escapeHtml(d.id)}')">
        <p class="text-[10.5px] font-bold text-slate-800 truncate">${escapeHtml(d.caption)}</p>
        <p class="text-[9.5px] text-slate-500 mt-0.5">${escapeHtml(d.date || '-')}</p>
      </div>
    </div>
  `).join('');

  updateDocCarouselDots();
}
