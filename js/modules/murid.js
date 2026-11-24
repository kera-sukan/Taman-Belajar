// File: js/modules/murid.js | Build: V 0.06.11.24.2147
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function getMuridById(id) {
  return (window.TBStore.db.murid || []).find(m => m.id === id) || null;
}

function getMuridName(id) {
  const m = getMuridById(id);
  return m ? m.name : 'Murid';
}

function openMuridModal(editId) {
  if (!canWrite()) return showToast('Hanya Admin/Guru yang dapat mengelola data murid.', 'warn');
  const m = editId ? getMuridById(editId) : null;
  document.getElementById('modal-murid-title').textContent = m ? 'Edit Data Murid' : 'Tambah Data Murid';
  document.getElementById('murid-edit-id').value = m ? m.id : '';
  document.getElementById('murid-code').value = m ? m.code : tbGenerateCode('SOL', window.TBStore.activeDate);
  document.getElementById('murid-pin').value = m ? (m.pin || '1234') : '1234';
  document.getElementById('murid-name').value = m ? m.name : '';
  document.getElementById('murid-program').value = m ? (m.program || 'Keduanya') : 'Keduanya';
  document.getElementById('murid-kelas').value = m ? (m.kelas || '') : '';
  document.getElementById('murid-wali').value = m ? (m.wali || '') : '';
  openModal('modal-murid');
}

function saveMuridForm() {
  if (!canWrite()) return;
  const editId = document.getElementById('murid-edit-id').value.trim();
  const code = document.getElementById('murid-code').value.trim().toUpperCase() || tbGenerateCode('SOL', window.TBStore.activeDate);
  const pin = document.getElementById('murid-pin').value.trim() || '1234';
  const name = document.getElementById('murid-name').value.trim();
  const program = document.getElementById('murid-program').value;
  const kelas = document.getElementById('murid-kelas').value.trim();
  const wali = document.getElementById('murid-wali').value.trim();

  if (!name) return showToast('Nama lengkap murid wajib diisi.', 'warn');

  const db = window.TBStore.db;
  const dup = db.murid.find(x => x.code && x.code.toUpperCase() === code && x.id !== editId);
  if (dup) return showToast(`Nomor Murid ${code} sudah dipakai.`, 'error');

  if (editId) {
    const idx = db.murid.findIndex(x => x.id === editId);
    if (idx !== -1) {
      db.murid[idx] = { ...db.murid[idx], code, pin, name, program, kelas, wali };
    }
    showToast('Data murid diperbarui.');
  } else {
    db.murid.push({
      id: 'm-' + Date.now(),
      code,
      pin,
      name,
      program,
      kelas: kelas || '-',
      wali: wali || '-',
      regMonth: (window.TBStore.activeDate || new Date().toISOString().slice(0, 10)).slice(0, 7)
    });
    showToast(`Murid baru (${code}) ditambahkan.`);
  }

  closeModal('modal-murid');
  tbPushNode('murid');
  renderAllViews();
}

function deleteMurid(id) {
  if (!canWrite()) return;
  const m = getMuridById(id);
  if (!m) return;
  showConfirm(`Hapus data murid "${m.name}" (${m.code})?`, () => {
    window.TBStore.db.murid = window.TBStore.db.murid.filter(x => x.id !== id);
    tbPushNode('murid');
    showToast('Data murid dihapus.');
    renderAllViews();
  });
}

function renderMuridList() {
  const container = document.getElementById('murid-list-container');
  if (!container) return;

  const q = (document.getElementById('search-murid')?.value || '').trim().toLowerCase();
  const list = getAccessibleMurid().filter(m => {
    if (!q) return true;
    return (m.name || '').toLowerCase().includes(q) ||
           (m.code || '').toLowerCase().includes(q) ||
           (m.kelas || '').toLowerCase().includes(q);
  });

  if (list.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Belum ada data murid yang cocok.</div>`;
    return;
  }

  const writeAllowed = canWrite();
  container.innerHTML = list.map(m => `
    <div class="liquid-glass-card p-3.5 rounded-2xl space-y-2">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold">${escapeHtml(m.code)}</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">${escapeHtml(m.program || 'Keduanya')}</span>
          </div>
          <h3 class="text-sm font-extrabold text-slate-800 mt-1 truncate">${escapeHtml(m.name)}</h3>
          <p class="text-[11px] text-slate-500">Kelas: <b class="text-slate-700">${escapeHtml(m.kelas || '-')}</b> • Wali: <span class="text-slate-700">${escapeHtml(m.wali || '-')}</span></p>
        </div>
        ${writeAllowed ? `
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" onclick="openMuridModal('${escapeHtml(m.id)}')" class="px-2.5 py-1 rounded-lg bg-white/80 text-[11px] font-bold text-blue-700 border border-slate-200">Edit</button>
            <button type="button" onclick="deleteMurid('${escapeHtml(m.id)}')" class="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] font-bold text-rose-700 border border-rose-200">Hapus</button>
          </div>
        ` : ''}
      </div>
      ${isSuperAdmin() ? `<div class="text-[10.5px] text-slate-500 pt-1 border-t border-slate-200/60">PIN Wali: <b class="text-slate-700">${escapeHtml(m.pin || '1234')}</b></div>` : ''}
    </div>
  `).join('');
}

function renderBeranda() {
  const db = window.TBStore.db;
  const ds = window.TBStore.activeDate;
  const kids = getAccessibleMurid();
  const kidIds = new Set(kids.map(k => k.id));

  const dayAtt = (db.attendance && db.attendance[ds]) || { mengaji: [], les: [] };
  const hadirMengajiCount = (dayAtt.mengaji || []).filter(id => kidIds.has(id)).length;
  const hadirLesCount = (dayAtt.les || []).filter(id => kidIds.has(id)).length;

  const lesScores = (db.les || [])
    .filter(x => kidIds.has(x.muridId) && !isNaN(Number(x.nilai)))
    .map(x => Number(x.nilai));
  const avgScore = lesScores.length > 0
    ? Math.round(lesScores.reduce((a, b) => a + b, 0) / lesScores.length)
    : null;

  const muridEl = document.getElementById('stat-murid');
  const mengajiEl = document.getElementById('stat-mengaji');
  const lesEl = document.getElementById('stat-les');
  const avgEl = document.getElementById('stat-avg-score');

  if (muridEl) muridEl.textContent = isWali() ? (kids[0]?.code || 'AKTIF') : String(kids.length);
  if (mengajiEl) mengajiEl.textContent = String(hadirMengajiCount);
  if (lesEl) lesEl.textContent = String(hadirLesCount);
  if (avgEl) avgEl.textContent = avgScore !== null ? String(avgScore) : '-';

  const totalTarget = Math.max(1, kids.length * 2);
  const pct = Math.min(100, Math.round(((hadirMengajiCount + hadirLesCount) / totalTarget) * 100));
  const ring = document.getElementById('progress-ring');
  const pctTxt = document.getElementById('progress-pct-text');
  const statusTitle = document.getElementById('progress-status-title');
  const statusDesc = document.getElementById('progress-status-desc');
  const periodPill = document.getElementById('progress-period-pill');

  if (ring) ring.style.setProperty('--pct', `${pct}%`);
  if (pctTxt) pctTxt.textContent = `${pct}%`;
  if (periodPill) periodPill.textContent = formatIndoDate(ds);

  if (statusTitle && statusDesc) {
    if (pct >= 80) {
      statusTitle.textContent = 'Capaian Sangat Baik!';
      statusDesc.textContent = `${hadirMengajiCount} hadir mengaji dan ${hadirLesCount} hadir les tercatat pada tanggal aktif.`;
    } else if (pct > 0) {
      statusTitle.textContent = 'Sedang Berjalan';
      statusDesc.textContent = `${hadirMengajiCount} hadir mengaji dan ${hadirLesCount} hadir les tercatat pada tanggal aktif.`;
    } else {
      statusTitle.textContent = 'Siap Belajar!';
      statusDesc.textContent = 'Catat absensi mengaji dan les untuk memantau grafik capaian.';
    }
  }

  const acts = [];
  (db.mengaji || []).filter(x => kidIds.has(x.muridId)).forEach(x => {
    acts.push({
      ts: x.ts || x.date || '',
      label: `Mengaji • ${getMuridName(x.muridId)}`,
      sub: `${x.jilid || '-'} (${x.halaman || '-'}) • ${x.nilai || ''}`
    });
  });
  (db.les || []).filter(x => kidIds.has(x.muridId)).forEach(x => {
    acts.push({
      ts: x.ts || x.date || '',
      label: `Les ${x.mapel || ''} • ${getMuridName(x.muridId)}`,
      sub: `Nilai ${x.nilai ?? '-'} • ${x.materi || '-'}`
    });
  });
  acts.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));

  const actCountEl = document.getElementById('today-activity-count');
  const actListEl = document.getElementById('today-activity-list');
  if (actCountEl) actCountEl.textContent = `${acts.length} Catatan`;
  if (actListEl) {
    if (acts.length === 0) {
      actListEl.innerHTML = `<p class="text-[11.5px] text-slate-500">Belum ada catatan aktivitas belajar.</p>`;
    } else {
      actListEl.innerHTML = acts.slice(0, 4).map(a => `
        <div class="p-2.5 rounded-2xl bg-white/65 border border-white/80 flex items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(a.label)}</p>
            <p class="text-[10.5px] text-slate-500 truncate">${escapeHtml(a.sub)}</p>
          </div>
          <span class="text-[10px] font-bold text-blue-700 shrink-0">${escapeHtml(String(a.ts).slice(0, 10) || ds)}</span>
        </div>
      `).join('');
    }
  }

  if (typeof renderBerandaDocs === 'function') renderBerandaDocs();
}
