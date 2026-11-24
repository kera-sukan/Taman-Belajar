// ============================================================================
// TAMAN BELAJAR - AUTHENTICATION, SIGN UP & ROLE PERMISSIONS
// ============================================================================

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

function canEditOrDelete() {
  return isSuperAdmin();
}

function hasModuleAccess(modKey) {
  const user = window.TBStore.currentUser;
  if (!user) return false;
  if (isSuperAdmin() || modKey === 'atur') return true;
  const perms = user.permissions || (isWali() ? TB_PERMS_WALI : TB_PERMS_GURU);
  return !!perms[modKey];
}

function getAccessibleMurid() {
  const user = window.TBStore.currentUser;
  const muridList = window.TBStore.db ? window.TBStore.db.murid : [];
  if (!user) return [];
  if (isWali()) {
    return muridList.filter(m => (m.code || '').toUpperCase() === (user.muridCode || '').toUpperCase());
  }
  return muridList;
}

function getAccessibleMuridIds() {
  return new Set(getAccessibleMurid().map(m => m.id));
}

function switchAuthMode(mode) {
  const isLogin = mode === 'login';
  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  if (tabLogin) {
    tabLogin.className = isLogin
      ? 'py-2 text-xs font-extrabold rounded-xl bg-white text-blue-600 shadow-sm transition'
      : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  }
  if (tabSignup) {
    tabSignup.className = !isLogin
      ? 'py-2 text-xs font-extrabold rounded-xl bg-white text-emerald-600 shadow-sm transition'
      : 'py-2 text-xs font-bold rounded-xl text-slate-600 transition';
  }
  document.getElementById('auth-panel-login')?.classList.toggle('hidden', !isLogin);
  document.getElementById('auth-panel-signup')?.classList.toggle('hidden', isLogin);
  document.getElementById('login-error')?.classList.add('hidden');
  document.getElementById('login-info')?.classList.add('hidden');
  document.getElementById('signup-feedback')?.classList.add('hidden');
}

function toggleSignupFields() {
  const role = document.getElementById('signup-role')?.value;
  document.getElementById('signup-child-fields')?.classList.toggle('hidden', role !== 'wali');
}

function fillDemoAdmin() {
  const u = document.getElementById('login-username');
  const p = document.getElementById('login-pin');
  if (u) u.value = 'superadmin';
  if (p) p.value = '1234';
  handleLogin();
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

  if (!name || !username || !pin) {
    fbEl.className = 'text-xs font-semibold px-3 py-2 rounded-xl border bg-rose-50 text-rose-700 border-rose-200';
    fbEl.textContent = 'Nama lengkap, Username, dan PIN wajib diisi.';
    fbEl.classList.remove('hidden');
    return;
  }
  if (role === 'wali' && !childName) {
    fbEl.className = 'text-xs font-semibold px-3 py-2 rounded-xl border bg-rose-50 text-rose-700 border-rose-200';
    fbEl.textContent = 'Nama lengkap anak wajib diisi untuk pendaftaran Orang Tua / Wali.';
    fbEl.classList.remove('hidden');
    return;
  }
  if (window.TBStore.db.accounts.some(a => (a.username || '').toLowerCase() === username.toLowerCase())) {
    fbEl.className = 'text-xs font-semibold px-3 py-2 rounded-xl border bg-rose-50 text-rose-700 border-rose-200';
    fbEl.textContent = 'Username sudah digunakan. Silakan pilih username lain.';
    fbEl.classList.remove('hidden');
    return;
  }

  window.TBStore.db.accounts.push({
    id: 'acc-' + Date.now(),
    userCode: '',
    username,
    pin,
    name,
    role,
    status: 'pending',
    muridCode: null,
    pendingChild: role === 'wali' ? { name: childName, program: childProgram, kelas: childKelas } : null,
    permissions: role === 'wali' ? { ...TB_PERMS_WALI } : { ...TB_PERMS_GURU },
    createdAt: new Date().toISOString().slice(0, 10)
  });

  tbPushNode('accounts');

  document.getElementById('signup-name').value = '';
  document.getElementById('signup-username').value = '';
  document.getElementById('signup-pin').value = '';
  document.getElementById('signup-child-name').value = '';
  document.getElementById('signup-child-kelas').value = '';

  fbEl.className = 'text-xs font-semibold px-3 py-2.5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200';
  fbEl.textContent = 'Pendaftaran terkirim! Menunggu persetujuan Admin & penerbitan Nomor Induk.';
  fbEl.classList.remove('hidden');
}

function handleLogin() {
  const uname = (document.getElementById('login-username')?.value || '').trim();
  const pin = (document.getElementById('login-pin')?.value || '').trim();
  const errEl = document.getElementById('login-error');
  const infoEl = document.getElementById('login-info');
  errEl?.classList.add('hidden');
  infoEl?.classList.add('hidden');

  if (!uname || !pin) {
    if (errEl) {
      errEl.textContent = 'Harap isi Username / Nomor Induk dan PIN.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  const db = window.TBStore.db;
  let matchedAcc = db.accounts.find(a =>
    ((a.username || '').toLowerCase() === uname.toLowerCase() ||
     (a.userCode || '').toUpperCase() === uname.toUpperCase()) &&
    String(a.pin) === pin
  );

  if (!matchedAcc) {
    const matchedMurid = db.murid.find(m =>
      (m.code || '').toUpperCase() === uname.toUpperCase() && String(m.pin) === pin
    );
    if (matchedMurid) {
      const linkedWali = db.accounts.find(a => a.role === 'wali' && (a.muridCode || '').toUpperCase() === matchedMurid.code.toUpperCase());
      matchedAcc = linkedWali || {
        id: 'wali-direct-' + matchedMurid.id,
        userCode: matchedMurid.code,
        username: matchedMurid.code,
        pin: matchedMurid.pin,
        name: matchedMurid.wali ? matchedMurid.wali : `Wali ${matchedMurid.name}`,
        role: 'wali',
        status: 'approved',
        muridCode: matchedMurid.code,
        permissions: { ...TB_PERMS_WALI },
        isDirectMuridLogin: true,
        muridId: matchedMurid.id
      };
    }
  }

  if (!matchedAcc) {
    if (errEl) {
      errEl.textContent = 'Username / Nomor Induk atau PIN tidak cocok.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  if (matchedAcc.status === 'pending') {
    if (infoEl) {
      infoEl.textContent = 'Akun Anda masih menunggu persetujuan Admin.';
      infoEl.classList.remove('hidden');
    }
    return;
  }

  window.TBStore.currentUser = matchedAcc;
  tbSafeSetSession(TB_SESSION_KEY, JSON.stringify(matchedAcc));
  if (typeof applyAuthUI === 'function') applyAuthUI();
}

function logout() {
  if (typeof closeQuickMenu === 'function') closeQuickMenu();
  tbSafeRemoveSession(TB_SESSION_KEY);
  window.TBStore.currentUser = null;
  const u = document.getElementById('login-username');
  const p = document.getElementById('login-pin');
  if (u) u.value = '';
  if (p) p.value = '';
  switchAuthMode('login');
  document.getElementById('login-screen')?.classList.remove('hidden');
}
