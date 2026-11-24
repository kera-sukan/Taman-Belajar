// ============================================================================
// TAMAN BELAJAR - MODULE: DATA MURID
// ============================================================================

function renderMuridList() {
  const container = document.getElementById('murid-list-container');
  const searchEl = document.getElementById('search-murid');
  if (!container || !window.TBStore.db) return;

  const q = (searchEl?.value || '').trim().toLowerCase();
  const list = getAccessibleMurid().filter(m =>
    (m.name || '').toLowerCase().includes(q) || (m.code || '').toLowerCase().includes(q)
  );

  if (list.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Data murid tidak ditemukan.</div>`;
    return;
  }

  const renderCard = (m) => `
    <div class="liquid-glass-card p-3.5 rounded-2xl flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="px-2.5 h-11 rounded-2xl ${m.program === 'Keduanya' ? 'bg-indigo-100/80 border-indigo-200 text-indigo-700' : 'bg-emerald-100/80 border-emerald-200 text-emerald-700'} border flex flex-col items-center justify-center shrink-0">
          <span class="text-[8px] font-bold opacity-75 uppercase">ID MURID</span>
          <span class="text-[10px] font-extrabold tracking-tight">${m.code}</span>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-extrabold text-slate-800 truncate">${m.name}</p>
          <p class="text-[11px] text-slate-600 truncate">${m.kelas || '-'} • Program: <b>${m.program}</b></p>
          <p class="text-[10px] text-slate-500 truncate">Wali: ${m.wali || '-'} ${isSuperAdmin() ? `• PIN: <b class="text-slate-700">${m.pin}</b>` : ''}</p>
        </div>
      </div>
      ${canEditOrDelete() ? `
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" onclick="openMuridModal('${m.id}')" class="px-2 py-1.5 rounded-lg bg-amber-100/90 text-amber-800 text-[10px] font-bold">Edit</button>
          <button type="button" onclick="deleteMurid('${m.id}')" class="px-2 py-1.5 rounded-lg bg-rose-100/90 text-rose-800 text-[10px] font-bold">Hapus</button>
        </div>
      ` : ''}
    </div>
  `;

  const groupBoth = list.filter(m => m.program === 'Keduanya');
  const groupSingle = list.filter(m => m.program !== 'Keduanya');

  let htmlOut = '';
  if (groupBoth.length > 0) {
    htmlOut += `<div class="space-y-2">
      <p class="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 px-1">Program Terpadu: Mengaji & Les (${groupBoth.length})</p>
      ${groupBoth.map(renderCard).join('')}
    </div>`;
  }
  if (groupSingle.length > 0) {
    htmlOut += `<div class="space-y-2 pt-1">
      <p class="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 px-1">Program Tunggal: Mengaji / Les (${groupSingle.length})</p>
      ${groupSingle.map(renderCard).join('')}
    </div>`;
  }
  container.innerHTML = htmlOut;
}

function openMuridModal(editId = null) {
  if (editId && !canEditOrDelete()) {
    showToast('User Guru hanya dapat menambah data baru, tidak dapat mengubah data lama.', 'warning');
    return;
  }
  if (!editId && !canWrite()) return;

  document.getElementById('murid-edit-id').value = editId || '';
  if (editId) {
    const m = window.TBStore.db.murid.find(x => x.id === editId);
    if (!m) return;
    document.getElementById('modal-murid-title').textContent = 'Edit Data Murid';
    document.getElementById('murid-code').value = m.code;
    document.getElementById('murid-pin').value = m.pin || '1234';
    document.getElementById('murid-name').value = m.name;
    document.getElementById('murid-program').value = m.program;
    document.getElementById('murid-kelas').value = m.kelas || '';
    document.getElementById('murid-wali').value = m.wali || '';
  } else {
    document.getElementById('modal-murid-title').textContent = 'Tambah Data Murid Baru';
    document.getElementById('murid-code').value = tbGenerateCode('SOL', window.TBStore.activeDate);
    document.getElementById('murid-pin').value = '1234';
    document.getElementById('murid-name').value = '';
    document.getElementById('murid-program').value = 'Keduanya';
    document.getElementById('murid-kelas').value = '';
    document.getElementById('murid-wali').value = '';
  }
  document.getElementById('modal-murid').classList.remove('hidden');
}

function saveMuridForm() {
  const editId = document.getElementById('murid-edit-id').value;
  const code = document.getElementById('murid-code').value.trim().toUpperCase();
  const pin = document.getElementById('murid-pin').value.trim() || '1234';
  const name = document.getElementById('murid-name').value.trim();
  const program = document.getElementById('murid-program').value;
  const kelas = document.getElementById('murid-kelas').value.trim();
  const wali = document.getElementById('murid-wali').value.trim();

  if (!code || !name) return showToast('Nomor Murid dan Nama Lengkap wajib diisi.', 'error');

  const db = window.TBStore.db;
  if (editId) {
    if (!canEditOrDelete()) return;
    const idx = db.murid.findIndex(x => x.id === editId);
    if (idx !== -1) db.murid[idx] = { ...db.murid[idx], code, pin, name, program, kelas, wali };
  } else {
    if (db.murid.some(x => (x.code || '').toUpperCase() === code)) {
      return showToast(`Nomor Murid ${code} sudah digunakan.`, 'error');
    }
    db.murid.push({
      id: 'm-' + Date.now(),
      code,
      pin,
      name,
      program,
      kelas,
      wali,
      regMonth: window.TBStore.activeDate.slice(0, 7)
    });
  }

  tbPushNode('murid');
  closeModal('modal-murid');
  tbNotifyListeners();
  showToast('Data murid berhasil disimpan.', 'success');
}

function deleteMurid(id) {
  if (!canEditOrDelete()) return showToast('Hanya Admin yang dapat menghapus data.', 'warning');
  showConfirmDialog('Hapus data murid ini secara permanen?', () => {
    window.TBStore.db.murid = window.TBStore.db.murid.filter(m => m.id !== id);
    tbPushNode('murid');
    tbNotifyListeners();
    showToast('Data murid dihapus.', 'info');
  });
}
