// ============================================================================
// TAMAN BELAJAR - MODULE: DOKUMENTASI FOTO KEGIATAN
// ============================================================================

let tbPendingPhotoBase64 = '';

function openDocModal() {
  if (!(canWrite() && hasModuleAccess('dokumentasi'))) {
    showToast('Anda tidak memiliki izin mengunggah dokumentasi foto.', 'warning');
    return;
  }
  tbPendingPhotoBase64 = '';
  document.getElementById('doc-photo-input').value = '';
  document.getElementById('doc-photo-preview').classList.add('hidden');
  document.getElementById('doc-caption').value = '';
  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('doc-auto-date-label').textContent = todayStr;
  document.getElementById('modal-doc').classList.remove('hidden');
}

function previewDocPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 720;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      tbPendingPhotoBase64 = canvas.toDataURL('image/jpeg', 0.72);
      const prev = document.getElementById('doc-photo-preview');
      prev.src = tbPendingPhotoBase64;
      prev.classList.remove('hidden');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveDocForm() {
  const caption = document.getElementById('doc-caption').value.trim();
  if (!tbPendingPhotoBase64) return showToast('Pilih atau ambil foto kegiatan terlebih dahulu.', 'error');
  if (!caption) return showToast('Isi keterangan singkat kegiatan.', 'error');

  const now = new Date();
  window.TBStore.db.docs.unshift({
    id: 'doc-' + Date.now(),
    photo: tbPendingPhotoBase64,
    caption,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    author: window.TBStore.currentUser.name
  });

  tbPushNode('docs');
  closeModal('modal-doc');
  renderDashboardDocs();
  showToast('Dokumentasi kegiatan berhasil ditambahkan!', 'success');
}

function deleteDoc(id) {
  if (!isSuperAdmin()) return;
  showConfirmDialog('Hapus foto dokumentasi ini?', () => {
    window.TBStore.db.docs = window.TBStore.db.docs.filter(d => d.id !== id);
    tbPushNode('docs');
    renderDashboardDocs();
    showToast('Dokumentasi foto dihapus.', 'info');
  });
}

function openDocView(id) {
  const item = window.TBStore.db.docs.find(d => d.id === id);
  if (!item) return;
  document.getElementById('doc-view-img').src = item.photo;
  document.getElementById('doc-view-meta').textContent = `${item.date} • ${item.time || ''} • Oleh: ${item.author}`;
  document.getElementById('doc-view-caption').textContent = item.caption;
  document.getElementById('modal-doc-view').classList.remove('hidden');
}

function updateDocCarouselDots() {
  const listEl = document.getElementById('dashboard-doc-list');
  const dotsEl = document.getElementById('doc-dots-indicator');
  if (!listEl || !dotsEl || !window.TBStore.db) return;
  const docs = window.TBStore.db.docs || [];
  const total = Math.max(1, Math.min(docs.length, 5));
  const maxScroll = Math.max(1, listEl.scrollWidth - listEl.clientWidth);
  const activeIdx = Math.min(total - 1, Math.round((listEl.scrollLeft / maxScroll) * (total - 1)));
  dotsEl.innerHTML = Array.from({ length: total }).map((_, i) =>
    i === activeIdx
      ? '<span class="w-4 h-1.5 rounded-full bg-blue-600 transition-all"></span>'
      : '<span class="w-1.5 h-1.5 rounded-full bg-slate-400/50 transition-all"></span>'
  ).join('');
}

function renderDashboardDocs() {
  const container = document.getElementById('dashboard-doc-list');
  const dots = document.getElementById('doc-dots-indicator');
  if (!container || !dots || !window.TBStore.db) return;

  const docs = window.TBStore.db.docs || [];
  if (docs.length === 0) {
    container.innerHTML = `
      <div class="w-full py-5 px-3 rounded-2xl bg-white/50 border border-dashed border-slate-300 text-center text-[11px] text-slate-500">
        Belum ada dokumentasi foto kegiatan. Guru dapat mengunggah foto kapan saja.
      </div>`;
    dots.classList.add('hidden');
    return;
  }

  dots.classList.remove('hidden');
  container.innerHTML = docs.map(d => `
    <div class="w-44 shrink-0 rounded-2xl overflow-hidden bg-white/80 border border-white shadow-sm relative">
      <img src="${d.photo}" onclick="openDocView('${d.id}')" class="w-full h-24 object-cover cursor-pointer" alt="Kegiatan" />
      ${isSuperAdmin() ? `
        <button type="button" onclick="deleteDoc('${d.id}')" class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 text-white text-[10px] font-bold shadow">✕</button>
      ` : ''}
      <div class="p-2 cursor-pointer" onclick="openDocView('${d.id}')">
        <p class="text-[11px] font-bold text-slate-800 truncate">${d.caption}</p>
        <p class="text-[9.5px] text-slate-500 truncate mt-0.5">📅 ${d.date} • ${d.author}</p>
      </div>
    </div>
  `).join('');
  updateDocCarouselDots();
}
