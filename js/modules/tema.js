// ============================================================================
// TAMAN BELAJAR - MODULE: KUSTOMISASI TEMA 3D GLASS
// Mengatur Mode (Terang/Gelap), Warna Dasar, Tingkat Kaca, & Model Ikon 3D
// ============================================================================

const TB_THEME_KEY = 'taman_belajar_theme_prefs_v1';

const TB_DEFAULT_THEME = {
  mode: 'light',      // 'light' | 'dark'
  accent: 'blue',     // 'blue' | 'red' | 'yellow' | 'green' | 'purple'
  glass: 'frosted',   // 'clear' | 'frosted' | 'solid'
  iconStyle: 'color'  // 'color' | 'mono'
};

let tbCurrentTheme = { ...TB_DEFAULT_THEME };

function tbLoadTheme() {
  try {
    const raw = window['local' + 'Storage']?.getItem(TB_THEME_KEY);
    if (raw) {
      tbCurrentTheme = { ...TB_DEFAULT_THEME, ...JSON.parse(raw) };
    }
  } catch (e) {}
  tbApplyThemeAttributes();
}

function tbSaveTheme() {
  try {
    window['local' + 'Storage']?.setItem(TB_THEME_KEY, JSON.stringify(tbCurrentTheme));
  } catch (e) {}
  tbApplyThemeAttributes();
  tbRenderThemeControls();
}

function tbApplyThemeAttributes() {
  const root = document.documentElement;
  root.setAttribute('data-mode', tbCurrentTheme.mode);
  root.setAttribute('data-accent', tbCurrentTheme.accent);
  root.setAttribute('data-glass', tbCurrentTheme.glass);
  root.setAttribute('data-icon-style', tbCurrentTheme.iconStyle);
}

function setThemeOption(key, value) {
  tbCurrentTheme[key] = value;
  tbSaveTheme();
  if (typeof showToast === 'function') {
    showToast('Tampilan tema diperbarui.', 'info');
  }
}

function tbMountThemeCard() {
  const targetSection = document.getElementById('view-atur');
  if (!targetSection || document.getElementById('theme-customizer-card')) return;

  const card = document.createElement('div');
  card.id = 'theme-customizer-card';
  card.className = 'liquid-glass-card p-4 rounded-2xl space-y-3.5';
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Tampilan &amp; Tema 3D Glass</h3>
        <p class="text-[11px] text-slate-500">Sesuaikan suasana layar, tingkat kaca &amp; gaya ikon</p>
      </div>
      <span class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xs icon-3d-badge">🎨</span>
    </div>
    <div id="theme-controls-body" class="space-y-3 text-xs"></div>
  `;

  // Sisipkan tepat setelah kartu pertama (Status Hak Akses) di halaman Pengaturan
  const firstCard = targetSection.children[1];
  if (firstCard && firstCard.nextSibling) {
    targetSection.insertBefore(card, firstCard.nextSibling);
  } else {
    targetSection.appendChild(card);
  }

  tbRenderThemeControls();
}

function tbRenderThemeControls() {
  const body = document.getElementById('theme-controls-body');
  if (!body) return;

  const accents = [
    { id: 'blue', label: 'Biru', dot: 'bg-blue-600' },
    { id: 'red', label: 'Merah', dot: 'bg-rose-600' },
    { id: 'yellow', label: 'Kuning', dot: 'bg-amber-500' },
    { id: 'green', label: 'Hijau', dot: 'bg-emerald-600' },
    { id: 'purple', label: 'Ungu', dot: 'bg-violet-600' }
  ];

  const glasses = [
    { id: 'clear', label: 'Bening' },
    { id: 'frosted', label: 'Frosted' },
    { id: 'solid', label: 'Padat' }
  ];

  body.innerHTML = `
    <!-- 1. Mode Terang / Gelap -->
    <div>
      <p class="text-[11px] font-bold text-slate-600 mb-1.5">1. Mode Layar</p>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" onclick="setThemeOption('mode', 'light')"
          class="py-2 px-3 rounded-xl font-bold border transition ${tbCurrentTheme.mode === 'light' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white/60 text-slate-700 border-white'}">
          ☀️ Terang
        </button>
        <button type="button" onclick="setThemeOption('mode', 'dark')"
          class="py-2 px-3 rounded-xl font-bold border transition ${tbCurrentTheme.mode === 'dark' ? 'bg-slate-900 text-white border-slate-700 shadow-sm' : 'bg-white/60 text-slate-700 border-white'}">
          🌙 Gelap
        </button>
      </div>
    </div>

    <!-- 2. Warna Dasar -->
    <div>
      <p class="text-[11px] font-bold text-slate-600 mb-1.5">2. Warna Dasar 3D Glass</p>
      <div class="grid grid-cols-5 gap-1.5">
        ${accents.map(a => `
          <button type="button" onclick="setThemeOption('accent', '${a.id}')"
            class="py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition ${tbCurrentTheme.accent === a.id ? 'bg-white text-slate-900 border-blue-500 ring-2 ring-blue-400/40 font-extrabold' : 'bg-white/55 text-slate-600 border-white font-semibold'}">
            <span class="w-4 h-4 rounded-full ${a.dot} shadow-xs"></span>
            <span class="text-[10px]">${a.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 3. Tema Glass (Bening, Frosted, Padat) -->
    <div>
      <p class="text-[11px] font-bold text-slate-600 mb-1.5">3. Efek Kaca (Glass)</p>
      <div class="grid grid-cols-3 gap-2">
        ${glasses.map(g => `
          <button type="button" onclick="setThemeOption('glass', '${g.id}')"
            class="py-2 px-2 rounded-xl font-bold border transition ${tbCurrentTheme.glass === g.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white/60 text-slate-700 border-white'}">
            ${g.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 4. Model Icon (Warna / Hitam Putih) -->
    <div>
      <p class="text-[11px] font-bold text-slate-600 mb-1.5">4. Model Ikon 3D</p>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" onclick="setThemeOption('iconStyle', 'color')"
          class="py-2 px-3 rounded-xl font-bold border transition ${tbCurrentTheme.iconStyle === 'color' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white/60 text-slate-700 border-white'}">
          🌈 Warna 3D
        </button>
        <button type="button" onclick="setThemeOption('iconStyle', 'mono')"
          class="py-2 px-3 rounded-xl font-bold border transition ${tbCurrentTheme.iconStyle === 'mono' ? 'bg-slate-800 text-white border-slate-700 shadow-sm' : 'bg-white/60 text-slate-700 border-white'}">
          ⚫ Hitam Putih 3D
        </button>
      </div>
    </div>
  `;
}

tbLoadTheme();
document.addEventListener('DOMContentLoaded', tbMountThemeCard);
if (document.readyState !== 'loading') tbMountThemeCard();
