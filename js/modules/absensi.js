// ============================================================================
// TAMAN BELAJAR - MODULE: ABSENSI KEHADIRAN
// ============================================================================

function setHadirSession(sess) {
  window.TBStore.hadirSession = sess;
  const btnMg = document.getElementById('subtab-hadir-mengaji');
  const btnLs = document.getElementById('subtab-hadir-les');
  if (btnMg) {
    btnMg.className = sess === 'mengaji'
      ? 'py-2 text-xs font-extrabold rounded-xl bg-emerald-600 text-white shadow-sm transition'
      : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  }
  if (btnLs) {
    btnLs.className = sess === 'les'
      ? 'py-2 text-xs font-extrabold rounded-xl bg-blue-600 text-white shadow-sm transition'
      : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  }
  renderHadirList();
}

function renderHadirList() {
  const container = document.getElementById('hadir-list-container');
  if (!container || !window.TBStore.db) return;

  const sess = window.TBStore.hadirSession;
  const activeDate = window.TBStore.activeDate;

  const list = getAccessibleMurid().filter(m =>
    m.program === 'Keduanya' ||
    (sess === 'mengaji' && m.program === 'Mengaji') ||
    (sess === 'les' && m.program === 'Les')
  );

  const attToday = window.TBStore.db.attendance[activeDate] || { mengaji: [], les: [] };
  const presentIds = new Set(attToday[sess] || []);

  if (list.length === 0) {
    container.innerHTML = `<div class="liquid-glass-card p-6 rounded-2xl text-center text-xs text-slate-500">Tidak ada murid terdaftar pada sesi ini.</div>`;
    return;
  }

  container.innerHTML = list.map(m => {
    const isPresent = presentIds.has(m.id);
    const lockedForGuru = isPresent && isGuru();
    const disabled = isWali() || lockedForGuru;

    return `
      <div onclick="${disabled ? '' : `toggleAttendance('${m.id}')`}"
        class="liquid-glass-card p-3.5 rounded-2xl ${isPresent ? 'border-emerald-300/90 bg-emerald-50/50' : ''} flex items-center justify-between gap-3 ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'} transition">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 rounded bg-white/80 text-[10px] font-bold text-slate-700">${m.code}</span>
            <p class="text-xs font-bold text-slate-800 truncate">${m.name}</p>
          </div>
          <p class="text-[11px] text-slate-600 mt-0.5">${isPresent ? 'Status: Hadir' : 'Status: Belum Hadir'} ${lockedForGuru ? '• (Terkunci)' : ''}</p>
        </div>
        <div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${isPresent ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white/70 text-slate-400'}">
          ✓
        </div>
      </div>
    `;
  }).join('');
}

function toggleAttendance(muridId) {
  if (!canWrite()) return;
  const db = window.TBStore.db;
  const activeDate = window.TBStore.activeDate;
  const sess = window.TBStore.hadirSession;

  if (!db.attendance[activeDate]) db.attendance[activeDate] = { mengaji: [], les: [] };
  const arr = db.attendance[activeDate][sess] || [];
  const idx = arr.indexOf(muridId);

  if (idx === -1) {
    arr.push(muridId);
  } else {
    if (!canEditOrDelete()) {
      showToast('User Guru tidak dapat membatalkan kehadiran yang sudah tercatat.', 'warning');
      return;
    }
    arr.splice(idx, 1);
  }

  db.attendance[activeDate][sess] = arr;
  tbPushNode('attendance');
  tbNotifyListeners();
}

function markAllPresent() {
  if (!canWrite()) return;
  const db = window.TBStore.db;
  const activeDate = window.TBStore.activeDate;
  const sess = window.TBStore.hadirSession;

  if (!db.attendance[activeDate]) db.attendance[activeDate] = { mengaji: [], les: [] };
  const eligibleIds = db.murid
    .filter(m => m.program === 'Keduanya' || (sess === 'mengaji' && m.program === 'Mengaji') || (sess === 'les' && m.program === 'Les'))
    .map(m => m.id);

  db.attendance[activeDate][sess] = Array.from(new Set([...(db.attendance[activeDate][sess] || []), ...eligibleIds]));
  tbPushNode('attendance');
  tbNotifyListeners();
  showToast('Semua murid pada sesi ini ditandai hadir.', 'success');
}
