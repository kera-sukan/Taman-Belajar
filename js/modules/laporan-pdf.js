// ============================================================================
// TAMAN BELAJAR - MODULE: LAPORAN PDF (2 HALAMAN) & WHATSAPP
// ============================================================================

function populateReportSelectors() {
  const select = document.getElementById('report-murid-select');
  if (!select || !window.TBStore.db) return;

  const allowed = getAccessibleMurid();
  const prevVal = select.value;

  let options = !isWali() ? `<option value="ALL">Semua Murid (${allowed.length} Anak)</option>` : '';
  options += allowed.map(m => `<option value="${m.id}">${m.code} - ${m.name}</option>`).join('');
  select.innerHTML = options;

  if (prevVal && Array.from(select.options).some(o => o.value === prevVal)) {
    select.value = prevVal;
  }
}

function getFilteredReportData() {
  const db = window.TBStore.db;
  const selectedId = document.getElementById('report-murid-select')?.value || 'ALL';
  const monthStr = document.getElementById('report-month-input')?.value || window.TBStore.activeDate.slice(0, 7);
  const allowedMurid = getAccessibleMurid();

  const targetMuridList = (selectedId === 'ALL' && !isWali())
    ? allowedMurid
    : allowedMurid.filter(m => m.id === selectedId);

  const targetIds = new Set(targetMuridList.map(m => m.id));
  const datesInMonth = Object.keys(db.attendance || {}).filter(d => d.startsWith(monthStr)).sort();
  const attendanceRows = [];

  datesInMonth.forEach(dateKey => {
    const rec = db.attendance[dateKey] || { mengaji: [], les: [] };
    targetMuridList.forEach(m => {
      const hMengaji = (rec.mengaji || []).includes(m.id);
      const hLes = (rec.les || []).includes(m.id);
      if (hMengaji || hLes) {
        attendanceRows.push({
          date: dateKey,
          code: m.code,
          name: m.name,
          mengaji: hMengaji ? 'Hadir' : '-',
          les: hLes ? 'Hadir' : '-'
        });
      }
    });
  });

  const mengajiRows = db.mengaji
    .filter(x => (x.date || '').startsWith(monthStr) && targetIds.has(x.muridId))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const lesRows = db.les
    .filter(x => (x.date || '').startsWith(monthStr) && targetIds.has(x.muridId))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return { monthStr, targetMuridList, attendanceRows, mengajiRows, lesRows };
}

function renderReportPreview() {
  const container = document.getElementById('report-preview-card');
  if (!container || !window.TBStore.db) return;

  const { monthStr, targetMuridList, attendanceRows, mengajiRows, lesRows } = getFilteredReportData();
  const titleName = targetMuridList.length === 1
    ? `${targetMuridList[0].name} (${targetMuridList[0].code})`
    : `Rekap Seluruh Murid (${targetMuridList.length} Anak)`;

  container.innerHTML = `
    <div class="border-b border-slate-200/70 pb-2.5">
      <p class="text-[10px] font-bold uppercase tracking-wider text-purple-700">Pratinjau Laporan • Periode ${monthStr}</p>
      <p class="text-sm font-extrabold text-slate-800 mt-0.5">${titleName}</p>
    </div>
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="p-2 rounded-xl bg-amber-100/70 border border-amber-200/80">
        <p class="text-sm font-extrabold text-amber-800">${attendanceRows.length}</p>
        <p class="text-[10px] text-slate-600">Log Hadir</p>
      </div>
      <div class="p-2 rounded-xl bg-emerald-100/70 border border-emerald-200/80">
        <p class="text-sm font-extrabold text-emerald-800">${mengajiRows.length}</p>
        <p class="text-[10px] text-slate-600">Nilai Mengaji</p>
      </div>
      <div class="p-2 rounded-xl bg-blue-100/70 border border-blue-200/80">
        <p class="text-sm font-extrabold text-blue-800">${lesRows.length}</p>
        <p class="text-[10px] text-slate-600">Nilai Les</p>
      </div>
    </div>
    <p class="text-[11px] text-slate-600 leading-relaxed">
      PDF A4 (2 Halaman): <b>Hal. 1</b> Kehadiran &amp; <b>Hal. 2</b> Rekap Nilai Mengaji &amp; Les.
    </p>
  `;
}

function triggerDirectBlobDownload(blob, filename) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2500);
  } catch (e) {
    showToast('Gagal memulai unduhan otomatis di peramban ini.', 'error');
  }
}

function generateAndDownloadPDF() {
  const statusEl = document.getElementById('pdf-status-msg');
  const { monthStr, targetMuridList, attendanceRows, mengajiRows, lesRows } = getFilteredReportData();
  const isSingle = targetMuridList.length === 1;
  const singleMurid = isSingle ? targetMuridList[0] : null;
  const fileLabel = isSingle ? `${singleMurid.code}_${singleMurid.name.replace(/\s+/g, '_')}` : 'Semua_Murid';
  const filename = `Laporan_Taman_Belajar_${fileLabel}_${monthStr}.pdf`;

  const muridKeduanya = targetMuridList.filter(m => m.program === 'Keduanya');
  const muridTunggal = targetMuridList.filter(m => m.program !== 'Keduanya');
  const bothCodes = new Set(muridKeduanya.map(m => m.code));
  const detailAttKeduanya = attendanceRows.filter(r => bothCodes.has(r.code));
  const detailAttTunggal = attendanceRows.filter(r => !bothCodes.has(r.code));

  if (window.jspdf && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // HALAMAN 1: KEHADIRAN
    doc.setFillColor(30, 58, 138);
    doc.rect(14, 12, 182, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAMAN BELAJAR', 18, 20);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Belajar • Mengaji • Berkembang', 18, 25.5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('HALAMAN 1 — LAPORAN KEHADIRAN', 192, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${monthStr}`, 192, 25.5, { align: 'right' });

    let currentY = 36;
    doc.setTextColor(15, 23, 42);

    if (isSingle) {
      doc.autoTable({
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 2.2 },
        body: [
          ['Nomor Murid', singleMurid.code, 'Program', singleMurid.program],
          ['Nama Lengkap', singleMurid.name, 'Wali Murid', singleMurid.wali || '-']
        ],
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 32 },
          1: { fontStyle: 'bold', textColor: [29, 78, 216], cellWidth: 59 },
          2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 30 },
          3: { cellWidth: 61 }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;
    }

    if (muridKeduanya.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(67, 56, 202);
      doc.text('A. Kehadiran Program Terpadu (Mengaji & Les)', 14, currentY);
      currentY += 2.5;

      doc.autoTable({
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontSize: 8.5 },
        styles: { fontSize: 8.5, cellPadding: 2.2 },
        head: [['No', 'ID Murid', 'Nama Murid', 'Program', 'Hadir Mengaji', 'Hadir Les']],
        body: muridKeduanya.map((m, idx) => [
          idx + 1, m.code, m.name, m.program,
          `${attendanceRows.filter(r => r.code === m.code && r.mengaji === 'Hadir').length} Sesi`,
          `${attendanceRows.filter(r => r.code === m.code && r.les === 'Hadir').length} Sesi`
        ])
      });
      currentY = doc.lastAutoTable.finalY + 4;

      doc.autoTable({
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [224, 231, 255], textColor: [30, 27, 75], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        head: [['No', 'Tanggal', 'ID Murid', 'Nama Murid', 'Sesi Mengaji', 'Sesi Les']],
        body: detailAttKeduanya.length > 0
          ? detailAttKeduanya.map((r, idx) => [idx + 1, r.date, r.code, r.name, r.mengaji, r.les])
          : [['-', '-', '-', 'Belum ada log kehadiran program terpadu pada periode ini', '-', '-']]
      });
      currentY = doc.lastAutoTable.finalY + 7;
    }

    if (muridTunggal.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110);
      doc.text(`${muridKeduanya.length > 0 ? 'B.' : 'A.'} Kehadiran Program Tunggal (Mengaji Saja / Les Saja)`, 14, currentY);
      currentY += 2.5;

      doc.autoTable({
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 8.5 },
        styles: { fontSize: 8.5, cellPadding: 2.2 },
        head: [['No', 'ID Murid', 'Nama Murid', 'Program', 'Hadir Mengaji', 'Hadir Les']],
        body: muridTunggal.map((m, idx) => [
          idx + 1, m.code, m.name, m.program,
          `${attendanceRows.filter(r => r.code === m.code && r.mengaji === 'Hadir').length} Sesi`,
          `${attendanceRows.filter(r => r.code === m.code && r.les === 'Hadir').length} Sesi`
        ])
      });
      currentY = doc.lastAutoTable.finalY + 4;

      doc.autoTable({
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [204, 251, 241], textColor: [19, 78, 74], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2 },
        head: [['No', 'Tanggal', 'ID Murid', 'Nama Murid', 'Sesi Mengaji', 'Sesi Les']],
        body: detailAttTunggal.length > 0
          ? detailAttTunggal.map((r, idx) => [idx + 1, r.date, r.code, r.name, r.mengaji, r.les])
          : [['-', '-', '-', 'Belum ada log kehadiran program tunggal pada periode ini', '-', '-']]
      });
    }

    // HALAMAN 2: NILAI & EVALUASI
    doc.addPage();
    doc.setFillColor(6, 95, 70);
    doc.rect(14, 12, 182, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAMAN BELAJAR', 18, 20);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Evaluasi Capaian Belajar & Mengaji', 18, 25.5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('HALAMAN 2 — LAPORAN NILAI & EVALUASI', 192, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${monthStr}`, 192, 25.5, { align: 'right' });

    let page2Y = 36;

    if (muridKeduanya.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(67, 56, 202);
      doc.text('Rekap Gabungan Murid Program Terpadu (Mengaji & Les)', 14, page2Y);
      page2Y += 2.5;

      doc.autoTable({
        startY: page2Y,
        theme: 'grid',
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2.2 },
        head: [['No', 'ID Murid', 'Nama Murid', 'Capaian Mengaji Terakhir', 'Rata Mengaji', 'Rata Les']],
        body: muridKeduanya.map((m, idx) => {
          const mMg = mengajiRows.filter(x => x.muridId === m.id);
          const mLs = lesRows.filter(x => x.muridId === m.id);
          const avgMg = mMg.length ? Math.round(mMg.reduce((s, x) => s + (Number(x.skor) || 0), 0) / mMg.length) : '-';
          const avgLs = mLs.length ? Math.round(mLs.reduce((s, x) => s + (Number(x.nilai) || 0), 0) / mLs.length) : '-';
          const lastMg = mMg.length ? `${mMg[mMg.length - 1].jilid} (${mMg[mMg.length - 1].halaman})` : '-';
          return [idx + 1, m.code, m.name, lastMg, avgMg, avgLs];
        })
      });
      page2Y = doc.lastAutoTable.finalY + 7;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 95, 70);
    doc.text('A. Tabel Perkembangan & Nilai Mengaji', 14, page2Y);
    page2Y += 2.5;

    doc.autoTable({
      startY: page2Y,
      theme: 'grid',
      headStyles: { fillColor: [6, 95, 70], textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2.2 },
      head: [['No', 'Tanggal', 'ID Murid', 'Nama Murid', 'Bacaan (Jilid / Hal)', 'Skor', 'Predikat']],
      body: mengajiRows.length > 0
        ? mengajiRows.map((item, idx) => {
            const m = window.TBStore.db.murid.find(x => x.id === item.muridId);
            return [idx + 1, item.date, m ? m.code : '-', m ? m.name : '-', `${item.jilid} (${item.halaman})`, item.skor || '-', item.nilai];
          })
        : [['-', '-', '-', 'Tidak ada catatan nilai mengaji pada periode ini', '-', '-', '-']]
    });
    page2Y = doc.lastAutoTable.finalY + 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('B. Tabel Nilai Les & Bimbingan Belajar', 14, page2Y);
    page2Y += 2.5;

    doc.autoTable({
      startY: page2Y,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2.2 },
      head: [['No', 'Tanggal', 'ID Murid', 'Nama Murid', 'Mata Pelajaran', 'Materi Bahasan', 'Nilai']],
      body: lesRows.length > 0
        ? lesRows.map((item, idx) => {
            const m = window.TBStore.db.murid.find(x => x.id === item.muridId);
            return [idx + 1, item.date, m ? m.code : '-', m ? m.name : '-', item.mapel, item.materi, item.nilai];
          })
        : [['-', '-', '-', 'Tidak ada catatan nilai les pada periode ini', '-', '-', '-']]
    });

    const signY = Math.min(doc.lastAutoTable.finalY + 14, 262);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Mengetahui,', 165, signY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('Pengajar Taman Belajar', 165, signY + 4.5, { align: 'center' });
    doc.line(142, signY + 20, 188, signY + 20);
    doc.text('Admin / Pengajar', 165, signY + 24.5, { align: 'center' });

    const pdfBlob = doc.output('blob');
    triggerDirectBlobDownload(pdfBlob, filename);

    if (statusEl) {
      statusEl.textContent = `File "${filename}" berhasil dibuat dan diunduh!`;
      statusEl.classList.remove('hidden');
    }
    showToast('Laporan PDF 2 halaman berhasil diunduh!', 'success');
    return;
  }

  showToast('Library PDF sedang dimuat, pastikan koneksi internet aktif.', 'warning');
}

function copyWhatsAppReport() {
  const { monthStr, targetMuridList, attendanceRows, mengajiRows, lesRows } = getFilteredReportData();
  let text = `*LAPORAN PERKEMBANGAN TAMAN BELAJAR*\nPeriode: ${monthStr}\n\n`;

  targetMuridList.forEach(m => {
    const mgCount = attendanceRows.filter(r => r.code === m.code && r.mengaji === 'Hadir').length;
    const lsCount = attendanceRows.filter(r => r.code === m.code && r.les === 'Hadir').length;
    const mMg = mengajiRows.filter(x => x.muridId === m.id);
    const mLs = lesRows.filter(x => x.muridId === m.id);

    text += `👤 *${m.name}* (ID: *${m.code}*)\n`;
    text += `• Kehadiran: Mengaji ${mgCount}x | Les ${lsCount}x\n`;
    if (mMg.length > 0) {
      const lastMg = mMg[mMg.length - 1];
      text += `• Mengaji Terakhir: ${lastMg.jilid} (${lastMg.halaman}) - Skor ${lastMg.skor || lastMg.nilai}\n`;
    }
    if (mLs.length > 0) {
      const lastLs = mLs[mLs.length - 1];
      text += `• Les Terakhir: ${lastLs.mapel} (${lastLs.materi}) - Nilai ${lastLs.nilai}\n`;
    }
    text += `\n`;
  });

  const ta = document.createElement('textarea');
  ta.value = text.trim();
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Rekap laporan berhasil disalin untuk WhatsApp!', 'success');
  } catch (e) {
    showToast('Gagal menyalin otomatis.', 'warning');
  }
  document.body.removeChild(ta);
}
