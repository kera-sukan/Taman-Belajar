// File: js/core/firebase-sync.js | Build: V 0.06.11.24.2141
const TB_DB_URL = 'https://taman-belajar-db-default-rtdb.asia-southeast1.firebasedatabase.app';
const TB_LOCAL_KEY = 'taman_belajar_v1_db';
const TB_SESSION_KEY = 'taman_belajar_session_v1';

const TB_PERMS_ADMIN = { les: true, mengaji: true, hadir: true, laporan: true, murid: true, dokumentasi: true };
const TB_PERMS_GURU = { les: true, mengaji: true, hadir: true, laporan: true, murid: true, dokumentasi: true };
const TB_PERMS_WALI = { les: true, mengaji: true, hadir: true, laporan: true, murid: true, dokumentasi: false };

const TB_DEFAULT_ACCOUNTS = [
  {
    id: 'acc-superadmin-1',
    userCode: 'ADM2611001',
    username: 'superadmin',
    pin: '1234',
    name: 'Super Admin',
    role: 'superadmin',
    status: 'approved',
    muridCode: null,
    permissions: { ...TB_PERMS_ADMIN }
  },
  {
    id: 'acc-guru-1',
    userCode: 'GRU2611001',
    username: 'guru',
    pin: '1234',
    name: 'Ustadzah / Guru Pengajar',
    role: 'guru',
    status: 'approved',
    muridCode: null,
    permissions: { ...TB_PERMS_GURU }
  }
];

function tbCreateInitialDB() {
  return {
    accounts: JSON.parse(JSON.stringify(TB_DEFAULT_ACCOUNTS)),
    murid: [
      { id: 'm-1', code: 'SOL2611001', pin: '1234', name: 'Aisyah Putri', program: 'Keduanya', kelas: 'SD Kelas 2', wali: 'Bapak/Ibu Aisyah', regMonth: '2026-11' },
      { id: 'm-2', code: 'SOL2611002', pin: '1234', name: 'Muhammad Rizky', program: 'Mengaji', kelas: 'TK B', wali: 'Bapak/Ibu Rizky', regMonth: '2026-11' },
      { id: 'm-3', code: 'SOL2611003', pin: '1234', name: 'Nadia Safira', program: 'Les', kelas: 'SD Kelas 4', wali: 'Bapak/Ibu Nadia', regMonth: '2026-11' }
    ],
    attendance: {},
    mengaji: [],
    les: [],
    docs: []
  };
}

function tbSafeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function tbSafeSetStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {}
}

function tbSafeGetSession(key) {
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function tbSafeSetSession(key, val) {
  try {
    sessionStorage.setItem(key, val);
    localStorage.setItem(key, val);
  } catch (e) {}
}

function tbSafeClearSession(key) {
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch (e) {}
}

function tbNormalizeDB(raw) {
  const base = tbCreateInitialDB();
  if (!raw || typeof raw !== 'object') return base;

  const accounts = Array.isArray(raw.accounts) && raw.accounts.length > 0 ? raw.accounts : base.accounts;
  const hasAdmin = accounts.some(a => a.role === 'superadmin');
  const mergedAccounts = hasAdmin ? accounts : [...base.accounts.filter(a => a.role === 'superadmin'), ...accounts];

  return {
    accounts: mergedAccounts,
    murid: Array.isArray(raw.murid) ? raw.murid : base.murid,
    attendance: raw.attendance && typeof raw.attendance === 'object' ? raw.attendance : {},
    mengaji: Array.isArray(raw.mengaji) ? raw.mengaji : [],
    les: Array.isArray(raw.les) ? raw.les : [],
    docs: Array.isArray(raw.docs) ? raw.docs : []
  };
}

function tbLoadLocalDB() {
  const rawStr = tbSafeGetStorage(TB_LOCAL_KEY);
  if (!rawStr) {
    const init = tbCreateInitialDB();
    tbSafeSetStorage(TB_LOCAL_KEY, JSON.stringify(init));
    return init;
  }
  try {
    return tbNormalizeDB(JSON.parse(rawStr));
  } catch (e) {
    return tbCreateInitialDB();
  }
}

function tbSaveLocalDB() {
  if (window.TBStore && window.TBStore.db) {
    tbSafeSetStorage(TB_LOCAL_KEY, JSON.stringify(window.TBStore.db));
  }
}

function tbGenerateCode(prefix, dateStr) {
  const cleanPrefix = (prefix || 'SOL').toUpperCase();
  const baseDate = dateStr || (window.TBStore && window.TBStore.activeDate) || new Date().toISOString().slice(0, 10);
  const ym = baseDate.slice(2, 4) + baseDate.slice(5, 7);
  const fullPrefix = cleanPrefix + ym;

  const nums = [];
  const db = (window.TBStore && window.TBStore.db) || tbCreateInitialDB();
  (db.murid || []).forEach(m => {
    if (m.code && m.code.toUpperCase().startsWith(fullPrefix)) {
      const n = parseInt(m.code.slice(fullPrefix.length), 10);
      if (!isNaN(n)) nums.push(n);
    }
  });
  (db.accounts || []).forEach(a => {
    if (a.userCode && a.userCode.toUpperCase().startsWith(fullPrefix)) {
      const n = parseInt(a.userCode.slice(fullPrefix.length), 10);
      if (!isNaN(n)) nums.push(n);
    }
  });

  const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
  return fullPrefix + String(next).padStart(3, '0');
}

function tbToCloudPayload(nodeName, data) {
  if (nodeName === 'attendance') {
    const obj = {};
    Object.keys(data || {}).forEach(dateKey => {
      const day = data[dateKey] || {};
      obj[dateKey] = {
        mengaji: Array.isArray(day.mengaji) && day.mengaji.length > 0 ? day.mengaji : ['__empty__'],
        les: Array.isArray(day.les) && day.les.length > 0 ? day.les : ['__empty__']
      };
    });
    return obj;
  }
  if (Array.isArray(data)) {
    return data.length > 0 ? data : ['__empty__'];
  }
  return data;
}

function tbFromCloudPayload(nodeName, val) {
  if (nodeName === 'attendance') {
    if (!val || typeof val !== 'object') return {};
    const out = {};
    Object.keys(val).forEach(dateKey => {
      if (dateKey === '_empty') return;
      const day = val[dateKey] || {};
      out[dateKey] = {
        mengaji: Array.isArray(day.mengaji) ? day.mengaji.filter(x => x && x !== '__empty__') : [],
        les: Array.isArray(day.les) ? day.les.filter(x => x && x !== '__empty__') : []
      };
    });
    return out;
  }
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(x => x && typeof x === 'object');
  if (typeof val === 'object') return Object.values(val).filter(x => x && typeof x === 'object');
  return [];
}

async function tbPushNode(nodeName) {
  tbSaveLocalDB();
  if (!window.TBStore || !window.TBStore.db) return;
  try {
    const payload = tbToCloudPayload(nodeName, window.TBStore.db[nodeName]);
    await fetch(`${TB_DB_URL}/tamanBelajar/${nodeName}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Sinkronisasi cloud tertunda:', nodeName, e);
  }
}

async function tbPullFromCloud() {
  if (!window.TBStore) return;
  try {
    const res = await fetch(`${TB_DB_URL}/tamanBelajar.json`, { cache: 'no-store' });
    if (!res.ok) return;
    const cloud = await res.json();
    if (!cloud || typeof cloud !== 'object') return;

    const current = window.TBStore.db;
    const hasCloudAccounts = Array.isArray(cloud.accounts) ? cloud.accounts.filter(x => x && typeof x === 'object').length > 0 : !!cloud.accounts;
    const hasCloudMurid = Array.isArray(cloud.murid) ? cloud.murid.filter(x => x && typeof x === 'object').length > 0 : !!cloud.murid;

    if (hasCloudAccounts) current.accounts = tbFromCloudPayload('accounts', cloud.accounts);
    if (hasCloudMurid) current.murid = tbFromCloudPayload('murid', cloud.murid);
    if (cloud.attendance) current.attendance = tbFromCloudPayload('attendance', cloud.attendance);
    if (cloud.mengaji) current.mengaji = tbFromCloudPayload('mengaji', cloud.mengaji);
    if (cloud.les) current.les = tbFromCloudPayload('les', cloud.les);
    if (cloud.docs) current.docs = tbFromCloudPayload('docs', cloud.docs);

    window.TBStore.db = tbNormalizeDB(current);
    tbSaveLocalDB();
    tbNotifyListeners();
  } catch (e) {}
}

window.TBStore = window.TBStore || {
  db: tbLoadLocalDB(),
  currentUser: null,
  activeDate: new Date().toISOString().slice(0, 10),
  listeners: []
};

function tbRegisterListener(fn) {
  if (typeof fn === 'function') window.TBStore.listeners.push(fn);
}

function tbNotifyListeners() {
  (window.TBStore.listeners || []).forEach(fn => {
    try { fn(); } catch (e) {}
  });
}