import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { generatePdf, generateExcel } from '@/utils/reportGenerator';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileDown, FileText } from 'lucide-react';

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: format(new Date(0, i), 'LLLL', { locale: id }),
}));

const columnsSuratMasuk = [
  { header: 'No.', accessor: 'no' },
  { header: 'Tgl. Diterima', accessor: 'tanggal_diterima' },
  { header: 'Nomor Surat', accessor: 'nomor_surat' },
  { header: 'Tgl. Surat', accessor: 'tanggal_surat' },
  { header: 'Pengirim', accessor: 'pengirim' },
  { header: 'Perihal', accessor: 'perihal' },
];

const columnsSuratKeluar = [
  { header: 'No.', accessor: 'no' },
  { header: 'Tgl. Surat', accessor: 'tanggal_surat' },
  { header: 'Nomor Surat', accessor: 'nomor_surat' },
  { header: 'Tujuan', accessor: 'tujuan' },
  { header: 'Perihal', accessor: 'perihal' },
];

export default function Laporan() {
  const [reportType, setReportType] = useState<'surat_masuk' | 'surat_keluar'>('surat_masuk');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    setLoading(true);
    const toastId = showLoading('Mempersiapkan laporan...');

    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const { data, error } = await supabase
        .from(reportType)
        .select('*')
        .gte('tanggal_surat', format(startDate, 'yyyy-MM-dd'))
        .lte('tanggal_surat', format(endDate, 'yyyy-MM-dd'))
        .order('tanggal_surat', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        showError('Tidak ada data untuk periode yang dipilih.');
        return;
      }

      const columns = reportType === 'surat_masuk' ? columnsSuratMasuk : columnsSuratKeluar;
      const title = `Laporan ${reportType === 'surat_masuk' ? 'Surat Masuk' : 'Surat Keluar'}`;
      const period = `${months.find(m => m.value === month)?.label} ${year}`;
      
      const formattedData = data.map(item => ({
        ...item,
        tanggal_diterima: item.tanggal_diterima ? format(new Date(item.tanggal_diterima), 'dd-MM-yyyy') : '',
        tanggal_surat: item.tanggal_surat ? format(new Date(item.tanggal_surat), 'dd-MM-yyyy') : '',
      }));

      if (format === 'pdf') {
        await generatePdf(formattedData, columns, title, period);
      } else {
        generateExcel(formattedData, columns, title, period);
      }

      showSuccess('Laporan berhasil dibuat!');
    } catch (err: any) {
      showError(`Gagal membuat laporan: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
      dismissToast(toastId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground">
          Cetak laporan surat masuk dan surat keluar per periode.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Laporan</CardTitle>
          <CardDescription>
            Pilih jenis laporan dan periode yang diinginkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Jenis Laporan</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="surat_masuk">Laporan Surat Masuk</SelectItem>
                <SelectItem value="surat_keluar">Laporan Surat Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">Bulan</Label>
              <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Tahun</Label>
              <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button onClick={() => handleGenerateReport('pdf')} disabled={loading} className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Cetak PDF
            </Button>
            <Button onClick={() => handleGenerateReport('excel')} disabled={loading} className="w-full sm:w-auto" variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Unduh Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}