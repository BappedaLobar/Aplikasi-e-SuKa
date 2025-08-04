import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
  { name: "Jan", suratMasuk: 40, suratKeluar: 24 },
  { name: "Feb", suratMasuk: 30, suratKeluar: 13 },
  { name: "Mar", suratMasuk: 20, suratKeluar: 98 },
  { name: "Apr", suratMasuk: 27, suratKeluar: 39 },
  { name: "Mei", suratMasuk: 18, suratKeluar: 48 },
  { name: "Jun", suratMasuk: 23, suratKeluar: 38 },
];

export default function MailChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Surat</CardTitle>
        <CardDescription>Aktivitas surat masuk dan keluar 6 bulan terakhir.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
      </CardContent>
    </Card>
  );
}