import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import ForwardDisposisiDialog from "@/components/ForwardDisposisiDialog";

type Disposisi = {
  id: string;
  tujuan_jabatan: string;
  status: string;
  catatan: string | null;
  riwayat: any[];
  surat_masuk: {
    nomor_surat: string;
    perihal: string;
    pengirim: string;
  };
};

export default function Disposisi() {
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisposisi = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("disposisi")
      .select("*, surat_masuk(*)")
      .order("created_at", { ascending: false });

    if (error) {
      showError("Gagal memuat data disposisi.");
      console.error(error);
    } else {
      setDisposisiList(data as Disposisi[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDisposisi();
  }, [fetchDisposisi]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Disposisi Surat</h1>
        <p className="text-muted-foreground">
          Kelola dan teruskan surat masuk yang memerlukan disposisi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Disposisi</CardTitle>
          <CardDescription>
            Berikut adalah daftar surat yang sedang dalam proses disposisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>Tujuan Saat Ini</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : disposisiList.length > 0 ? (
                disposisiList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.surat_masuk.nomor_surat}</TableCell>
                    <TableCell>{item.surat_masuk.perihal}</TableCell>
                    <TableCell>{item.tujuan_jabatan}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Baru' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ForwardDisposisiDialog disposisi={item} onDisposisiForwarded={fetchDisposisi} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada surat yang perlu didisposisi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}