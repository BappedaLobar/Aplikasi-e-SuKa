import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type RecentMail = {
  id: string;
  perihal: string;
  pengirim: string;
};

export default function RecentMail() {
  const [mails, setMails] = useState<RecentMail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentMails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("surat_masuk")
        .select("id, perihal, pengirim")
        .order("tanggal_diterima", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent mails:", error);
      } else {
        setMails(data || []);
      }
      setLoading(false);
    };

    fetchRecentMails();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Surat Terbaru</CardTitle>
        <CardDescription>
          5 surat masuk terakhir yang tercatat di sistem.
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
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-1 h-3 w-1/2" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                </TableRow>
              ))
            ) : mails.length > 0 ? (
              mails.map((mail) => (
                <TableRow key={mail.id}>
                  <TableCell>
                    <div className="font-medium">{mail.perihal}</div>
                    <div className="text-sm text-muted-foreground">
                      Dari: {mail.pengirim}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">Baru</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Belum ada surat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}