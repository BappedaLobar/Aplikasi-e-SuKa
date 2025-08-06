import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, HeadingLevel, Header } from 'docx';

// Fungsi untuk mengubah gambar menjadi base64
const toBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

// --- PDF GENERATOR ---
export const generatePdf = async (title: string, period: string, headers: string[], data: any[][]) => {
  const doc = new jsPDF();
  
  try {
    const imgData = await toBase64('/kop-surat.png');
    doc.addImage(imgData, 'PNG', 10, 8, 190, 30);
  } catch (e) {
    console.error("Kop surat tidak ditemukan di public/kop-surat.png. Laporan akan dibuat tanpa kop.", e);
    doc.text("Kop Surat Bappeda Lombok Barat", 105, 20, { align: 'center' });
  }

  doc.setFontSize(14);
  doc.text(title, 105, 50, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Periode: ${period}`, 105, 57, { align: 'center' });

  autoTable(doc, {
    startY: 65,
    head: [headers],
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  doc.save(`Laporan_${title.replace(/ /g, '_')}_${period}.pdf`);
};


// --- WORD (DOCX) GENERATOR ---
export const generateWord = async (title: string, period: string, headers: string[], data: any[][]) => {
  let headerParagraph: Paragraph;
  try {
    const base64Image = await toBase64('/kop-surat.png');
    const pureBase64 = base64Image.split(",")[1];

    headerParagraph = new Paragraph({
      children: [
        new ImageRun({
          data: pureBase64,
          transformation: {
            width: 600,
            height: 90,
          },
        }),
      ],
      alignment: AlignmentType.CENTER,
    });
  } catch (e) {
    console.error("Kop surat tidak ditemukan di public/kop-surat.png. Laporan akan dibuat tanpa kop.", e);
    headerParagraph = new Paragraph({
      children: [new TextRun("Kop Surat Bappeda Lombok Barat")],
      alignment: AlignmentType.CENTER,
    });
  }

  const tableHeader = new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
      width: { size: 4500 / headers.length, type: WidthType.DXA },
    })),
  });

  const dataRows = data.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph(String(cell))],
    })),
  }));

  const table = new Table({
    rows: [tableHeader, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });

  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: [headerParagraph],
        }),
      },
      children: [
        new Paragraph({ text: "" }), // Spacer
        new Paragraph({
          children: [new TextRun(title)],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun(`Periode: ${period}`)],
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }), // Spacer
        table,
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_${title.replace(/ /g, '_')}_${period}.docx`;
    document.body.appendChild(a);
a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  });
};