// File: js/ui/ui-views.js | Build: V 0.06.11.24.2138
(function () {
  const mainArea = document.getElementById('main-scroll-area');
  if (!mainArea) return;

  mainArea.innerHTML = `
    <!-- BERANDA -->
    <section id="view-beranda" class="space-y-3.5">

      <!-- KARTU HERO UTAMA (PROFIL AKTIF & KONTROL TANGGAL) -->
      <div class="liquid-header-wave text-white rounded-[24px] p-4 relative overflow-hidden">
        <div class="flex items-center justify-between gap-3 relative z-10">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-white/20 border border-white/35 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6 text-white"><use href="#ic-grad" /></svg>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h2 id="hero-card-title" class="text-[15px] font-extrabold leading-tight truncate">Taman Belajar</h2>
                <span id="role-badge" class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-white/25 text-white shrink-0">Admin</span>
              </div>
              <p id="hero-card-sub" class="text-[11px] text-blue-100 mt-0.5 truncate">Program Mengaji &amp; Les Bimbel</p>
              <button type="button" onclick="openModule('murid')" class="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-[10.5px] font-bold text-white transition">
                <span id="hero-detail-btn-text">Lihat Detail Murid</span> <span>›</span>
              </button>
            </div>
          </div>

          <!-- Pemilih Tanggal Ringkas -->
          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <div class="inline-flex items-center bg-white/20 border border-white/30 rounded-full p-0.5">
              <button type="button" onclick="stepActiveDate(-1)" aria-label="Hari Sebelumnya" class="w-6 h-6 rounded-full hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center">‹</button>
              <label class="relative inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-white cursor-pointer">
                <svg class="w-3.5 h-3.5"><use href="#ic-calendar" /></svg>
                <span id="short-date-label">Hari Ini</span>
                <input type="date" id="date-picker" class="absolute inset-0 opacity-0 cursor-pointer" onchange="changeActiveDate(this.value)" />
              </label>
              <button type="button" onclick="stepActiveDate(1)" aria-label="Hari Berikutnya" class="w-6 h-6 rounded-full hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center">›</button>
            </div>
            <span id="active-date-label" class="text-[9.5px] text-blue-100/90 text-right max-w-[125px] truncate">-</span>
          </div>
        </div>
      </div>

      <!-- 4 KARTU STATISTIK RINGKAS -->
      <div class="grid grid-cols-4 gap-2">
        <button type="button" onclick="openModule('murid')" class="stat-mini-card liquid-glass-strong rounded-2xl p-2.5 flex flex-col items-center text-center gap-1">
          <span class="glyph-pill glyph-blue"><svg class="w-4 h-4"><use href="#ic-users" /></svg></span>
          <span id="stat-murid" class="text-[14px] font-extrabold text-slate-800 leading-none mt-0.5">0</span>
          <span id="stat-murid-label" class="text-[9.5px] font-semibold text-slate-500 leading-tight">Murid</span>
        </button>

        <button type="button" onclick="openModule('hadir'); setHadirSession('mengaji');" class="stat-mini-card liquid-glass-strong rounded-2xl p-2.5 flex flex-col items-center text-center gap-1">
          <span class="glyph-pill glyph-green"><svg class="w-4 h-4"><use href="#ic-check-circle" /></svg></span>
          <span id="stat-mengaji" class="text-[14px] font-extrabold text-slate-800 leading-none mt-0.5">0</span>
          <span class="text-[9.5px] font-semibold text-slate-500 leading-tight">Mengaji</span>
        </button>

        <button type="button" onclick="openModule('hadir'); setHadirSession('les');" class="stat-mini-card liquid-glass-strong rounded-2xl p-2.5 flex flex-col items-center text-center gap-1">
          <span class="glyph-pill glyph-purple"><svg class="w-4 h-4"><use href="#ic-grad" /></svg></span>
          <span id="stat-les" class="text-[14px] font-extrabold text-slate-800 leading-none mt-0.5">0</span>
          <span class="text-[9.5px] font-semibold text-slate-500 leading-tight">Hadir Les</span>
        </button>

        <button type="button" onclick="openModule('les')" class="stat-mini-card liquid-glass-strong rounded-2xl p-2.5 flex flex-col items-center text-center gap-1">
          <span class="glyph-pill glyph-amber"><svg class="w-4 h-4"><use href="#ic-star" /></svg></span>
          <span id="stat-avg-score" class="text-[14px] font-extrabold text-slate-800 leading-none mt-0.5">-</span>
          <span class="text-[9.5px] font-semibold text-slate-500 leading-tight">Rata-rata</span>
        </button>
      </div>

      <!-- BANNER PENDAFTAR BARU -->
      <div id="admin-pending-banner" class="hidden liquid-glass-strong border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="glyph-pill glyph-amber shrink-0"><svg class="w-4 h-4"><use href="#ic-bell" /></svg></span>
          <div class="min-w-0">
            <p id="admin-pending-text" class="text-xs font-extrabold text-amber-950 truncate">Ada pendaftar baru menunggu izin</p>
            <p class="text-[10.5px] text-amber-800 truncate">Ketuk untuk mengatur hak akses</p>
          </div>
        </div>
        <button type="button" onclick="switchTab('atur')" class="px-3 py-1.5 bg-amber-500 text-white text-[11px] font-bold rounded-xl shrink-0">Tinjau</button>
      </div>

      <!-- AKSI CEPAT -->
      <div class="liquid-glass-strong rounded-[24px] p-3.5 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-600"><use href="#ic-bolt" /></svg>
            <h3 class="text-xs font-extrabold text-slate-800">Aksi Cepat</h3>
          </div>
          <button type="button" onclick="openModule('murid')" class="text-[11px] font-bold text-blue-600 hover:underline">Data Murid ›</button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <button type="button" id="tile-les" onclick="openModule('les')" class="quick-glyph-tile rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5">
            <span class="glyph-box glyph-blue"><svg class="w-5 h-5"><use href="#ic-grad" /></svg></span>
            <span class="text-[10.5px] font-bold text-slate-700 leading-tight">Nilai Les</span>
          </button>

          <button type="button" id="tile-mengaji" onclick="openModule('mengaji')" class="quick-glyph-tile rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5">
            <span class="glyph-box glyph-green"><svg class="w-5 h-5"><use href="#ic-book" /></svg></span>
            <span class="text-[10.5px] font-bold text-slate-700 leading-tight">Mengaji</span>
          </button>

          <button type="button" id="tile-hadir" onclick="openModule('hadir')" class="quick-glyph-tile rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5">
            <span class="glyph-box glyph-amber"><svg class="w-5 h-5"><use href="#ic-check-circle" /></svg></span>
            <span class="text-[10.5px] font-bold text-slate-700 leading-tight">Absensi</span>
          </button>

          <button type="button" id="tile-laporan" onclick="openModule('laporan')" class="quick-glyph-tile rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5">
            <span class="glyph-box glyph-purple"><svg class="w-5 h-5"><use href="#ic-doc" /></svg></span>
            <span class="text-[10.5px] font-bold text-slate-700 leading-tight">Laporan</span>
          </button>
        </div>
      </div>

      <!-- PROGRESS BELAJAR -->
      <div class="liquid-glass-strong rounded-[24px] p-3.5 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-600"><use href="#ic-trend" /></svg>
            <h3 class="text-xs font-extrabold text-slate-800">Progress Belajar</h3>
          </div>
          <span id="progress-period-pill" class="px-2.5 py-0.5 rounded-full bg-white/80 border border-white text-[10px] font-bold text-slate-600">Tanggal Aktif</span>
        </div>

        <div class="flex items-center gap-3.5 pt-0.5">
          <div id="progress-ring" class="progress-donut shrink-0" style="--pct: 0%;">
            <div class="progress-donut-inner">
              <span id="progress-pct-text" class="text-[13px] font-extrabold text-slate-800">0%</span>
            </div>
          </div>
          <div class="min-w-0 space-y-0.5">
            <p id="progress-status-title" class="text-[13.5px] font-extrabold text-emerald-700">Siap Belajar!</p>
            <p id="progress-status-desc" class="text-[11px] text-slate-600 leading-snug">Catat absensi mengaji dan les untuk memantau grafik capaian.</p>
          </div>
        </div>
      </div>

      <!-- AKTIVITAS TERBARU -->
      <div class="liquid-glass-strong rounded-[24px] p-3.5 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-blue-600"><use href="#ic-clock" /></svg>
            <h3 class="text-xs font-extrabold text-slate-800">Aktivitas Terbaru</h3>
          </div>
          <span id="today-activity-count" class="text-[10.5px] font-bold text-blue-600">0 Catatan</span>
        </div>
        <div id="today-activity-list" class="space-y-2 text-xs text-slate-600"></div>
      </div>

      <!-- DOKUMENTASI KEGIATAN -->
      <div class="liquid-glass-strong rounded-[24px] p-3.5 space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <svg class="w-4 h-4 text-blue-600 shrink-0"><use href="#ic-image" /></svg>
            <h3 class="text-xs font-extrabold text-slate-800 truncate">Dokumentasi Kegiatan</h3>
          </div>
          <button type="button" id="btn-add-doc" onclick="openDocModal()" class="text-[11px] font-bold text-blue-600 hover:underline shrink-0">+ Tambah Foto ›</button>
        </div>

        <div id="dashboard-doc-list" onscroll="updateDocCarouselDots()" class="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 scroll-smooth"></div>
        <div id="doc-dots-indicator" class="flex items-center justify-center gap-1.5 pt-0.5"></div>
      </div>

    </section>

    <!-- MURID -->
    <section id="view-murid" class="hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-extrabold text-slate-800">Identitas &amp; Data Murid</h2>
          <p class="text-xs text-slate-500">Format ID otomatis: SOL + Tahun + Bulan + Urut</p>
        </div>
        <button type="button" id="btn-add-murid" onclick="openMuridModal()" class="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-sm">+ Tambah</button>
      </div>
      <input type="text" id="search-murid" oninput="renderMuridList()" placeholder="Cari nama atau Nomor Murid (SOL2611001)..." class="w-full px-3.5 py-2.5 glass-input rounded-2xl text-xs" />
      <div id="murid-list-container" class="space-y-3"></div>
    </section>

    <!-- HADIR -->
    <section id="view-hadir" class="hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-extrabold text-slate-800">Absensi Kehadiran</h2>
          <p class="text-xs text-slate-500">Tandai kehadiran sesi Mengaji &amp; Les</p>
        </div>
        <button type="button" id="btn-hadir-semua" onclick="markAllPresent()" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm">Hadirkan Semua</button>
      </div>
      <div class="grid grid-cols-2 gap-2 liquid-glass-card p-1 rounded-2xl">
        <button type="button" id="subtab-hadir-mengaji" onclick="setHadirSession('mengaji')" class="py-2 text-xs font-extrabold rounded-xl bg-emerald-600 text-white shadow-sm transition">Sesi Mengaji</button>
        <button type="button" id="subtab-hadir-les" onclick="setHadirSession('les')" class="py-2 text-xs font-bold rounded-xl text-slate-600 transition">Sesi Les &amp; Bimbel</button>
      </div>
      <div id="hadir-list-container" class="space-y-2"></div>
    </section>

    <!-- MENGAJI -->
    <section id="view-mengaji" class="hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-extrabold text-slate-800">Catatan Mengaji</h2>
          <p class="text-xs text-slate-500">Progres Iqra, Al-Qur'an &amp; kelancaran</p>
        </div>
        <button type="button" id="btn-add-mengaji" onclick="openMengajiModal()" class="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm">+ Catat Mengaji</button>
      </div>
      <div id="mengaji-list-container" class="space-y-2.5"></div>
    </section>

    <!-- LES -->
    <section id="view-les" class="hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-extrabold text-slate-800">Catatan Les &amp; Bimbel</h2>
          <p class="text-xs text-slate-500">Mata pelajaran, topik &amp; evaluasi nilai</p>
        </div>
        <button type="button" id="btn-add-les" onclick="openLesModal()" class="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm">+ Catat Les</button>
      </div>
      <div id="les-list-container" class="space-y-2.5"></div>
    </section>

    <!-- LAPORAN -->
    <section id="view-laporan" class="hidden space-y-4">
      <div>
        <h2 class="text-base font-extrabold text-slate-800">Laporan Perkembangan</h2>
        <p class="text-xs text-slate-500">Unduh langsung PDF (2 halaman) atau salin WA</p>
      </div>
      <div class="liquid-glass-card p-4 rounded-2xl space-y-3">
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Pilih Murid</label>
          <select id="report-murid-select" onchange="renderReportPreview()" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold"></select>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Bulan Laporan</label>
            <input type="month" id="report-month-input" onchange="renderReportPreview()" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold" />
          </div>
          <div class="flex items-end">
            <button type="button" id="btn-download-pdf" onclick="generateAndDownloadPDF()" class="w-full py-2 px-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold rounded-xl shadow-sm">Unduh PDF</button>
          </div>
        </div>
        <p id="pdf-status-msg" class="hidden text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200"></p>
        <button type="button" onclick="copyWhatsAppReport()" class="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm">Salin Format WhatsApp Wali Murid</button>
      </div>
      <div id="report-preview-card" class="liquid-glass-card p-4 rounded-2xl space-y-3 text-xs"></div>
    </section>

    <!-- PENGATURAN & AKUN -->
    <section id="view-atur" class="hidden space-y-4">
      <div>
        <h2 class="text-base font-extrabold text-slate-800">Pengaturan &amp; Akun</h2>
        <p class="text-xs text-slate-500">Tema 3D glass, izin user &amp; sinkronisasi cloud</p>
      </div>

      <div class="liquid-glass-card p-4 rounded-2xl space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700">Status Hak Akses</span>
          <span id="settings-role-pill" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">ADMIN</span>
        </div>
        <p id="settings-account-desc" class="text-xs text-slate-600 leading-relaxed"></p>
        <div class="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
          <span>Versi Build</span>
          <span class="app-version-label font-extrabold text-slate-700">V 0.06.11.24.2138</span>
        </div>
      </div>

      <div id="admin-approval-panel" class="hidden liquid-glass-strong border-amber-300 p-4 rounded-2xl space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xs font-extrabold text-amber-950 uppercase tracking-wider">Permintaan Pendaftaran User Baru</h3>
            <p class="text-[11px] text-slate-600">Atur checklist izin modul sebelum menyetujui</p>
          </div>
          <span id="pending-badge-count" class="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold">0</span>
        </div>
        <div id="pending-users-container" class="space-y-3"></div>
      </div>

      <div class="liquid-glass-card p-4 rounded-2xl space-y-3">
        <div>
          <h3 class="text-xs font-extrabold text-blue-950 uppercase tracking-wider">Ubah Username &amp; PIN Saya</h3>
          <p class="text-[11px] text-slate-600">Nomor Induk: <b id="self-acc-code">-</b></p>
        </div>
        <div class="space-y-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Nama Tampilan</label>
            <input type="text" id="self-acc-name" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Username Baru</label>
              <input type="text" id="self-acc-username" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">PIN Baru</label>
              <div class="relative">
                <input type="password" id="self-acc-pin" class="w-full pl-3 pr-10 py-2 glass-input rounded-xl text-xs font-bold" />
                <button type="button" onclick="togglePinVisibility('self-acc-pin')" class="absolute right-2 top-2 text-[10px] font-bold text-slate-500">Lihat</button>
              </div>
            </div>
          </div>
          <button type="button" onclick="saveSelfAccountChanges()" class="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm">Simpan Perubahan Akun Saya</button>
        </div>
      </div>

      <div id="superadmin-account-panel" class="hidden liquid-glass-card p-4 rounded-2xl space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h3 class="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Kontrol Semua Akun User (Admin)</h3>
            <p class="text-[11px] text-slate-600">Kelola nomor induk, PIN &amp; izin modul</p>
          </div>
          <button type="button" onclick="openAccountModal()" class="px-2.5 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl shrink-0">+ User</button>
        </div>
        <div id="account-list-container" class="space-y-2"></div>
      </div>

      <div id="backup-panel" class="hidden liquid-glass-card p-4 rounded-2xl space-y-3">
        <div>
          <h3 class="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Cadangan Database (Khusus Admin)</h3>
          <p class="text-[11px] text-slate-600">Ekspor atau pulihkan seluruh data dalam file JSON</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" onclick="exportBackupJSON()" class="py-2.5 px-3 bg-slate-800 text-white text-xs font-bold rounded-xl">Ekspor JSON</button>
          <label class="py-2.5 px-3 bg-white/80 text-slate-700 text-xs font-bold rounded-xl text-center cursor-pointer border border-slate-200">
            Impor JSON
            <input type="file" accept=".json" onchange="importBackupJSON(event)" class="hidden" />
          </label>
        </div>
      </div>
    </section>
  `;
})();