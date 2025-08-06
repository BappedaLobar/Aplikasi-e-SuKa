import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { generatePdf, generateWord } from '@/utils/reportGenerator';
import { FileText, FileType } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const months = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
  { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const startYear = 2020;
const endYear = 2030;
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i)).reverse();

export default function Laporan() {
  const [reportType, setReportType] = useState<'surat_masuk' | 'surat_keluar'>('surat_masuk');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (format: 'pdf' | 'word') => {
    setLoading(true);
    const toastId = showLoading('Mempersiapkan laporan...');

    const startDate = `${year}-${month}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    const period = `${months.find(m => m.value === month)?.label} ${year}`;

    const { data, error } = await supabase
      .from(reportType)
      .select('*')
      .gte('tanggal_surat', startDate)
      .lte('tanggal_surat', endDate)
      .order('tanggal_surat', { ascending: true });

    if (error || !data || data.length === 0) {
      dismissToast(toastId);
      showError(error ? `Gagal mengambil data: ${error.message}` : 'Tidak ada data untuk periode yang dipilih.');
      setLoading(false);
      return;
    }

    let headers: string[] = [];
    let tableData: any[][] = [];
    let title = '';

    if (reportType === 'surat_masuk') {
      title = 'Laporan Surat Masuk';
      headers = ['No', 'Nomor Surat', 'Tanggal Surat', 'Pengirim', 'Perihal'];
      tableData = data.map((item, index) => [
        index + 1,
        item.nomor_surat,
        new Date(item.tanggal_surat).toLocaleDateString('id-ID'),
        item.pengirim,
        item.perihal,
      ]);
    } else {
      title = 'Laporan Surat Keluar';
      headers = ['No', 'Nomor Surat', 'Tanggal Surat', 'Tujuan', 'Perihal', 'Pengirim'];
      tableData = data.map((item, index) => [
        index + 1,
        item.nomor_surat,
        new Date(item.tanggal_surat).toLocaleDateString('id-ID'),
        item.tujuan,
        item.perihal,
        item.penandatangan || '-',
      ]);
    }

    try {
      if (format === 'pdf') {
        await generatePdf(title, period, headers, tableData);
      } else {
        await generateWord(title, period, headers, tableData);
      }
      showSuccess('Laporan berhasil dibuat!');
    } catch (e) {
      console.error(e);
      showError('Gagal membuat file laporan.');
    } finally {
      dismissToast(toastId);
      setLoading(false);
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
            <RadioGroup
              defaultValue="surat_masuk"
              className="flex gap-4"
              onValueChange={(value: 'surat_masuk' | 'surat_keluar') => setReportType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="surat_masuk" id="r1" />
                <Label htmlFor="r1">Surat Masuk</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="surat_keluar" id="r2" />
                <Label htmlFor="r2">Surat Keluar</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Bulan</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Tahun</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => handleGenerate('pdf')} disabled={loading} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              {loading ? 'Memproses...' : 'Cetak PDF'}
            </Button>
            <Button onClick={() => handleGenerate('word')} disabled={loading} className="w-full">
              <FileType className="mr-2 h-4 w-4" />
              {loading ? 'Memproses...' : 'Cetak Word'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}