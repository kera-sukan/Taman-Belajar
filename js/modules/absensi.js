// File: js/modules/absensi.js | Build: V 0.06.11.24.2147
let activeHadirSession = 'mengaji';

function setHadirSession(sess) {
  activeHadirSession = sess === 'les' ? 'les' : 'mengaji';
  const btnMengaji = document.getElementById('subtab-hadir-mengaji');
  const btnLes = document.getElementById('subtab-hadir-les');

  if (btnMengaji) {
    btnMengaji.className = activeHadirSession === 'mengaji'
      ? 'py-2 text-xs font-extrabold rounded-xl bg-emerald-600 text-white shadow-sm transition'
      : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  }
  if (btnLes) {
    btnLes.className = activeHadirSession === 'les'
      ? 'py-2 text-xs font-extrabold rounded-xl bg-blue-600 text-white shadow-sm transition'
      : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  }
  renderHadirList();
}

function ensureDayAttendance(dateStr) {
  const db = window.TBStore.db;
  if (!db.attendance || typeof db.attendance !== 'object') db.attendance = {};
  if (!db.attendance[dateStr]) {
    db.attendance[dateStr] = { mengaji: [], les: [] };
  }
  if (!Array.isArray(db.attendance[dateStr].mengaji)) db.attendance[dateStr].mengaji = [];
  if (!Array.isArray(db.attendance[dateStr].les)) db.attendance[dateStr].les = [];
  return db.attendance[dateStr];
}

function toggleAttendance(muridId, sessionName) {
  if (!canWrite()) return showToast('Hanya Admin/Guru yang dapat mengubah absensi.', 'warn');
  const sess = sessionName === 'les' ? 'les' : 'mengaji';
  const ds = window.TBStore.activeDate;
  const day = ensureDayAttendance(ds);
  const arr = day[sess];
  const idx = arr.indexOf(muridId);

  if (idx !== -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(muridId);
  }

  tbPushNode('attendance');
  renderHadirList();
  if (typeof renderBeranda === 'function') renderBeranda();
}

function markAllPresent() {
  if (!canWrite()) return showToast('Hanya Admin/Guru yang dapat menandai kehadiran.', 'warn');
  const ds = window.TBStore.activeDate;
  const day = ensureDayAttendance(ds);
  const kids = getAccessibleMurid().filter(m => {
    const prog = m.program || 'Keduanya';
    if (activeHadirSession === 'mengaji') return prog === 'Keduanya' || prog === 'Mengaji';
    return prog === 'Keduanya' || prog === 'Les';
  });

  day[activeHadirSession] = kids.map(k => k.id);
  tbPushNode('attendance');
  showToast(`Semua murid sesi ${activeHadirSession === 'mengaji' ? 'Mengaji' : 'Les'} ditandai hadir.`);
  renderHadirList();
  if (typeof renderBeranda === 'function') renderBeranda();
}

function renderHadirList() {
  const container = document.getElementById('hadir-list-container');
  if (!container) return;

  const ds = window.TBStore.activeDate;
  const day = ensureDayAttendance(ds);
  const presentSet = new Set(day[activeHadirSession] || []);
  const writeAllowed = canWrite();

  const kids = getAccessibleMurid().filter(m => {
    const prog = m.program || 'Keduanya';
    if (activeHadirSession === 'mengaji') return prog === 'Keduanya' || prog === 'Mengaji';
    return prog === 'Keduanya' || prog === 'Les';
  });

  if (kids.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Tidak ada murid terdaftar untuk sesi ini.</div>`;
    return;
  }

  container.innerHTML = kids.map(m => {
    const isHadir = presentSet.has(m.id);
    return `
      <div class="liquid-glass-card p-3 rounded-2xl flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold">${escapeHtml(m.code)}</span>
            <span class="text-[10.5px] text-slate-500 truncate">${escapeHtml(m.kelas || '-')}</span>
          </div>
          <p class="text-xs font-extrabold text-slate-800 mt-0.5 truncate">${escapeHtml(m.name)}</p>
        </div>
        <button type="button" ${writeAllowed ? `onclick="toggleAttendance('${escapeHtml(m.id)}', '${activeHadirSession}')"` : 'disabled'}
          class="px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 transition ${
            isHadir
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/80 text-slate-600 border border-slate-200'
          } ${!writeAllowed ? 'opacity-70 cursor-default' : ''}">
          ${isHadir ? 'Hadir' : 'Belum'}
        </button>
      </div>
    `;
  }).join('');
}
