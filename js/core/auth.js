// File: js/core/auth.js | Build: V 0.06.11.24.2141
function loadSession() {
  const raw = tbSafeGetSession(TB_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

window.TBStore.currentUser = loadSession();

function isSuperAdmin() {
  return !!(window.TBStore.currentUser && window.TBStore.currentUser.role === 'superadmin');
}

function isGuru() {
  return !!(window.TBStore.currentUser && window.TBStore.currentUser.role === 'guru');
}

function isWali() {
  return !!(window.TBStore.currentUser && window.TBStore.currentUser.role === 'wali');
}

function canWrite() {
  return isSuperAdmin() || isGuru();
}

function hasModuleAccess(modKey) {
  const u = window.TBStore.currentUser;
  if (!u) return false;
  if (u.role === 'superadmin') return true;
  const perms = u.permissions || (u.role === 'guru' ? TB_PERMS_GURU : TB_PERMS_WALI);
  return !!perms[modKey];
}

function getAccessibleMurid() {
  const u = window.TBStore.currentUser;
  const muridList = (window.TBStore.db && window.TBStore.db.murid) || [];
  if (!u) return [];
  if (isSuperAdmin() || isGuru()) return muridList;
  if (isWali()) {
    return muridList.filter(m =>
      (u.muridId && m.id === u.muridId) ||
      (u.muridCode && (m.code || '').toUpperCase() === u.muridCode.toUpperCase())
    );
  }
  return [];
}

function getAccessibleMuridIds() {
  return new Set(getAccessibleMurid().map(m => m.id));
}

function switchAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('auth-tab-login').className = isLogin
    ? 'py-2 text-xs font-extrabold rounded-xl bg-white text-blue-600 shadow-sm transition'
    : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  document.getElementById('auth-tab-signup').className = !isLogin
    ? 'py-2 text-xs font-extrabold rounded-xl bg-white text-blue-600 shadow-sm transition'
    : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  document.getElementById('auth-panel-login').classList.toggle('hidden', !isLogin);
  document.getElementById('auth-panel-signup').classList.toggle('hidden', isLogin);
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-info').classList.add('hidden');
  document.getElementById('signup-feedback').classList.add('hidden');
  if (!isLogin) toggleSignupFields();
}

function toggleSignupFields() {
  const role = document.getElementById('signup-role').value;
  document.getElementById('signup-child-fields').classList.toggle('hidden', role !== 'wali');
}

function fillDemoAdmin() {
  document.getElementById('login-username').value = 'superadmin';
  document.getElementById('login-pin').value = '1234';
  handleLogin();
}

function handleLogin() {
  const identifier = document.getElementById('login-username').value.trim();
  const pin = document.getElementById('login-pin').value.trim();
  const errEl = document.getElementById('login-error');
  const infoEl = document.getElementById('login-info');
  errEl.classList.add('hidden');
  infoEl.classList.add('hidden');

  if (!identifier || !pin) {
    errEl.textContent = 'Username / Nomor Induk dan PIN wajib diisi.';
    errEl.classList.remove('hidden');
    return;
  }

  const db = window.TBStore.db;
  const pendingMatch = db.accounts.find(a =>
    a.status === 'pending' &&
    ((a.username && a.username.toLowerCase() === identifier.toLowerCase()) ||
     (a.userCode && a.userCode.toUpperCase() === identifier.toUpperCase()))
  );
  if (pendingMatch) {
    infoEl.textContent = `Akun "${pendingMatch.name}" masih menunggu persetujuan Admin.`;
    infoEl.classList.remove('hidden');
    return;
  }

  const accMatch = db.accounts.find(a =>
    a.status !== 'pending' &&
    (((a.username && a.username.toLowerCase() === identifier.toLowerCase()) ||
      (a.userCode && a.userCode.toUpperCase() === identifier.toUpperCase())) &&
     String(a.pin) === String(pin))
  );

  if (accMatch) {
    const sessionUser = { ...accMatch };
    window.TBStore.currentUser = sessionUser;
    tbSafeSetSession(TB_SESSION_KEY, JSON.stringify(sessionUser));
    applyAuthUI();
    return;
  }

  const muridMatch = db.murid.find(m =>
    ((m.code && m.code.toUpperCase() === identifier.toUpperCase()) ||
     (m.name && m.name.toLowerCase() === identifier.toLowerCase())) &&
    String(m.pin) === String(pin)
  );

  if (muridMatch) {
    const linkedAcc = db.accounts.find(a => a.status !== 'pending' && a.role === 'wali' && a.muridCode && a.muridCode.toUpperCase() === muridMatch.code.toUpperCase());
    const sessionUser = linkedAcc
      ? { ...linkedAcc, pin: muridMatch.pin }
      : {
          id: 'wali-direct-' + muridMatch.id,
          userCode: muridMatch.code,
          username: muridMatch.code,
          pin: muridMatch.pin,
          name: muridMatch.wali || ('Wali ' + muridMatch.name),
          role: 'wali',
          status: 'approved',
          muridId: muridMatch.id,
          muridCode: muridMatch.code,
          isDirectMuridLogin: true,
          permissions: { ...TB_PERMS_WALI }
        };
    window.TBStore.currentUser = sessionUser;
    tbSafeSetSession(TB_SESSION_KEY, JSON.stringify(sessionUser));
    applyAuthUI();
    return;
  }

  errEl.textContent = 'Username / Nomor Induk atau PIN tidak cocok.';
  errEl.classList.remove('hidden');
}

function handleSignUp() {
  const role = document.getElementById('signup-role').value;
  const name = document.getElementById('signup-name').value.trim();
  const username = document.getElementById('signup-username').value.trim();
  const pin = document.getElementById('signup-pin').value.trim();
  const childName = document.getElementById('signup-child-name').value.trim();
  const childProgram = document.getElementById('signup-child-program').value;
  const childKelas = document.getElementById('signup-child-kelas').value.trim();
  const fbEl = document.getElementById('signup-feedback');

  fbEl.classList.remove('hidden', 'text-rose-700', 'bg-rose-50', 'border-rose-200', 'text-emerald-800', 'bg-emerald-50', 'border-emerald-200');

  if (!name || !username || !pin) {
    fbEl.textContent = 'Nama lengkap, Username, dan PIN wajib diisi.';
    fbEl.classList.add('text-rose-700', 'bg-rose-50', 'border-rose-200');
    return;
  }
  if (role === 'wali' && !childName) {
    fbEl.textContent = 'Nama lengkap anak (murid) wajib diisi untuk pendaftaran Orang Tua.';
    fbEl.classList.add('text-rose-700', 'bg-rose-50', 'border-rose-200');
    return;
  }

  const db = window.TBStore.db;
  const exists = db.accounts.some(a => a.username && a.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    fbEl.textContent = 'Username sudah digunakan. Silakan pilih username lain.';
    fbEl.classList.add('text-rose-700', 'bg-rose-50', 'border-rose-200');
    return;
  }

  const newPending = {
    id: 'pending-' + Date.now(),
    userCode: null,
    username,
    pin,
    name,
    role,
    status: 'pending',
    muridCode: null,
    pendingChild: role === 'wali' ? { name: childName, program: childProgram, kelas: childKelas || '-' } : null,
    permissions: role === 'guru' ? { ...TB_PERMS_GURU } : { ...TB_PERMS_WALI }
  };

  db.accounts.push(newPending);
  tbPushNode('accounts');

  document.getElementById('signup-name').value = '';
  document.getElementById('signup-username').value = '';
  document.getElementById('signup-pin').value = '';
  document.getElementById('signup-child-name').value = '';
  document.getElementById('signup-child-kelas').value = '';

  fbEl.textContent = 'Pendaftaran terkirim! Menunggu persetujuan & penerbitan Nomor Induk oleh Admin.';
  fbEl.classList.add('text-emerald-800', 'bg-emerald-50', 'border-emerald-200');
}

function logout() {
  window.TBStore.currentUser = null;
  tbSafeClearSession(TB_SESSION_KEY);
  document.getElementById('login-pin').value = '';
  document.getElementById('login-screen').classList.remove('hidden');
  switchAuthMode('login');
}
/* Pengunci tampilan login/beranda agar tidak saling menumpuk (V 0.06.11.24.2242) */
(function () {
  function tbSyncAuthVisibility() {
    const loggedIn = !!(window.TBStore && window.TBStore.currentUser);
    const loginSlot = document.getElementById('slot-login');
    const appShell = document.getElementById('app-shell');

    if (loginSlot) {
      loginSlot.classList.toggle('hidden', loggedIn);
      loginSlot.style.display = loggedIn ? 'none' : '';
    }

    document.querySelectorAll('[id*="login"]').forEach(el => {
      if (el.id === 'slot-login') return;
      if (el.closest('#slot-login') || el.tagName === 'SECTION' || el.tagName === 'DIV') {
        if (loggedIn && !el.closest('#modal-account')) {
          el.classList.add('hidden');
          el.style.display = 'none';
        }
      }
    });

    if (appShell) {
      appShell.classList.toggle('hidden', !loggedIn);
      appShell.style.display = loggedIn ? '' : 'none';
    }
  }

  const origApply = window.applyAuthUI;
  window.applyAuthUI = function (...args) {
    if (typeof origApply === 'function') origApply.apply(this, args);
    tbSyncAuthVisibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tbSyncAuthVisibility, 60));
  } else {
    setTimeout(tbSyncAuthVisibility, 60);
  }
})();

/* Pengunci tampilan login/beranda agar tidak saling menumpuk (V 0.06.11.24.2242) */
(function () {
  function tbSyncAuthVisibility() {
    const loggedIn = !!(window.TBStore && window.TBStore.currentUser);
    const loginSlot = document.getElementById('slot-login');
    const appShell = document.getElementById('app-shell');

    if (loginSlot) {
      loginSlot.classList.toggle('hidden', loggedIn);
      loginSlot.style.display = loggedIn ? 'none' : '';
    }

    document.querySelectorAll('[id*="login"]').forEach(el => {
      if (el.id === 'slot-login') return;
      if (el.closest('#slot-login') || el.tagName === 'SECTION' || el.tagName === 'DIV') {
        if (loggedIn && !el.closest('#modal-account')) {
          el.classList.add('hidden');
          el.style.display = 'none';
        }
      }
    });

    if (appShell) {
      appShell.classList.toggle('hidden', !loggedIn);
      appShell.style.display = loggedIn ? '' : 'none';
    }
  }

  const origApply = window.applyAuthUI;
  window.applyAuthUI = function (...args) {
    if (typeof origApply === 'function') origApply.apply(this, args);
    tbSyncAuthVisibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tbSyncAuthVisibility, 60));
  } else {
    setTimeout(tbSyncAuthVisibility, 60);
  }
})();

/* Sinkronisasi kelas body.tb-logged-in agar layar login selalu hilang saat sudah masuk (V 0.06.11.24.2247) */
(function () {
  function tbSyncLoggedInClass() {
    const loggedIn = !!(window.TBStore && window.TBStore.currentUser);
    document.body.classList.toggle('tb-logged-in', loggedIn);
    const slotLogin = document.getElementById('slot-login');
    if (slotLogin && loggedIn) {
      slotLogin.classList.add('hidden');
      slotLogin.style.display = 'none';
    }
  }

  const prevApplyAuthUI = window.applyAuthUI;
  window.applyAuthUI = function (...args) {
    if (typeof prevApplyAuthUI === 'function') prevApplyAuthUI.apply(this, args);
    tbSyncLoggedInClass();
  };

  setInterval(tbSyncLoggedInClass, 300);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tbSyncLoggedInClass);
  } else {
    tbSyncLoggedInClass();
  }
})();
