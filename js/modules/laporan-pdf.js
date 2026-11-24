// File: js/modules/laporan-pdf.js | Build: V 0.06.11.24.2152
function getReportMonthValue() {
  const inp = document.getElementById('report-month-input');
  if (inp && inp.value) return inp.value;
  const active = window.TBStore.activeDate || new Date().toISOString().slice(0, 10);
  const ym = active.slice(0, 7);
  if (inp) inp.value = ym;
  return ym;
}

function buildStudentMonthlySummary(murid, monthStr) {
  const db = window.TBStore.db;
  const mId = murid.id;

  let hadirMengaji = 0;
  let hadirLes = 0;
  Object.keys(db.attendance || {}).forEach(dateKey => {
    if (dateKey.startsWith(monthStr)) {
      const day = db.attendance[dateKey] || {};
      if (Array.isArray(day.mengaji) && day.mengaji.includes(mId)) hadirMengaji++;
      if (Array.isArray(day.les) && day.les.includes(mId)) hadirLes++;
    }
  });

  const mengajiItems = (db.mengaji || []).filter(x => x.muridId === mId && String(x.date || x.ts || '').startsWith(monthStr));
  const lesItems = (db.les || []).filter(x => x.muridId === mId && String(x.date || x.ts || '').startsWith(monthStr));

  const lesNums = lesItems.map(x => Number(x.nilai)).filter(n => !isNaN(n));
  const avgLes = lesNums.length > 0 ? Math.round(lesNums.reduce((a, b) => a + b, 0) / lesNums.length) : null;

  const mgjNums = mengajiItems.map(x => Number(x.skor)).filter(n => !isNaN(n) && n > 0);
  const avgMengaji = mgjNums.length > 0 ? Math.round(mgjNums.reduce((a, b) => a + b, 0) / mgjNums.length) : null;

  return {
    murid,
    monthStr,
    hadirMengaji,
    hadirLes,
    mengajiItems,
    lesItems,
    avgLes,
    avgMengaji
  };
}

function renderReportOptionsAndPreview() {
  const sel = document.getElementById('report-murid-select');
  if (!sel) return;

  const kids = getAccessibleMurid();
  if (kids.length === 0) {
    sel.innerHTML = `<option value="">Tidak ada data murid</option>`;
    const card = document.getElementById('report-preview-card');
    if (card) card.innerHTML = `<p class="text-slate-500">Belum ada data murid untuk ditampilkan.</p>`;
    return;
  }

  const prevVal = sel.value;
  sel.innerHTML = kids.map(m =>
    `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)} (${escapeHtml(m.code)})</option>`
  ).join('');
  if (prevVal && kids.some(k => k.id === prevVal)) {
    sel.value = prevVal;
  }

  getReportMonthValue();
  renderReportPreview();
}

function renderReportPreview() {
  const sel = document.getElementById('report-murid-select');
  const card = document.getElementById('report-preview-card');
  if (!sel || !card) return;

  const murid = getMuridById(sel.value);
  if (!murid) {
    card.innerHTML = `<p class="text-slate-500">Pilih murid terlebih dahulu.</p>`;
    return;
  }

  const monthStr = getReportMonthValue();
  const s = buildStudentMonthlySummary(murid, monthStr);

  card.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-200/70 pb-2">
      <div>
        <h3 class="text-sm font-extrabold text-slate-800">${escapeHtml(murid.name)}</h3>
        <p class="text-[11px] text-slate-500">${escapeHtml(murid.code)} • ${escapeHtml(murid.kelas || '-')} • Periode ${escapeHtml(monthStr)}</p>
      </div>
      <span class="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-[10px] font-extrabold">Rata-rata Les: ${s.avgLes !== null ? s.avgLes : '-'}</span>
    </div>

    <div class="grid grid-cols-2 gap-2 text-center">
      <div class="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70">
        <p class="text-[10px] font-bold text-emerald-800">Hadir Mengaji</p>
        <p class="text-base font-extrabold text-emerald-950">${s.hadirMengaji} Sesi</p>
      </div>
      <div class="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/70">
        <p class="text-[10px] font-bold text-blue-800">Hadir Les</p>
        <p class="text-base font-extrabold text-blue-950">${s.hadirLes} Sesi</p>
      </div>
    </div>

    <div class="space-y-1.5">
      <p class="text-[11px] font-extrabold text-slate-700">Catatan Mengaji (${s.mengajiItems.length})</p>
      ${s.mengajiItems.length === 0
        ? `<p class="text-[11px] text-slate-500">Belum ada catatan mengaji pada bulan ini.</p>`
        : s.mengajiItems.slice(0, 5).map(x => `
            <div class="p-2 rounded-xl bg-white/65 text-[11px] flex justify-between gap-2">
              <span class="font-semibold text-slate-800">${escapeHtml(x.jilid)} (${escapeHtml(x.halaman)})</span>
              <span class="font-bold text-emerald-700 shrink-0">${escapeHtml(x.nilai || '')}</span>
            </div>
          `).join('')
      }
    </div>

    <div class="space-y-1.5">
      <p class="text-[11px] font-extrabold text-slate-700">Catatan Les (${s.lesItems.length})</p>
      ${s.lesItems.length === 0
        ? `<p class="text-[11px] text-slate-500">Belum ada catatan les pada bulan ini.</p>`
        : s.lesItems.slice(0, 5).map(x => `
            <div class="p-2 rounded-xl bg-white/65 text-[11px] flex justify-between gap-2">
              <span class="font-semibold text-slate-800">${escapeHtml(x.mapel)}: ${escapeHtml(x.materi)}</span>
              <span class="font-bold text-blue-700 shrink-0">Nilai ${escapeHtml(x.nilai)}</span>
            </div>
          `).join('')
      }
    </div>
  `;
}

function buildWhatsAppText(s) {
  const lines = [
    `*LAPORAN PERKEMBANGAN TAMAN BELAJAR*`,
    `Periode: *${s.monthStr}*`,
    `Nama Murid: *${s.murid.name}* (${s.murid.code})`,
    `Kelas: ${s.murid.kelas || '-'}`,
    ``,
    `*Rekap Kehadiran:*`,
    `- Mengaji: ${s.hadirMengaji} sesi`,
    `- Les & Bimbel: ${s.hadirLes} sesi`,
    ``,
    `*Capaian Mengaji (${s.mengajiItems.length} catatan):*`
  ];

  if (s.mengajiItems.length === 0) {
    lines.push(`- Belum ada catatan bulan ini.`);
  } else {
    s.mengajiItems.slice(0, 6).forEach(x => {
      lines.push(`- [${x.date || '-'}] ${x.jilid} (${x.halaman}) — ${x.nilai || '-'}${x.catatan ? ` (${x.catatan})` : ''}`);
    });
  }

  lines.push(``);
  lines.push(`*Capaian Les (${s.lesItems.length} catatan${s.avgLes !== null ? `, Rata-rata: ${s.avgLes}` : ''}):*`);
  if (s.lesItems.length === 0) {
    lines.push(`- Belum ada catatan bulan ini.`);
  } else {
    s.lesItems.slice(0, 6).forEach(x => {
      lines.push(`- [${x.date || '-'}] ${x.mapel}: ${x.materi} — Nilai *${x.nilai}*${x.catatan ? ` (${x.catatan})` : ''}`);
    });
  }

  return lines.join('\n');
}

function copyWhatsAppReport() {
  const muridId = document.getElementById('report-murid-select')?.value;
  const murid = getMuridById(muridId);
  if (!murid) return showToast('Pilih murid terlebih dahulu.', 'warn');

  const text = buildWhatsAppText(buildStudentMonthlySummary(murid, getReportMonthValue()));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Laporan WhatsApp berhasil disalin!');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Laporan WhatsApp berhasil disalin!');
  } catch (e) {
    showToast('Gagal menyalin teks.', 'error');
  }
  document.body.removeChild(ta);
}

function pdfCleanText(str) {
  return String(str || '').replace(/[^\x20-\x7E]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildTwoPagePdfBlob(s) {
  const page1Ops = [
    'BT',
    '/F1 16 Tf', '48 790 Td', `(LAPORAN PERKEMBANGAN TAMAN BELAJAR) Tj`,
    '/F2 10 Tf', '0 -18 Td', `(Periode: ${pdfCleanText(s.monthStr)}  |  Versi: ${pdfCleanText(tbGetAppVersion())}) Tj`,
    '/F1 12 Tf', '0 -28 Td', `(Identitas Murid) Tj`,
    '/F2 10 Tf', '0 -16 Td', `(Nama: ${pdfCleanText(s.murid.name)}  |  No. Induk: ${pdfCleanText(s.murid.code)}) Tj`,
    '0 -14 Td', `(Kelas: ${pdfCleanText(s.murid.kelas || '-')}  |  Program: ${pdfCleanText(s.murid.program || 'Keduanya')}) Tj`,
    '/F1 12 Tf', '0 -26 Td', `(Ringkasan Kehadiran & Nilai) Tj`,
    '/F2 10 Tf', '0 -16 Td', `(Kehadiran Mengaji: ${s.hadirMengaji} sesi  |  Kehadiran Les: ${s.hadirLes} sesi) Tj`,
    '0 -14 Td', `(Rata-rata Nilai Les: ${s.avgLes !== null ? s.avgLes : '-'}  |  Rata-rata Skor Mengaji: ${s.avgMengaji !== null ? s.avgMengaji : '-'}) Tj`,
    '/F1 12 Tf', '0 -26 Td', `(Riwayat Mengaji) Tj`,
    '/F2 9.5 Tf'
  ];

  if (s.mengajiItems.length === 0) {
    page1Ops.push('0 -15 Td', `(Belum ada catatan mengaji pada periode ini.) Tj`);
  } else {
    s.mengajiItems.slice(0, 14).forEach(x => {
      const rowTxt = `- [${x.date || '-'}] ${x.jilid} (${x.halaman}) - ${x.nilai || ''} (Skor: ${x.skor ?? '-'})`;
      page1Ops.push('0 -14 Td', `(${pdfCleanText(rowTxt.slice(0, 88))}) Tj`);
    });
  }
  page1Ops.push('0 -22 Td', `(Halaman 1 dari 2) Tj', 'ET');

  const page2Ops = [
    'BT',
    '/F1 14 Tf', '48 790 Td', '(Riwayat Nilai & Evaluasi Les / Bimbel) Tj',
    '/F2 10 Tf', '0 -18 Td', `(Murid: ${pdfCleanText(s.murid.name)} (${pdfCleanText(s.murid.code)})  |  Periode: ${pdfCleanText(s.monthStr)}) Tj`,
    '/F2 9.5 Tf', '0 -14 Td'
  ];

  if (s.lesItems.length === 0) {
    page2Ops.push('0 -14 Td', `(Belum ada catatan nilai les pada periode ini.) Tj`);
  } else {
    s.lesItems.slice(0, 18).forEach(x => {
      const rowTxt = `- [${x.date || '-'}] ${x.mapel}: ${x.materi} | Nilai: ${x.nilai}${x.catatan ? ` (${x.catatan})` : ''}`;
      page2Ops.push('0 -15 Td', `(${pdfCleanText(rowTxt.slice(0, 90))}) Tj`);
    });
  }

  page2Ops.push(
    '0 -32 Td', `/F1 10 Tf`, `(Catatan Wali Murid / Guru Pengajar:) Tj`,
    '/F2 9.5 Tf', '0 -16 Td', `(Terima kasih atas dukungan dan pendampingan belajar ananda di rumah.) Tj`,
    '0 -28 Td', `(Halaman 2 dari 2 - Taman Belajar) Tj`,
    'ET'
  );

  const s1 = page1Ops.join('\n');
  const s2 = page2Ops.join('\n');

  const objs = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 8 0 R >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `7 0 obj\n<< /Length ${s1.length} >>\nstream\n${s1}\nendstream\nendobj\n`,
    `8 0 obj\n<< /Length ${s2.length} >>\nstream\n${s2}\nendstream\nendobj\n`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objs.forEach(o => {
    offsets.push(pdf.length);
    pdf += o;
  });

  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function generateAndDownloadPDF() {
  const muridId = document.getElementById('report-murid-select')?.value;
  const murid = getMuridById(muridId);
  if (!murid) return showToast('Pilih murid terlebih dahulu.', 'warn');

  const monthStr = getReportMonthValue();
  const summary = buildStudentMonthlySummary(murid, monthStr);
  const blob = buildTwoPagePdfBlob(summary);
  const fileName = `Laporan_${murid.code}_${monthStr}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  const statusEl = document.getElementById('pdf-status-msg');
  if (statusEl) {
    statusEl.textContent = `File "${fileName}" (2 halaman) berhasil dibuat dan diunduh.`;
    statusEl.classList.remove('hidden');
  }
  showToast('PDF 2 halaman berhasil diunduh.');
}

