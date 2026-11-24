// ============================================================================
// TAMAN BELAJAR - MODULE: CATATAN & PENILAIAN MENGAJI + LES
// ============================================================================

function renderMengajiList() {
  const container = document.getElementById('mengaji-list-container');
  if (!container || !window.TBStore.db) return;

  const allowedIds = getAccessibleMuridIds();
  const items = window.TBStore.db.mengaji
    .filter(x => allowedIds.has(x.muridId))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (items.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Belum ada riwayat catatan mengaji.</div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const m = window.TBStore.db.murid.find(x => x.id === item.muridId);
    return `
      <div class="liquid-glass-card p-3.5 rounded-2xl space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">${m ? m.code : '-'}</span>
              <p class="text-xs font-extrabold text-slate-800 truncate">${m ? m.name : 'Murid'}</p>
            </div>
            <p class="text-[10px] text-slate-500 mt-0.5">${item.date} • Pencatat: ${item.author || '-'}</p>
          </div>
          <span class="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shrink-0">${item.skor || '-'} (${(item.nilai || '').split(' ')[0]})</span>
        </div>
        <div class="bg-white/70 rounded-xl p-2.5 text-xs space-y-1">
          <p class="font-bold text-slate-700">${item.jilid} — <span class="text-emerald-700">${item.halaman}</span></p>
          ${item.catatan ? `<p class="text-[11px] text-slate-600 italic">"${item.catatan}"</p>` : ''}
        </div>
        ${canEditOrDelete() ? `
          <div class="flex justify-end gap-1.5 pt-1">
            <button type="button" onclick="openMengajiModal('${item.id}')" class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">Edit</button>
            <button type="button" onclick="deleteMengaji('${item.id}')" class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold">Hapus</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function openMengajiModal(editId = null) {
  if (editId && !canEditOrDelete()) {
    showToast('User Guru tidak memiliki akses mengubah catatan lama.', 'warning');
    return;
  }
  if (!editId && !canWrite()) return;

  const select = document.getElementById('mengaji-murid-id');
  select.innerHTML = window.TBStore.db.murid.map(m => `<option value="${m.id}">${m.code} - ${m.name}</option>`).join('');
  document.getElementById('mengaji-edit-id').value = editId || '';

  if (editId) {
    const item = window.TBStore.db.mengaji.find(x => x.id === editId);
    if (!item) return;
    document.getElementById('modal-mengaji-title').textContent = 'Edit Catatan Mengaji';
    select.value = item.muridId;
    document.getElementById('mengaji-jilid').value = item.jilid;
    document.getElementById('mengaji-halaman').value = item.halaman;
    document.getElementById('mengaji-nilai').value = item.nilai;
    document.getElementById('mengaji-skor').value = item.skor || 85;
    document.getElementById('mengaji-catatan').value = item.catatan || '';
  } else {
    document.getElementById('modal-mengaji-title').textContent = 'Catat Perkembangan Mengaji';
    document.getElementById('mengaji-jilid').value = '';
    document.getElementById('mengaji-halaman').value = '';
    document.getElementById('mengaji-skor').value = 88;
    document.getElementById('mengaji-catatan').value = '';
  }
  document.getElementById('modal-mengaji').classList.remove('hidden');
}

function saveMengajiForm() {
  const editId = document.getElementById('mengaji-edit-id').value;
  const jilid = document.getElementById('mengaji-jilid').value.trim();
  const halaman = document.getElementById('mengaji-halaman').value.trim();
  if (!jilid || !halaman) return showToast('Jilid/Juz dan Halaman wajib diisi.', 'error');

  const payload = {
    date: window.TBStore.activeDate,
    muridId: document.getElementById('mengaji-murid-id').value,
    jilid,
    halaman,
    nilai: document.getElementById('mengaji-nilai').value,
    skor: Number(document.getElementById('mengaji-skor').value) || 0,
    catatan: document.getElementById('mengaji-catatan').value.trim(),
    author: window.TBStore.currentUser.name
  };

  const db = window.TBStore.db;
  if (editId) {
    if (!canEditOrDelete()) return;
    const idx = db.mengaji.findIndex(x => x.id === editId);
    if (idx !== -1) db.mengaji[idx] = { ...db.mengaji[idx], ...payload };
  } else {
    db.mengaji.push({ id: 'mg-' + Date.now(), ...payload });
  }

  tbPushNode('mengaji');
  closeModal('modal-mengaji');
  tbNotifyListeners();
  showToast('Catatan mengaji berhasil disimpan.', 'success');
}

function deleteMengaji(id) {
  if (!canEditOrDelete()) return;
  showConfirmDialog('Hapus catatan mengaji ini?', () => {
    window.TBStore.db.mengaji = window.TBStore.db.mengaji.filter(x => x.id !== id);
    tbPushNode('mengaji');
    tbNotifyListeners();
    showToast('Catatan mengaji dihapus.', 'info');
  });
}

function renderLesList() {
  const container = document.getElementById('les-list-container');
  if (!container || !window.TBStore.db) return;

  const allowedIds = getAccessibleMuridIds();
  const items = window.TBStore.db.les
    .filter(x => allowedIds.has(x.muridId))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (items.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Belum ada riwayat nilai les & bimbel.</div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const m = window.TBStore.db.murid.find(x => x.id === item.muridId);
    return `
      <div class="liquid-glass-card p-3.5 rounded-2xl space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">${m ? m.code : '-'}</span>
              <p class="text-xs font-extrabold text-slate-800 truncate">${m ? m.name : 'Murid'}</p>
            </div>
            <p class="text-[10px] text-slate-500 mt-0.5">${item.date} • Pencatat: ${item.author || '-'}</p>
          </div>
          <span class="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-extrabold shrink-0">Nilai ${item.nilai}</span>
        </div>
        <div class="bg-white/70 rounded-xl p-2.5 text-xs space-y-1">
          <p class="font-bold text-slate-700">${item.mapel}: <span class="font-normal text-slate-600">${item.materi}</span></p>
          ${item.catatan ? `<p class="text-[11px] text-slate-600 italic">"${item.catatan}"</p>` : ''}
        </div>
        ${canEditOrDelete() ? `
          <div class="flex justify-end gap-1.5 pt-1">
            <button type="button" onclick="openLesModal('${item.id}')" class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">Edit</button>
            <button type="button" onclick="deleteLes('${item.id}')" class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold">Hapus</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function openLesModal(editId = null) {
  if (editId && !canEditOrDelete()) {
    showToast('User Guru tidak memiliki akses mengubah catatan lama.', 'warning');
    return;
  }
  if (!editId && !canWrite()) return;

  const select = document.getElementById('les-murid-id');
  select.innerHTML = window.TBStore.db.murid.map(m => `<option value="${m.id}">${m.code} - ${m.name}</option>`).join('');
  document.getElementById('les-edit-id').value = editId || '';

  if (editId) {
    const item = window.TBStore.db.les.find(x => x.id === editId);
    if (!item) return;
    document.getElementById('modal-les-title').textContent = 'Edit Catatan Les';
    select.value = item.muridId;
    document.getElementById('les-mapel').value = item.mapel;
    document.getElementById('les-nilai').value = item.nilai;
    document.getElementById('les-materi').value = item.materi;
    document.getElementById('les-catatan').value = item.catatan || '';
  } else {
    document.getElementById('modal-les-title').textContent = 'Catat Nilai & Materi Les';
    document.getElementById('les-mapel').value = '';
    document.getElementById('les-nilai').value = 90;
    document.getElementById('les-materi').value = '';
    document.getElementById('les-catatan').value = '';
  }
  document.getElementById('modal-les').classList.remove('hidden');
}

function saveLesForm() {
  const editId = document.getElementById('les-edit-id').value;
  const mapel = document.getElementById('les-mapel').value.trim();
  const materi = document.getElementById('les-materi').value.trim();
  if (!mapel || !materi) return showToast('Mata Pelajaran dan Materi wajib diisi.', 'error');

  const payload = {
    date: window.TBStore.activeDate,
    muridId: document.getElementById('les-murid-id').value,
    mapel,
    nilai: Number(document.getElementById('les-nilai').value) || 0,
    materi,
    catatan: document.getElementById('les-catatan').value.trim(),
    author: window.TBStore.currentUser.name
  };

  const db = window.TBStore.db;
  if (editId) {
    if (!canEditOrDelete()) return;
    const idx = db.les.findIndex(x => x.id === editId);
    if (idx !== -1) db.les[idx] = { ...db.les[idx], ...payload };
  } else {
    db.les.push({ id: 'ls-' + Date.now(), ...payload });
  }

  tbPushNode('les');
  closeModal('modal-les');
  tbNotifyListeners();
  showToast('Catatan les berhasil disimpan.', 'success');
}

function deleteLes(id) {
  if (!canEditOrDelete()) return;
  showConfirmDialog('Hapus catatan les ini?', () => {
    window.TBStore.db.les = window.TBStore.db.les.filter(x => x.id !== id);
    tbPushNode('les');
    tbNotifyListeners();
    showToast('Catatan les dihapus.', 'info');
  });
}
