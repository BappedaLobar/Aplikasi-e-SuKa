import { Mail, Send, FileCheck2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import MailChart from "@/components/MailChart";
import RecentMail from "@/components/RecentMail";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [suratMasukCount, setSuratMasukCount] = useState("0");

  useEffect(() => {
    const fetchSuratMasukCount = async () => {
      const { count, error } = await supabase
        .from("surat_masuk")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching surat masuk count:", error);
      } else {
        setSuratMasukCount(String(count || 0));
      }
    };

    fetchSuratMasukCount();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Surat Masuk"
          value={suratMasukCount}
          icon={Mail}
          description="Total surat diterima bulan ini"
        />
        <StatCard
          title="Surat Keluar"
          value="78"
          icon={Send}
          description="Total surat dikirim bulan ini"
        />
        <StatCard
          title="Disposisi"
          value="56"
          icon={FileCheck2}
          description="Total disposisi dibuat bulan ini"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <MailChart />
        </div>
        <div className="lg:col-span-3">
          <RecentMail />
        </div>
      </div>
    </div>
  );
}