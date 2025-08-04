import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const recentMails = [
    { id: 1, type: 'Masuk', subject: 'Undangan Rapat Koordinasi', from: 'Dinas Pendidikan', date: '14 Jun 2024', status: 'Baru' },
    { id: 2, type: 'Keluar', subject: 'Permohonan Data Statistik', to: 'BPS Lombok Barat', date: '13 Jun 2024', status: 'Terkirim' },
    { id: 3, type: 'Masuk', subject: 'Laporan Bulanan', from: 'Bidang Perekonomian', date: '12 Jun 2024', status: 'Didisposisi' },
    { id: 4, type: 'Keluar', subject: 'Nota Dinas', to: 'Bidang Infrastruktur', date: '11 Jun 2024', status: 'Terkirim' },
    { id: 5, type: 'Masuk', subject: 'Pengantar SK', from: 'BKPSDM', date: '10 Jun 2024', status: 'Diarsip' },
];

export default function RecentMail() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Surat Terbaru</CardTitle>
        <CardDescription>
          5 aktivitas surat terakhir yang tercatat di sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Perihal</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentMails.map((mail) => (
              <TableRow key={mail.id}>
                <TableCell>
                  <div className="font-medium">{mail.subject}</div>
                  <div className="text-sm text-muted-foreground">
                    {mail.type === 'Masuk' ? `Dari: ${mail.from}` : `Untuk: ${mail.to}`}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                    <Badge variant={mail.status === 'Baru' ? 'default' : 'outline'}>{mail.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}