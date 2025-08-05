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

type Activity = {
  id: string;
  type: 'Surat Masuk' | 'Surat Keluar' | 'Disposisi';
  title: string;
  description: string;
  timestamp: string;
};

export default function RecentMail() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      setLoading(true);

      try {
        const suratMasukPromise = supabase
          .from("surat_masuk")
          .select("id, perihal, pengirim, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        const suratKeluarPromise = supabase
          .from("surat_keluar")
          .select("id, perihal, tujuan, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        const disposisiPromise = supabase
          .from("disposisi")
          .select("id, tujuan_jabatan, created_at, surat_masuk(perihal)")
          .order("created_at", { ascending: false })
          .limit(5);

        const [
          { data: suratMasukData, error: smError },
          { data: suratKeluarData, error: skError },
          { data: disposisiData, error: dError },
        ] = await Promise.all([suratMasukPromise, suratKeluarPromise, disposisiPromise]);

        if (smError || skError || dError) {
          console.error("Error fetching recent activities:", smError || skError || dError);
          setLoading(false);
          return;
        }

        const combinedActivities: Activity[] = [];

        suratMasukData?.forEach(item => {
          combinedActivities.push({
            id: `sm-${item.id}`,
            type: 'Surat Masuk',
            title: item.perihal,
            description: `Dari: ${item.pengirim}`,
            timestamp: item.created_at,
          });
        });

        suratKeluarData?.forEach(item => {
          combinedActivities.push({
            id: `sk-${item.id}`,
            type: 'Surat Keluar',
            title: item.perihal,
            description: `Tujuan: ${item.tujuan}`,
            timestamp: item.created_at,
          });
        });

        (disposisiData as any[])?.forEach((item) => {
          if (item.surat_masuk) {
            combinedActivities.push({
              id: `d-${item.id}`,
              type: 'Disposisi',
              title: `Disposisi: ${item.surat_masuk.perihal}`,
              description: `Diteruskan ke: ${item.tujuan_jabatan}`,
              timestamp: item.created_at,
            });
          }
        });

        const sortedActivities = combinedActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setActivities(sortedActivities);

      } catch (error) {
        console.error("Error processing recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  const getBadgeVariant = (type: Activity['type']) => {
    switch (type) {
      case 'Surat Masuk':
        return 'default';
      case 'Surat Keluar':
        return 'destructive';
      case 'Disposisi':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>
          5 aktivitas terakhir dari surat masuk, surat keluar, dan disposisi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aktivitas</TableHead>
              <TableHead className="text-right">Jenis</TableHead>
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
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getBadgeVariant(activity.type)}>{activity.type}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Belum ada aktivitas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}