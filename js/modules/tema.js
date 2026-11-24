// File: js/modules/tema.js | Build: V 0.06.11.24.2156
function renderSettingsAndAccounts() {
  const u = window.TBStore.currentUser;
  if (!u) return;

  const pill = document.getElementById('settings-role-pill');
  const desc = document.getElementById('settings-account-desc');
  if (pill) {
    pill.textContent = isSuperAdmin() ? 'ADMIN' : (isGuru() ? 'USER (GURU)' : 'USER (ORANG TUA)');
  }
  if (desc) {
    const codeStr = u.userCode || u.muridCode || '-';
    desc.textContent = `Login sebagai ${u.name || u.username} (No. Induk: ${codeStr}). Data tersimpan lokal dan tersinkronisasi ke cloud.`;
  }

  const selfCode = document.getElementById('self-acc-code');
  const selfName = document.getElementById('self-acc-name');
  const selfUser = document.getElementById('self-acc-username');
  const selfPin = document.getElementById('self-acc-pin');
  if (selfCode) selfCode.textContent = u.userCode || u.muridCode || '-';
  if (selfName) selfName.value = u.name || '';
  if (selfUser) selfUser.value = u.username || '';
  if (selfPin) selfPin.value = u.pin || '';

  if (isSuperAdmin()) {
    renderPendingApprovals();
    renderAccountManagementList();
  }
}

function saveSelfAccountChanges() {
  const u = window.TBStore.currentUser;
  if (!u) return;

  const newName = (document.getElementById('self-acc-name')?.value || '').trim();
  const newUser = (document.getElementById('self-acc-username')?.value || '').trim();
  const newPin = (document.getElementById('self-acc-pin')?.value || '').trim();

  if (!newName || !newUser || !newPin) {
    return showToast('Nama tampilan, username, dan PIN wajib diisi.', 'warn');
  }

  const db = window.TBStore.db;
  const dup = db.accounts.find(a => a.username && a.username.toLowerCase() === newUser.toLowerCase() && a.id !== u.id);
  if (dup) return showToast('Username sudah dipakai akun lain.', 'error');

  if (u.isDirectMuridLogin && u.muridId) {
    const m = getMuridById(u.muridId);
    if (m) {
      m.wali = newName;
      m.pin = newPin;
      tbPushNode('murid');
    }
  }

  const accIdx = db.accounts.findIndex(a => a.id === u.id);
  if (accIdx !== -1) {
    db.accounts[accIdx] = { ...db.accounts[accIdx], name: newName, username: newUser, pin: newPin };
    tbPushNode('accounts');
  }

  const updatedSession = { ...u, name: newName, username: newUser, pin: newPin };
  window.TBStore.currentUser = updatedSession;
  tbSafeSetSession(TB_SESSION_KEY, JSON.stringify(updatedSession));
  showToast('Perubahan akun Anda berhasil disimpan.');
  applyAuthUI();
}

function renderPendingApprovals() {
  const container = document.getElementById('pending-users-container');
  if (!container) return;

  const pending = (window.TBStore.db.accounts || []).filter(a => a.status === 'pending');
  updatePendingIndicators();

  if (pending.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-500">Tidak ada pendaftar baru yang menunggu persetujuan.</p>`;
    return;
  }

  container.innerHTML = pending.map(p => {
    const isWaliReq = p.role === 'wali';
    const perms = p.permissions || (isWaliReq ? TB_PERMS_WALI : TB_PERMS_GURU);
    return `
      <div class="p-3 rounded-2xl bg-white/75 border border-amber-200 space-y-2.5" data-pending-card="${escapeHtml(p.id)}">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold">${isWaliReq ? 'Orang Tua' : 'Guru'}</span>
            <p class="text-xs font-extrabold text-slate-800 mt-1">${escapeHtml(p.name)} <span class="text-slate-500 font-semibold">(@${escapeHtml(p.username)})</span></p>
            ${isWaliReq && p.pendingChild ? `
              <p class="text-[11px] text-blue-900 mt-0.5">Anak: <b>${escapeHtml(p.pendingChild.name)}</b> • ${escapeHtml(p.pendingChild.program)} (${escapeHtml(p.pendingChild.kelas)})</p>
            ` : ''}
          </div>
          <span class="text-[10px] font-bold text-slate-500">PIN: ${escapeHtml(p.pin)}</span>
        </div>

        <div class="grid grid-cols-2 gap-1.5 text-[11px] bg-white/60 p-2 rounded-xl">
          ${['les', 'mengaji', 'hadir', 'laporan', 'murid', 'dokumentasi'].map(k => `
            <label class="flex items-center gap-1.5 font-semibold text-slate-700">
              <input type="checkbox" data-perm="${k}" ${perms[k] ? 'checked' : ''} />
              <span>${k.charAt(0).toUpperCase() + k.slice(1)}</span>
            </label>
          `).join('')}
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button type="button" onclick="approvePendingUser('${escapeHtml(p.id)}')" class="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Setujui &amp; Terbitkan ID</button>
          <button type="button" onclick="rejectPendingUser('${escapeHtml(p.id)}')" class="py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">Tolak</button>
        </div>
      </div>
    `;
  }).join('');
}

function approvePendingUser(pendingId) {
  if (!isSuperAdmin()) return;
  const db = window.TBStore.db;
  const idx = db.accounts.findIndex(a => a.id === pendingId);
  if (idx === -1) return;

  const p = db.accounts[idx];
  const card = document.querySelector(`[data-pending-card="${pendingId}"]`);
  const perms = {};
  ['les', 'mengaji', 'hadir', 'laporan', 'murid', 'dokumentasi'].forEach(k => {
    const cb = card ? card.querySelector(`input[data-perm="${k}"]`) : null;
    perms[k] = cb ? cb.checked : true;
  });

  let muridCode = p.muridCode || null;
  if (p.role === 'wali') {
    muridCode = tbGenerateCode('SOL', window.TBStore.activeDate);
    db.murid.push({
      id: 'm-' + Date.now(),
      code: muridCode,
      pin: p.pin || '1234',
      name: (p.pendingChild && p.pendingChild.name) || p.name,
      program: (p.pendingChild && p.pendingChild.program) || 'Keduanya',
      kelas: (p.pendingChild && p.pendingChild.kelas) || '-',
      wali: p.name,
      regMonth: (window.TBStore.activeDate || new Date().toISOString().slice(0, 10)).slice(0, 7)
    });
    tbPushNode('murid');
  }

  const userCode = p.role === 'wali' ? muridCode : tbGenerateCode('GRU', window.TBStore.activeDate);
  db.accounts[idx] = {
    ...p,
    status: 'approved',
    userCode,
    muridCode,
    permissions: perms
  };

  tbPushNode('accounts');
  showToast(`Akun "${p.name}" disetujui (ID: ${userCode}).`);
  renderAllViews();
}

function rejectPendingUser(pendingId) {
  if (!isSuperAdmin()) return;
  showConfirm('Tolak dan hapus permintaan pendaftaran ini?', () => {
    window.TBStore.db.accounts = window.TBStore.db.accounts.filter(a => a.id !== pendingId);
    tbPushNode('accounts');
    showToast('Pendaftaran ditolak.');
    renderAllViews();
  });
}

function onAccRoleChange() {
  const role = document.getElementById('acc-role')?.value;
  const wrap = document.getElementById('acc-murid-wrapper');
  const sel = document.getElementById('acc-murid-code');
  const codeInp = document.getElementById('acc-user-code');

  if (wrap) wrap.classList.toggle('hidden', role !== 'wali');
  if (sel) {
    sel.innerHTML = (window.TBStore.db.murid || []).map(m =>
      `<option value="${escapeHtml(m.code)}">${escapeHtml(m.name)} (${escapeHtml(m.code)})</option>`
    ).join('');
  }
  if (codeInp && !document.getElementById('acc-edit-id')?.value) {
    const prefix = role === 'superadmin' ? 'ADM' : role === 'wali' ? 'SOL' : 'GRU';
    codeInp.value = tbGenerateCode(prefix, window.TBStore.activeDate);
  }
}

function openAccountModal(editId) {
  if (!isSuperAdmin()) return;
  const acc = editId ? (window.TBStore.db.accounts || []).find(a => a.id === editId) : null;
  document.getElementById('modal-account-title').textContent = acc ? 'Edit Akun User' : 'Tambah Akun User';
  document.getElementById('acc-edit-id').value = acc ? acc.id : '';
  document.getElementById('acc-role').value = acc ? acc.role : 'guru';
  onAccRoleChange();

  document.getElementById('acc-user-code').value = acc ? (acc.userCode || '') : document.getElementById('acc-user-code').value;
  if (acc && acc.muridCode) document.getElementById('acc-murid-code').value = acc.muridCode;
  document.getElementById('acc-name').value = acc ? (acc.name || '') : '';
  document.getElementById('acc-username').value = acc ? (acc.username || '') : '';
  document.getElementById('acc-pin').value = acc ? (acc.pin || '1234') : '1234';

  const perms = (acc && acc.permissions) || TB_PERMS_GURU;
  ['les', 'mengaji', 'hadir', 'laporan', 'murid', 'dokumentasi'].forEach(k => {
    const cb = document.getElementById('perm-' + k);
    if (cb) cb.checked = !!perms[k];
  });

  openModal('modal-account');
}

function saveAccountForm() {
  if (!isSuperAdmin()) return;
  const editId = document.getElementById('acc-edit-id').value.trim();
  const role = document.getElementById('acc-role').value;
  const userCode = document.getElementById('acc-user-code').value.trim().toUpperCase();
  const muridCode = role === 'wali' ? (document.getElementById('acc-murid-code')?.value || null) : null;
  const name = document.getElementById('acc-name').value.trim();
  const username = document.getElementById('acc-username').value.trim();
  const pin = document.getElementById('acc-pin').value.trim() || '1234';

  if (!name || !username) {
    return showToast('Nama tampilan dan username wajib diisi.', 'warn');
  }

  const db = window.TBStore.db;
  const dup = db.accounts.find(a => a.username && a.username.toLowerCase() === username.toLowerCase() && a.id !== editId);
  if (dup) return showToast('Username sudah digunakan.', 'error');

  const permissions = {};
  ['les', 'mengaji', 'hadir', 'laporan', 'murid', 'dokumentasi'].forEach(k => {
    permissions[k] = !!document.getElementById('perm-' + k)?.checked;
  });

  if (editId) {
    const idx = db.accounts.findIndex(a => a.id === editId);
    if (idx !== -1) {
      db.accounts[idx] = {
        ...db.accounts[idx],
        role,
        userCode: userCode || db.accounts[idx].userCode,
        muridCode,
        name,
        username,
        pin,
        status: 'approved',
        permissions
      };
    }
    showToast('Akun user diperbarui.');
  } else {
    db.accounts.push({
      id: 'acc-' + Date.now(),
      role,
      userCode: userCode || tbGenerateCode(role === 'superadmin' ? 'ADM' : role === 'wali' ? 'SOL' : 'GRU', window.TBStore.activeDate),
      muridCode,
      name,
      username,
      pin,
      status: 'approved',
      permissions
    });
    showToast('Akun user baru ditambahkan.');
  }

  closeModal('modal-account');
  tbPushNode('accounts');
  renderAllViews();
}

function deleteAccount(accId) {
  if (!isSuperAdmin()) return;
  const target = (window.TBStore.db.accounts || []).find(a => a.id === accId);
  if (!target) return;
  if (target.id === window.TBStore.currentUser.id) {
    return showToast('Akun yang sedang dipakai login tidak dapat dihapus.', 'warn');
  }
  showConfirm(`Hapus akun "${target.name}" (@${target.username})?`, () => {
    window.TBStore.db.accounts = window.TBStore.db.accounts.filter(a => a.id !== accId);
    tbPushNode('accounts');
    showToast('Akun dihapus.');
    renderAllViews();
  });
}

function renderAccountManagementList() {
  const container = document.getElementById('account-list-container');
  if (!container) return;

  const list = (window.TBStore.db.accounts || []).filter(a => a.status !== 'pending');
  if (list.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-500">Belum ada akun aktif.</p>`;
    return;
  }

  container.innerHTML = list.map(a => `
    <div class="p-3 rounded-2xl bg-white/70 border border-white flex items-center justify-between gap-2">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">${escapeHtml(a.role)}</span>
          <span class="text-[10px] font-bold text-slate-600">${escapeHtml(a.userCode || '-')}</span>
        </div>
        <p class="text-xs font-extrabold text-slate-800 mt-0.5 truncate">${escapeHtml(a.name)}</p>
        <p class="text-[10.5px] text-slate-500 truncate">@${escapeHtml(a.username)} • PIN: ${escapeHtml(a.pin)}</p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button type="button" onclick="openAccountModal('${escapeHtml(a.id)}')" class="px-2.5 py-1 rounded-lg bg-white text-[11px] font-bold text-blue-700 border border-slate-200">Edit</button>
        ${a.id !== window.TBStore.currentUser.id ? `
          <button type="button" onclick="deleteAccount('${escapeHtml(a.id)}')" class="px-2.5 py-1 rounded-lg bg-rose-50 text-[11px] font-bold text-rose-700 border border-rose-200">Hapus</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function exportBackupJSON() {
  if (!isSuperAdmin()) return;
  const payload = JSON.stringify(window.TBStore.db, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `taman-belajar-backup-${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  showToast('Cadangan JSON berhasil diekspor.');
}

function importBackupJSON(event) {
  if (!isSuperAdmin()) return;
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      showConfirm('Pulihkan seluruh data dari file JSON ini? Data saat ini akan ditimpa.', () => {
        window.TBStore.db = tbNormalizeDB(parsed);
        tbSaveLocalDB();
        ['accounts', 'murid', 'attendance', 'mengaji', 'les', 'docs'].forEach(node => tbPushNode(node));
        showToast('Data cadangan JSON berhasil dipulihkan!');
        renderAllViews();
      });
    } catch (e) {
      showToast('File JSON tidak valid.', 'error');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}
