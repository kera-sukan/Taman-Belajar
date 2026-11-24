// File: js/ui/ui-modals.js | Build: V 0.06.11.24.2143
(function () {
  const slot = document.getElementById('slot-modals');
  if (!slot) return;

  slot.innerHTML = `
    <!-- MODAL DOKUMENTASI FOTO -->
    <div id="modal-doc" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
      <div class="liquid-glass-strong w-full max-w-md rounded-3xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-800">Tambah Dokumentasi Kegiatan</h3>
          <button type="button" onclick="closeModal('modal-doc')" class="px-2.5 py-1 rounded-lg bg-white/80 text-xs font-bold text-slate-600">Tutup</button>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Pilih / Ambil Foto Kegiatan *</label>
          <input type="file" id="doc-photo-input" accept="image/*" onchange="previewDocPhoto(event)" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          <img id="doc-photo-preview" class="hidden mt-2 w-full h-40 object-cover rounded-2xl border border-white" alt="Pratinjau Foto" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Keterangan Singkat *</label>
          <input type="text" id="doc-caption" placeholder="Contoh: Setoran hafalan Juz 30..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-600 bg-white/60 px-3 py-2 rounded-xl">
          <span>Tanggal Otomatis:</span>
          <b id="doc-auto-date-label" class="text-slate-800">-</b>
        </div>
        <button type="button" onclick="saveDocForm()" class="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold rounded-xl shadow-md">Simpan Dokumentasi</button>
      </div>
    </div>

    <!-- MODAL LIHAT FOTO DOKUMENTASI -->
    <div id="modal-doc-view" class="hidden fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4" onclick="closeModal('modal-doc-view')">
      <div class="liquid-glass-strong w-full max-w-md rounded-3xl overflow-hidden" onclick="event.stopPropagation()">
        <img id="doc-view-img" class="w-full max-h-[65vh] object-contain bg-slate-900" alt="Dokumentasi" />
        <div class="p-4 space-y-1.5">
          <div class="flex items-center justify-between text-[11px] text-slate-500">
            <span id="doc-view-meta" class="font-bold text-blue-700">-</span>
            <button type="button" onclick="closeModal('modal-doc-view')" class="px-2.5 py-1 rounded-lg bg-white/80 text-slate-700 font-bold">Tutup</button>
          </div>
          <p id="doc-view-caption" class="text-xs font-bold text-slate-800"></p>
        </div>
      </div>
    </div>

    <!-- MODAL DATA MURID -->
    <div id="modal-murid" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
      <div class="liquid-glass-strong w-full max-w-md rounded-3xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 id="modal-murid-title" class="text-base font-extrabold text-slate-800">Tambah Data Murid</h3>
          <button type="button" onclick="closeModal('modal-murid')" class="px-2.5 py-1 rounded-lg bg-white/80 text-xs font-bold text-slate-600">Tutup</button>
        </div>
        <input type="hidden" id="murid-edit-id" />
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Nomor Murid *</label>
            <input type="text" id="murid-code" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold uppercase" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">PIN Wali Murid *</label>
            <input type="text" id="murid-pin" value="1234" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Nama Lengkap Murid *</label>
          <input type="text" id="murid-name" placeholder="Nama anak..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Program Belajar</label>
            <select id="murid-program" class="w-full px-3 py-2 glass-input rounded-xl text-xs">
              <option value="Keduanya">Mengaji &amp; Les</option>
              <option value="Mengaji">Mengaji Saja</option>
              <option value="Les">Les &amp; Bimbel Saja</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Kelas / Usia</label>
            <input type="text" id="murid-kelas" placeholder="SD Kelas 2" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Nama Wali Murid</label>
          <input type="text" id="murid-wali" placeholder="Nama orang tua / wali..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <button type="button" onclick="saveMuridForm()" class="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md">Simpan Data Murid</button>
      </div>
    </div>

    <!-- MODAL CATATAN MENGAJI -->
    <div id="modal-mengaji" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
      <div class="liquid-glass-strong w-full max-w-md rounded-3xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 id="modal-mengaji-title" class="text-base font-extrabold text-slate-800">Catat Mengaji</h3>
          <button type="button" onclick="closeModal('modal-mengaji')" class="px-2.5 py-1 rounded-lg bg-white/80 text-xs font-bold text-slate-600">Tutup</button>
        </div>
        <input type="hidden" id="mengaji-edit-id" />
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Pilih Murid *</label>
          <select id="mengaji-murid-id" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold"></select>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Jilid / Juz *</label>
            <input type="text" id="mengaji-jilid" placeholder="Iqro 3 / Juz 30" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Halaman / Ayat *</label>
            <input type="text" id="mengaji-halaman" placeholder="Hal. 14-15" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Predikat Kelancaran</label>
            <select id="mengaji-nilai" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold">
              <option value="Sangat Lancar (A)">Sangat Lancar (A)</option>
              <option value="Lancar (B)">Lancar (B)</option>
              <option value="Cukup (C)">Cukup (C)</option>
              <option value="Ulang Halaman (D)">Ulang Halaman (D)</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Skor (0-100)</label>
            <input type="number" id="mengaji-skor" min="0" max="100" value="88" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Catatan Guru</label>
          <input type="text" id="mengaji-catatan" placeholder="Makhraj huruf sudah bagus..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <button type="button" onclick="saveMengajiForm()" class="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md">Simpan Catatan Mengaji</button>
      </div>
    </div>

    <!-- MODAL CATATAN LES -->
    <div id="modal-les" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
      <div class="liquid-glass-strong w-full max-w-md rounded-3xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 id="modal-les-title" class="text-base font-extrabold text-slate-800">Catat Nilai &amp; Materi Les</h3>
          <button type="button" onclick="closeModal('modal-les')" class="px-2.5 py-1 rounded-lg bg-white/80 text-xs font-bold text-slate-600">Tutup</button>
        </div>
        <input type="hidden" id="les-edit-id" />
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Pilih Murid *</label>
          <select id="les-murid-id" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold"></select>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Mata Pelajaran *</label>
            <input type="text" id="les-mapel" placeholder="Matematika / Calistung" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Nilai (0-100) *</label>
            <input type="number" id="les-nilai" min="0" max="100" value="90" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold" />
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Materi / Topik *</label>
          <input type="text" id="les-materi" placeholder="Perkalian dasar &amp; soal cerita" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Catatan Evaluasi</label>
          <input type="text" id="les-catatan" placeholder="Cepat memahami konsep..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <button type="button" onclick="saveLesForm()" class="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md">Simpan Catatan Les</button>
      </div>
    </div>

    <!-- MODAL AKUN USER -->
    <div id="modal-account" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div class="liquid-glass-strong w-full max-w-md rounded-3xl p-5 space-y-3 my-auto">
        <div class="flex items-center justify-between">
          <h3 id="modal-account-title" class="text-base font-extrabold text-slate-800">Kelola Akun User</h3>
          <button type="button" onclick="closeModal('modal-account')" class="px-2.5 py-1 rounded-lg bg-white/80 text-xs font-bold text-slate-600">Tutup</button>
        </div>
        <input type="hidden" id="acc-edit-id" />
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Jenis User *</label>
            <select id="acc-role" onchange="onAccRoleChange()" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold">
              <option value="guru">User (Guru)</option>
              <option value="wali">User (Orang Tua)</option>
              <option value="superadmin">Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Nomor Induk</label>
            <input type="text" id="acc-user-code" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold uppercase" />
          </div>
        </div>
        <div id="acc-murid-wrapper" class="hidden">
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Tautkan ke Anak (Murid) *</label>
          <select id="acc-murid-code" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-semibold"></select>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 mb-1">Nama Tampilan *</label>
          <input type="text" id="acc-name" placeholder="Nama lengkap user..." class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">Username Login *</label>
            <input type="text" id="acc-username" placeholder="username" class="w-full px-3 py-2 glass-input rounded-xl text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-600 mb-1">PIN Login *</label>
            <input type="text" id="acc-pin" value="1234" class="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold" />
          </div>
        </div>
        <div id="acc-permissions-box" class="p-3 rounded-2xl bg-white/60 border border-white space-y-2">
          <p class="text-[11px] font-extrabold text-slate-700 uppercase">Checklist Izin Akses Modul:</p>
          <div class="grid grid-cols-2 gap-1.5 text-xs">
            <label class="flex items-center gap-2 font-semibold text-slate-700"><input type="checkbox" id="perm-les" checked /> Les &amp; Bimbel</label>
            <label class="flex items-center gap-2 font-semibold text-slate-700"><input type="checkbox" id="perm-mengaji" checked /> Mengaji</label>
            <label class="flex items-center gap-2 font-semibold text-slate-700"><input type="checkbox" id="perm-hadir" checked /> Kehadiran</label>
            <label class="flex items-center gap-2 font-semibold text-slate-700"><input type="checkbox" id="perm-laporan" checked /> Laporan PDF</label>
            <label class="flex items-center gap-2 font-semibold text-slate-700"><input type="checkbox" id="perm-murid" checked /> Data Murid</label>
            <label class="flex items-center gap-2 font-semibold text-slate-700"><input type="checkbox" id="perm-dokumentasi" checked /> Dokumentasi Foto</label>
          </div>
        </div>
        <button type="button" onclick="saveAccountForm()" class="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md">Simpan Akun User</button>
      </div>
    </div>
  `;
})();
