import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fungsi untuk mendapatkan logo sebagai base64
async function getLogoBase64() {
  try {
    const response = await fetch('/logo.svg');
    const svgText = await response.text();
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
  } catch (error) {
    console.error("Gagal memuat logo:", error);
    return null;
  }
}

export const generatePdf = async (data: any[], columns: { header: string, accessor: string }[], title: string, period: string) => {
  const doc = new jsPDF();
  const logoBase64 = await getLogoBase64();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header (Kop Dinas)
  if (logoBase64) {
    doc.addImage(logoBase64, 'SVG', 15, 10, 25, 25);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PEMERINTAH KABUPATEN LOMBOK BARAT', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(18);
  doc.text('BADAN PERENCANAAN PEMBANGUNAN DAERAH', pageWidth / 2, 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('(BAPPEDA)', pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Jalan Soekarno-Hatta, Giri Menang, Gerung, Lombok Barat', pageWidth / 2, 34, { align: 'center' });
  
  // Garis pemisah
  doc.setLineWidth(1);
  doc.line(15, 40, pageWidth - 15, 40);
  doc.setLineWidth(0.2);
  doc.line(15, 41, pageWidth - 15, 41);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, pageWidth / 2, 55, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Periode: ${period}`, pageWidth / 2, 62, { align: 'center' });

  // Tabel
  autoTable(doc, {
    startY: 70,
    head: [columns.map(c => c.header)],
    body: data.map((row, index) => [
        index + 1, 
        ...columns.slice(1).map(col => row[col.accessor] || '')
    ]),
    theme: 'grid',
    headStyles: { fillColor: [3, 105, 161], textColor: 255 },
    didDrawPage: (data) => {
        // Footer
        doc.setFontSize(10);
        doc.text(`Halaman ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  });

  doc.save(`${title} - ${period}.pdf`);
};