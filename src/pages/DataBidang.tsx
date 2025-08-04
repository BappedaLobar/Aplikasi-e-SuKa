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
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import AddBidangDialog from "@/components/AddBidangDialog";
import EditBidangDialog from "@/components/EditBidangDialog";
import DeleteBidangDialog from "@/components/DeleteBidangDialog";

type Bidang = {
  id: string;
  kode: string;
  nama: string;
};

export default function DataBidang() {
  const [bidangList, setBidangList] = useState<Bidang[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBidang = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bidang")
      .select("*")
      .order("kode", { ascending: true });

    if (error) {
      showError("Gagal memuat data bidang.");
      console.error(error);
    } else {
      setBidangList(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBidang();
  }, [fetchBidang]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Bidang</h1>
          <p className="text-muted-foreground">
            Kelola data bidang di lingkungan Bappeda.
          </p>
        </div>
        <AddBidangDialog onAdded={fetchBidang} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Bidang</CardTitle>
          <CardDescription>
            Berikut adalah daftar bidang yang digunakan untuk penomoran surat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Kode</TableHead>
                <TableHead>Nama Bidang</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : bidangList.length > 0 ? (
                bidangList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.kode}</TableCell>
                    <TableCell>{item.nama}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <EditBidangDialog bidang={item} onUpdated={fetchBidang} />
                          <DeleteBidangDialog bidang={item} onDeleted={fetchBidang} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Belum ada data bidang.
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