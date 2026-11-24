// File: js/modules/nilai.js | Build: V 0.06.11.24.2149
function populateMuridSelect(selectId, programFilter) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const kids = getAccessibleMurid().filter(m => {
    const p = m.program || 'Keduanya';
    if (programFilter === 'mengaji') return p === 'Keduanya' || p === 'Mengaji';
    if (programFilter === 'les') return p === 'Keduanya' || p === 'Les';
    return true;
  });
  sel.innerHTML = kids.map(m =>
    `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)} (${escapeHtml(m.code)})</option>`
  ).join('');
}

function openMengajiModal(editId) {
  if (!canWrite()) return showToast('Hanya Admin/Guru yang dapat mencatat mengaji.', 'warn');
  populateMuridSelect('mengaji-murid-id', 'mengaji');

  const item = editId ? (window.TBStore.db.mengaji || []).find(x => x.id === editId) : null;
  document.getElementById('modal-mengaji-title').textContent = item ? 'Edit Catatan Mengaji' : 'Catat Mengaji';
  document.getElementById('mengaji-edit-id').value = item ? item.id : '';
  if (item) document.getElementById('mengaji-murid-id').value = item.muridId;
  document.getElementById('mengaji-jilid').value = item ? (item.jilid || '') : '';
  document.getElementById('mengaji-halaman').value = item ? (item.halaman || '') : '';
  document.getElementById('mengaji-nilai').value = item ? (item.nilai || 'Sangat Lancar (A)') : 'Sangat Lancar (A)';
  document.getElementById('mengaji-skor').value = item ? (item.skor ?? 88) : 88;
  document.getElementById('mengaji-catatan').value = item ? (item.catatan || '') : '';
  openModal('modal-mengaji');
}

function saveMengajiForm() {
  if (!canWrite()) return;
  const editId = document.getElementById('mengaji-edit-id').value.trim();
  const muridId = document.getElementById('mengaji-murid-id').value;
  const jilid = document.getElementById('mengaji-jilid').value.trim();
  const halaman = document.getElementById('mengaji-halaman').value.trim();
  const nilai = document.getElementById('mengaji-nilai').value;
  const skor = Number(document.getElementById('mengaji-skor').value || 0);
  const catatan = document.getElementById('mengaji-catatan').value.trim();

  if (!muridId || !jilid || !halaman) {
    return showToast('Murid, Jilid/Juz, dan Halaman wajib diisi.', 'warn');
  }

  const db = window.TBStore.db;
  if (!Array.isArray(db.mengaji)) db.mengaji = [];
  const ds = window.TBStore.activeDate;

  if (editId) {
    const idx = db.mengaji.findIndex(x => x.id === editId);
    if (idx !== -1) {
      db.mengaji[idx] = { ...db.mengaji[idx], muridId, jilid, halaman, nilai, skor, catatan };
    }
    showToast('Catatan mengaji diperbarui.');
  } else {
    db.mengaji.unshift({
      id: 'mgj-' + Date.now(),
      muridId,
      date: ds,
      ts: ds + ' ' + new Date().toTimeString().slice(0, 5),
      jilid,
      halaman,
      nilai,
      skor,
      catatan
    });
    showToast('Catatan mengaji tersimpan.');
  }

  closeModal('modal-mengaji');
  tbPushNode('mengaji');
  renderAllViews();
}

function deleteMengaji(id) {
  if (!canWrite()) return;
  showConfirm('Hapus catatan mengaji ini?', () => {
    window.TBStore.db.mengaji = (window.TBStore.db.mengaji || []).filter(x => x.id !== id);
    tbPushNode('mengaji');
    showToast('Catatan mengaji dihapus.');
    renderAllViews();
  });
}

function renderMengajiList() {
  const container = document.getElementById('mengaji-list-container');
  if (!container) return;

  const kidIds = getAccessibleMuridIds();
  const list = (window.TBStore.db.mengaji || []).filter(x => kidIds.has(x.muridId));
  const writeAllowed = canWrite();

  if (list.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Belum ada catatan mengaji.</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="liquid-glass-card p-3.5 rounded-2xl space-y-1.5">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">${escapeHtml(item.jilid)} • ${escapeHtml(item.halaman)}</span>
            <span class="text-[10px] font-bold text-slate-500">${escapeHtml(item.date || '-')}</span>
          </div>
          <h3 class="text-xs font-extrabold text-slate-800 mt-1 truncate">${escapeHtml(getMuridName(item.muridId))}</h3>
          <p class="text-[11px] font-bold text-emerald-700">${escapeHtml(item.nilai || '-')} (Skor: ${escapeHtml(item.skor ?? '-')})</p>
        </div>
        ${writeAllowed ? `
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" onclick="openMengajiModal('${escapeHtml(item.id)}')" class="px-2.5 py-1 rounded-lg bg-white/80 text-[11px] font-bold text-blue-700 border border-slate-200">Edit</button>
            <button type="button" onclick="deleteMengaji('${escapeHtml(item.id)}')" class="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] font-bold text-rose-700 border border-rose-200">Hapus</button>
          </div>
        ` : ''}
      </div>
      ${item.catatan ? `<p class="text-[11px] text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-xl">${escapeHtml(item.catatan)}</p>` : ''}
    </div>
  `).join('');
}

function openLesModal(editId) {
  if (!canWrite()) return showToast('Hanya Admin/Guru yang dapat mencatat nilai les.', 'warn');
  populateMuridSelect('les-murid-id', 'les');

  const item = editId ? (window.TBStore.db.les || []).find(x => x.id === editId) : null;
  document.getElementById('modal-les-title').textContent = item ? 'Edit Catatan Les' : 'Catat Nilai & Materi Les';
  document.getElementById('les-edit-id').value = item ? item.id : '';
  if (item) document.getElementById('les-murid-id').value = item.muridId;
  document.getElementById('les-mapel').value = item ? (item.mapel || '') : '';
  document.getElementById('les-nilai').value = item ? (item.nilai ?? 90) : 90;
  document.getElementById('les-materi').value = item ? (item.materi || '') : '';
  document.getElementById('les-catatan').value = item ? (item.catatan || '') : '';
  openModal('modal-les');
}

function saveLesForm() {
  if (!canWrite()) return;
  const editId = document.getElementById('les-edit-id').value.trim();
  const muridId = document.getElementById('les-murid-id').value;
  const mapel = document.getElementById('les-mapel').value.trim();
  const nilai = Number(document.getElementById('les-nilai').value || 0);
  const materi = document.getElementById('les-materi').value.trim();
  const catatan = document.getElementById('les-catatan').value.trim();

  if (!muridId || !mapel || !materi) {
    return showToast('Murid, Mata Pelajaran, dan Materi wajib diisi.', 'warn');
  }

  const db = window.TBStore.db;
  if (!Array.isArray(db.les)) db.les = [];
  const ds = window.TBStore.activeDate;

  if (editId) {
    const idx = db.les.findIndex(x => x.id === editId);
    if (idx !== -1) {
      db.les[idx] = { ...db.les[idx], muridId, mapel, nilai, materi, catatan };
    }
    showToast('Catatan les diperbarui.');
  } else {
    db.les.unshift({
      id: 'les-' + Date.now(),
      muridId,
      date: ds,
      ts: ds + ' ' + new Date().toTimeString().slice(0, 5),
      mapel,
      nilai,
      materi,
      catatan
    });
    showToast('Catatan les tersimpan.');
  }

  closeModal('modal-les');
  tbPushNode('les');
  renderAllViews();
}

function deleteLes(id) {
  if (!canWrite()) return;
  showConfirm('Hapus catatan les ini?', () => {
    window.TBStore.db.les = (window.TBStore.db.les || []).filter(x => x.id !== id);
    tbPushNode('les');
    showToast('Catatan les dihapus.');
    renderAllViews();
  });
}

function renderLesList() {
  const container = document.getElementById('les-list-container');
  if (!container) return;

  const kidIds = getAccessibleMuridIds();
  const list = (window.TBStore.db.les || []).filter(x => kidIds.has(x.muridId));
  const writeAllowed = canWrite();

  if (list.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Belum ada catatan nilai les.</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="liquid-glass-card p-3.5 rounded-2xl space-y-1.5">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold">${escapeHtml(item.mapel)} • Nilai ${escapeHtml(item.nilai)}</span>
            <span class="text-[10px] font-bold text-slate-500">${escapeHtml(item.date || '-')}</span>
          </div>
          <h3 class="text-xs font-extrabold text-slate-800 mt-1 truncate">${escapeHtml(getMuridName(item.muridId))}</h3>
          <p class="text-[11px] font-semibold text-slate-700">${escapeHtml(item.materi || '-')}</p>
        </div>
        ${writeAllowed ? `
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" onclick="openLesModal('${escapeHtml(item.id)}')" class="px-2.5 py-1 rounded-lg bg-white/80 text-[11px] font-bold text-blue-700 border border-slate-200">Edit</button>
            <button type="button" onclick="deleteLes('${escapeHtml(item.id)}')" class="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] font-bold text-rose-700 border border-rose-200">Hapus</button>
          </div>
        ` : ''}
      </div>
      ${item.catatan ? `<p class="text-[11px] text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-xl">${escapeHtml(item.catatan)}</p>` : ''}
    </div>
  `).join('');
}
