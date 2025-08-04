import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type ChartData = {
  name: string;
  suratMasuk: number;
  suratKeluar: number;
};

export default function MailChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);

      const startDate = '2025-08-01';
      const endDate = '2025-12-31';

      const { data: suratMasukData, error: suratMasukError } = await supabase
        .from('surat_masuk')
        .select('tanggal_surat')
        .gte('tanggal_surat', startDate)
        .lte('tanggal_surat', endDate);

      const { data: suratKeluarData, error: suratKeluarError } = await supabase
        .from('surat_keluar')
        .select('tanggal_surat')
        .gte('tanggal_surat', startDate)
        .lte('tanggal_surat', endDate);

      if (suratMasukError || suratKeluarError) {
        console.error("Error fetching chart data:", suratMasukError || suratKeluarError);
        setLoading(false);
        return;
      }

      const months = [
        { name: "Agu", suratMasuk: 0, suratKeluar: 0, monthIndex: 7 },
        { name: "Sep", suratMasuk: 0, suratKeluar: 0, monthIndex: 8 },
        { name: "Okt", suratMasuk: 0, suratKeluar: 0, monthIndex: 9 },
        { name: "Nov", suratMasuk: 0, suratKeluar: 0, monthIndex: 10 },
        { name: "Des", suratMasuk: 0, suratKeluar: 0, monthIndex: 11 },
      ];

      suratMasukData?.forEach(surat => {
        const month = new Date(surat.tanggal_surat).getMonth();
        const monthData = months.find(m => m.monthIndex === month);
        if (monthData) {
          monthData.suratMasuk += 1;
        }
      });

      suratKeluarData?.forEach(surat => {
        const month = new Date(surat.tanggal_surat).getMonth();
        const monthData = months.find(m => m.monthIndex === month);
        if (monthData) {
          monthData.suratKeluar += 1;
        }
      });

      setChartData(months);
      setLoading(false);
    };

    fetchChartData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Surat</CardTitle>
        <CardDescription>Aktivitas surat masuk dan keluar (Agustus - Desember 2025).</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
             <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
              <Legend iconSize={10} />
              <Bar dataKey="suratMasuk" name="Surat Masuk" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="suratKeluar" name="Surat Keluar" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}