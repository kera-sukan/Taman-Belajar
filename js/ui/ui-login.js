// File: js/ui/ui-login.js | Build: V 0.06.11.24.2136
(function () {
  const slot = document.getElementById('slot-login');
  if (!slot) return;

  slot.innerHTML = `
    <div id="login-screen" class="fixed inset-0 z-50 flex flex-col justify-between p-5 overflow-y-auto bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white">
      <div class="text-center pt-4 pb-2 relative z-10">
        <div class="w-14 h-14 mx-auto mb-2.5 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
          <svg class="w-7 h-7 text-white"><use href="#ic-logo-home" /></svg>
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight">Taman Belajar</h1>
        <p class="text-xs text-blue-100 mt-0.5">Belajar • Mengaji • Berkembang</p>
      </div>

      <div class="liquid-glass-strong rounded-[28px] p-5 my-auto relative z-10">
        <div class="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-2xl mb-4">
          <button type="button" id="auth-tab-login" onclick="switchAuthMode('login')" class="py-2 text-xs font-extrabold rounded-xl bg-white text-blue-600 shadow-sm transition">Masuk (Login)</button>
          <button type="button" id="auth-tab-signup" onclick="switchAuthMode('signup')" class="py-2 text-xs font-bold rounded-xl text-slate-600 transition">Daftar (Sign Up)</button>
        </div>

        <div id="auth-panel-login" class="space-y-3.5">
          <div>
            <h2 class="text-base font-extrabold text-slate-800">Selamat Datang Kembali</h2>
            <p class="text-[11px] text-slate-500">Masukkan Username atau Nomor Induk dan PIN Anda.</p>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Username / Nomor Induk</label>
            <input type="text" id="login-username" autocomplete="off" placeholder="Contoh: superadmin atau SOL2611001"
              onkeydown="if(event.key==='Enter'){event.preventDefault();handleLogin();}"
              class="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">PIN Akses</label>
            <div class="relative">
              <input type="password" id="login-pin" inputmode="numeric" placeholder="Masukkan PIN"
                onkeydown="if(event.key==='Enter'){event.preventDefault();handleLogin();}"
                class="w-full pl-3.5 pr-14 py-2.5 glass-input rounded-xl text-sm" />
              <button type="button" onclick="togglePinVisibility('login-pin')" class="absolute right-3 top-2.5 text-slate-500 text-xs font-bold px-1 py-0.5">Lihat</button>
            </div>
          </div>
          <p id="login-error" class="hidden text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200"></p>
          <p id="login-info" class="hidden text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200"></p>
          <button type="button" onclick="handleLogin()" class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25">Masuk Sekarang</button>
          <div class="pt-1 text-center">
            <button type="button" onclick="fillDemoAdmin()" class="text-[11px] font-bold text-blue-700 hover:underline">Isi Cepat Akun Admin (superadmin / 1234)</button>
          </div>
        </div>

        <div id="auth-panel-signup" class="hidden space-y-3">
          <div>
            <h2 class="text-base font-extrabold text-slate-800">Pendaftaran Akun User</h2>
            <p class="text-[11px] text-slate-500">Nomor Induk diterbitkan otomatis setelah disetujui Admin.</p>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Daftar Sebagai *</label>
            <select id="signup-role" onchange="toggleSignupFields()" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-700">
              <option value="wali">Orang Tua / Wali Murid</option>
              <option value="guru">Guru Pengajar</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Nama Lengkap Pendaftar *</label>
            <input type="text" id="signup-name" placeholder="Nama lengkap Anda..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          </div>
          <div id="signup-child-fields" class="space-y-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/70">
            <div>
              <label class="block text-[11px] font-bold text-blue-900 mb-1">Nama Lengkap Anak (Murid) *</label>
              <input type="text" id="signup-child-name" placeholder="Nama anak yang didaftarkan..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-blue-900 mb-1">Program Belajar</label>
                <select id="signup-child-program" class="w-full px-2.5 py-2 glass-input rounded-xl text-xs font-semibold">
                  <option value="Keduanya">Mengaji &amp; Les</option>
                  <option value="Mengaji">Mengaji Saja</option>
                  <option value="Les">Les Saja</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-blue-900 mb-1">Kelas / Usia</label>
                <input type="text" id="signup-child-kelas" placeholder="SD Kelas 2" class="w-full px-2.5 py-2 glass-input rounded-xl text-xs" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Username Login *</label>
              <input type="text" id="signup-username" placeholder="Buat username" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Buat PIN *</label>
              <input type="text" id="signup-pin" inputmode="numeric" placeholder="4-6 angka" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold" />
            </div>
          </div>
          <p id="signup-feedback" class="hidden text-xs font-semibold px-3 py-2 rounded-xl border"></p>
          <button type="button" onclick="handleSignUp()" class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-2xl shadow-md">Kirim Pendaftaran ke Admin</button>
        </div>
      </div>

      <div class="text-center text-[11px] text-blue-100/90 pt-2 pb-1 relative z-10">
        Taman Belajar • <span class="app-version-label font-bold">V 0.06.11.24.2136</span>
      </div>
    </div>
  `;
})();