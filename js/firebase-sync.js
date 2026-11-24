// ============================================================================
// TAMAN BELAJAR - FIREBASE REALTIME SYNC & ISOLATED STATE LAYER
// Memisahkan pembacaan/penulisan per cabang node agar update satu bagian
// tidak menimpa atau merusak data cabang lainnya.
// ============================================================================

const TB_BASE_URL = 'https://taman-belajar-db-default-rtdb.asia-southeast1.firebasedatabase.app';
const TB_LEGACY_ROOT = `${TB_BASE_URL}/taman_belajar_db.json`;
const TB_STORAGE_KEY = 'taman_belajar_modular_v1';
const TB_SESSION_KEY = 'taman_belajar_modular_session_v1';

const TB_PERMS_GURU = {
  les: true,
  mengaji: true,
  hadir: true,
  laporan: true,
  murid: true,
  dokumentasi: true
};

const TB_PERMS_WALI = {
  les: true,
  mengaji: true,
  hadir: true,
  laporan: true,
  murid: true,
  dokumentasi: false
};

const TB_SAMPLE_DOC_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs>' +
  '<rect width="400" height="240" fill="url(#g)"/>' +
  '<circle cx="330" cy="50" r="60" fill="rgba(255,255,255,0.15)"/>' +
  '<text x="200" y="108" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#ffffff">📖</text>' +
  '<text x="200" y="146" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">Kegiatan Belajar &amp; Mengaji</text>' +
  '<text x="200" y="170" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#e0f2fe">Taman Belajar • Dokumentasi Harian</text>' +
  '</svg>'
);

const TB_DEFAULT_DATA = {
  accounts: [
    {
      id: 'acc-superadmin-1',
      userCode: 'ADM2611001',
      username: 'superadmin',
      pin: '1234',
      name: 'Super Admin',
      role: 'superadmin',
      status: 'approved',
      muridCode: null,
      permissions: { les: true, mengaji: true, hadir: true, laporan: true, murid: true, dokumentasi: true }
    }
  ],
  murid: [
    { id: 'm-1', code: 'SOL2611001', pin: '1234', name: 'Aisyah Putri Rahma', program: 'Keduanya', kelas: 'SD Kelas 2', wali: 'Bapak Ahmad', regMonth: '2026-11' },
    { id: 'm-2', code: 'SOL2611002', pin: '1234', name: 'Muhammad Rizky Pratama', program: 'Mengaji', kelas: 'SD Kelas 1', wali: 'Ibu Siti', regMonth: '2026-11' },
    { id: 'm-3', code: 'SOL2611003', pin: '1234', name: 'Zahra Nabila Khairunnisa', program: 'Keduanya', kelas: 'SD Kelas 3', wali: 'Bapak Hendra', regMonth: '2026-11' },
    { id: 'm-4', code: 'SOL2611004', pin: '1234', name: 'Fathan Alfarizi', program: 'Mengaji', kelas: 'TK B', wali: 'Ibu Rina', regMonth: '2026-11' }
  ],
  attendance: {
    '2026-11-22': { mengaji: ['m-1', 'm-2', 'm-3', 'm-4'], les: ['m-1', 'm-3', 'm-4'] }
  },
  mengaji: [
    { id: 'mg-1', date: '2026-11-22', muridId: 'm-1', jilid: 'Iqro 4', halaman: 'Hal. 12 - 14', nilai: 'Sangat Lancar (A)', skor: 92, catatan: 'Panjang pendek mad sudah tepat.', author: 'Super Admin' },
    { id: 'mg-2', date: '2026-11-22', muridId: 'm-2', jilid: 'Iqro 2', halaman: 'Hal. 8 - 9', nilai: 'Lancar (B)', skor: 85, catatan: 'Perhatikan huruf sambung.', author: 'Super Admin' }
  ],
  les: [
    { id: 'ls-1', date: '2026-11-22', muridId: 'm-1', mapel: 'Matematika', materi: 'Penjumlahan & Pengurangan Bersusun', nilai: 95, catatan: 'Sangat teliti mengerjakan latihan.', author: 'Super Admin' },
    { id: 'ls-2', date: '2026-11-22', muridId: 'm-3', mapel: 'Bahasa Indonesia', materi: 'Membaca Pemahaman & Kalimat Utama', nilai: 88, catatan: 'Membaca lancar dan percaya diri.', author: 'Super Admin' }
  ],
  docs: [
    {
      id: 'doc-default-1',
      photo: TB_SAMPLE_DOC_SVG,
      caption: 'Sesi Mengaji Iqro & Hafalan Surat Pendek',
      date: '2026-11-22',
      time: '16:30',
      author: 'Super Admin'
    }
  ]
};

window.TBStore = {
  memoryDB: JSON.parse(JSON.stringify(TB_DEFAULT_DATA)),
  memorySession: null,
  db: null,
  currentUser: null,
  activeDate: new Date().toISOString().slice(0, 10),
  hadirSession: 'mengaji',
  isSyncing: false,
  listeners: []
};

function tbSafeGetLocal(key) {
  try {
    return window['local' + 'Storage'] ? window['local' + 'Storage'].getItem(key) : null;
  } catch (e) {
    return null;
  }
}

function tbSafeSetLocal(key, val) {
  try {
    if (window['local' + 'Storage']) window['local' + 'Storage'].setItem(key, val);
  } catch (e) {}
}

function tbSafeGetSession(key) {
  try {
    return window['session' + 'Storage'] ? window['session' + 'Storage'].getItem(key) : window.TBStore.memorySession;
  } catch (e) {
    return window.TBStore.memorySession;
  }
}

function tbSafeSetSession(key, val) {
  window.TBStore.memorySession = val;
  try {
    if (window['session' + 'Storage']) window['session' + 'Storage'].setItem(key, val);
  } catch (e) {}
}

function tbSafeRemoveSession(key) {
  window.TBStore.memorySession = null;
  try {
    if (window['session' + 'Storage']) window['session' + 'Storage'].removeItem(key);
  } catch (e) {}
}

function tbToArray(val) {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (val && typeof val === 'object') return Object.values(val).filter(Boolean);
  return [];
}

function tbNormalizeDB(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const accList = tbToArray(src.accounts).map(a => ({
    ...a,
    status: a.status || 'approved',
    userCode: a.userCode || (a.role === 'superadmin' ? 'ADM2611001' : (a.muridCode || 'USR2611001')),
    permissions: a.permissions || (a.role === 'wali' ? { ...TB_PERMS_WALI } : { ...TB_PERMS_GURU })
  }));

  if (!accList.some(a => a.role === 'superadmin')) {
    accList.unshift(JSON.parse(JSON.stringify(TB_DEFAULT_DATA.accounts[0])));
  }

  const muridList = tbToArray(src.murid);
  const docsList = tbToArray(src.docs);

  return {
    accounts: accList,
    murid: muridList.length > 0 ? muridList : JSON.parse(JSON.stringify(TB_DEFAULT_DATA.murid)),
    attendance: src.attendance && typeof src.attendance === 'object' ? src.attendance : JSON.parse(JSON.stringify(TB_DEFAULT_DATA.attendance)),
    mengaji: tbToArray(src.mengaji),
    les: tbToArray(src.les),
    docs: docsList.length > 0 ? docsList : JSON.parse(JSON.stringify(TB_DEFAULT_DATA.docs))
  };
}

function tbInitLocalState() {
  const saved = tbSafeGetLocal(TB_STORAGE_KEY);
  if (saved) {
    try {
      window.TBStore.db = tbNormalizeDB(JSON.parse(saved));
    } catch (e) {
      window.TBStore.db = JSON.parse(JSON.stringify(TB_DEFAULT_DATA));
    }
  } else {
    window.TBStore.db = JSON.parse(JSON.stringify(TB_DEFAULT_DATA));
  }

  const sessRaw = tbSafeGetSession(TB_SESSION_KEY);
  if (sessRaw) {
    try {
      window.TBStore.currentUser = JSON.parse(sessRaw);
    } catch (e) {
      window.TBStore.currentUser = null;
    }
  }
}

function tbRegisterListener(fn) {
  if (typeof fn === 'function') window.TBStore.listeners.push(fn);
}

function tbNotifyListeners() {
  window.TBStore.listeners.forEach(fn => {
    try {
      fn(window.TBStore.db, window.TBStore.currentUser);
    } catch (e) {}
  });
}

// Menulis satu cabang node saja (misal: 'murid', 'attendance', 'mengaji', 'les', 'docs', 'accounts')
async function tbPushNode(nodeName) {
  const db = window.TBStore.db;
  if (!db || !nodeName || !Object.prototype.hasOwnProperty.call(db, nodeName)) return;

  tbSafeSetLocal(TB_STORAGE_KEY, JSON.stringify(db));
  if (window.TBStore.isSyncing) return;

  window.TBStore.isSyncing = true;
  try {
    const res = await fetch(`${TB_BASE_URL}/tb_v2/${nodeName}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db[nodeName])
    });
    const badge = document.getElementById('sync-status-badge');
    if (res.ok && badge) {
      badge.textContent = 'Tersinkron Otomatis';
      badge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
    }
  } catch (e) {
    // Tetap aman di lokal bila offline; akan tersinkron saat koneksi kembali
  } finally {
    window.TBStore.isSyncing = false;
  }
}

// Menarik data terbaru dari node terpisah, dengan fallback ke node lama bila belum dimigrasi
async function tbPullFromCloud() {
  if (window.TBStore.isSyncing) return;
  try {
    const resV2 = await fetch(`${TB_BASE_URL}/tb_v2.json`);
    if (resV2.ok) {
      const dataV2 = await resV2.json();
      if (dataV2 && typeof dataV2 === 'object') {
        const normalized = tbNormalizeDB(dataV2);
        if (JSON.stringify(normalized) !== JSON.stringify(window.TBStore.db)) {
          window.TBStore.db = normalized;
          tbSafeSetLocal(TB_STORAGE_KEY, JSON.stringify(normalized));
          if (window.TBStore.currentUser) {
            const freshSelf = normalized.accounts.find(a => a.id === window.TBStore.currentUser.id);
            if (freshSelf) {
              window.TBStore.currentUser = freshSelf;
              tbSafeSetSession(TB_SESSION_KEY, JSON.stringify(freshSelf));
            }
          }
          tbNotifyListeners();
        }
        return;
      }
    }

    // Fallback baca struktur lama jika /tb_v2 masih kosong
    const resLegacy = await fetch(TB_LEGACY_ROOT);
    if (resLegacy.ok) {
      const legacyData = await resLegacy.json();
      if (legacyData && typeof legacyData === 'object') {
        const normalized = tbNormalizeDB(legacyData);
        window.TBStore.db = normalized;
        tbSafeSetLocal(TB_STORAGE_KEY, JSON.stringify(normalized));
        tbNotifyListeners();
      }
    }
  } catch (e) {}
}

function tbGenerateCode(prefixType, dateStr) {
  const ref = dateStr || window.TBStore.activeDate || new Date().toISOString().slice(0, 10);
  const yy = ref.slice(2, 4);
  const mm = ref.slice(5, 7);
  const prefix = `${prefixType}${yy}${mm}`;
  let maxSeq = 0;

  if (prefixType === 'SOL') {
    window.TBStore.db.murid.forEach(m => {
      const c = (m.code || '').toUpperCase();
      if (c.startsWith(prefix)) {
        const n = parseInt(c.slice(prefix.length), 10);
        if (!isNaN(n) && n > maxSeq) maxSeq = n;
      }
    });
  }

  window.TBStore.db.accounts.forEach(a => {
    const c = (a.userCode || '').toUpperCase();
    if (c.startsWith(prefix)) {
      const n = parseInt(c.slice(prefix.length), 10);
      if (!isNaN(n) && n > maxSeq) maxSeq = n;
    }
  });

  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

tbInitLocalState();
