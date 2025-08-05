import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function Laporan() {
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
        <CardContent>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Fitur Dalam Perbaikan</AlertTitle>
            <AlertDescription>
              Fitur pembuatan laporan PDF sedang dalam perbaikan dan tidak tersedia untuk saat ini. Mohon maaf atas ketidaknyamanannya.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}