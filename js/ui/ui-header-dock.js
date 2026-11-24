// File: js/ui/ui-header-dock.js | Build: V 0.06.11.24.2208
(function () {
  const headerSlot = document.getElementById('slot-header');
  const dockSlot = document.getElementById('slot-dock');

  if (headerSlot) {
    headerSlot.innerHTML = `
      <header class="shrink-0 relative z-20 px-4 pt-3.5 pb-2">
        <div class="flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-10 h-10 rounded-2xl liquid-header-wave text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg class="w-5 h-5"><use href="#ic-logo-home" /></svg>
            </div>
            <div class="min-w-0">
              <h1 class="text-[15px] font-extrabold text-slate-800 leading-tight truncate">Hai, <span id="user-display-name">Super Admin</span>!</h1>
              <p class="text-[11px] text-slate-500 leading-tight truncate mt-0.5">Selamat datang di Taman Belajar</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" id="header-notif-btn" onclick="switchTab('atur')" aria-label="Notifikasi & Pendaftar" class="relative w-9 h-9 rounded-full liquid-glass-strong flex items-center justify-center text-slate-700 hover:text-blue-600 transition">
              <svg class="w-[18px] h-[18px]"><use href="#ic-bell" /></svg>
              <span id="header-pending-dot" class="hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
            <button type="button" onclick="switchTab('atur')" aria-label="Pengaturan & Tema" class="w-9 h-9 rounded-full liquid-glass-strong flex items-center justify-center text-slate-700 hover:text-blue-600 transition">
              <svg class="w-[18px] h-[18px]"><use href="#ic-gear" /></svg>
            </button>
            <button type="button" onclick="logout()" aria-label="Keluar" class="w-9 h-9 rounded-full liquid-glass-strong flex items-center justify-center text-slate-700 hover:text-rose-600 transition">
              <svg class="w-[18px] h-[18px]"><use href="#ic-logout" /></svg>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  if (dockSlot) {
    dockSlot.innerHTML = `
      <!-- POP-UP AKSI CEPAT DARI TOMBOL TENGAH (+) -->
      <div id="quick-action-popup" class="quick-action-sheet liquid-glass-strong rounded-[26px] p-3.5 space-y-2">
        <div class="flex items-center justify-between px-1 pb-1 border-b border-slate-200/70">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Tambah Catatan</span>
          <button type="button" onclick="closeQuickMenu()" class="text-[11px] font-bold text-slate-500">Tutup</button>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button type="button" onclick="quickLaunch('mengaji')" class="p-2.5 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/70 text-left flex items-center gap-2">
            <span class="glyph-pill glyph-green shrink-0"><svg class="w-4 h-4"><use href="#ic-book" /></svg></span>
            <span class="font-bold text-slate-800 leading-tight">Nilai Mengaji</span>
          </button>
          <button type="button" onclick="quickLaunch('les')" class="p-2.5 rounded-2xl bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/70 text-left flex items-center gap-2">
            <span class="glyph-pill glyph-blue shrink-0"><svg class="w-4 h-4"><use href="#ic-grad" /></svg></span>
            <span class="font-bold text-slate-800 leading-tight">Nilai Les</span>
          </button>
          <button type="button" onclick="quickLaunch('hadir')" class="p-2.5 rounded-2xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/70 text-left flex items-center gap-2">
            <span class="glyph-pill glyph-amber shrink-0"><svg class="w-4 h-4"><use href="#ic-check-circle" /></svg></span>
            <span class="font-bold text-slate-800 leading-tight">Kehadiran</span>
          </button>
          <button type="button" onclick="quickLaunch('doc')" class="p-2.5 rounded-2xl bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/70 text-left flex items-center gap-2">
            <span class="glyph-pill glyph-rose shrink-0"><svg class="w-4 h-4"><use href="#ic-image" /></svg></span>
            <span class="font-bold text-slate-800 leading-tight">Foto Kegiatan</span>
          </button>
        </div>
      </div>

      <!-- CAPSULE DOCK MELAYANG DENGAN EFEK GELOMBANG & TOMBOL TENGAH 3D (+) -->
      <nav class="capsule-dock-wrapper" aria-label="Navigasi Utama">
        <div id="capsule-dock-surface" class="capsule-dock">
          <div id="capsule-wave-layer" class="capsule-wave-sheen"></div>

          <button type="button" onclick="switchTab('beranda')" data-nav="beranda" class="dock-item active">
            <svg class="w-[18px] h-[18px] mb-0.5"><use href="#ic-home" /></svg>
            <span class="text-[10px]">Beranda</span>
          </button>

          <button type="button" onclick="openModule('les')" data-nav="les" class="dock-item">
            <svg class="w-[18px] h-[18px] mb-0.5"><use href="#ic-chart" /></svg>
            <span class="text-[10px]">Nilai</span>
          </button>

          <div class="dock-fab-slot">
            <button type="button" id="dock-plus-btn" onclick="toggleQuickMenu()" aria-label="Menu Cepat" class="dock-fab-center">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
              </svg>
            </button>
          </div>

          <button type="button" onclick="openModule('laporan')" data-nav="laporan" class="dock-item">
            <svg class="w-[18px] h-[18px] mb-0.5"><use href="#ic-doc" /></svg>
            <span class="text-[10px]">Laporan</span>
          </button>

          <button type="button" onclick="switchTab('atur')" data-nav="atur" class="dock-item">
            <svg class="w-[18px] h-[18px] mb-0.5"><use href="#ic-user" /></svg>
            <span class="text-[10px]">Profil</span>
          </button>
        </div>
      </nav>
    `;
  }
})();
