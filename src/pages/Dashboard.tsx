import { Mail, Send, FileCheck2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import MailChart from "@/components/MailChart";
import RecentMail from "@/components/RecentMail";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [suratMasukCount, setSuratMasukCount] = useState("0");
  const [suratKeluarCount, setSuratKeluarCount] = useState("0");
  const [disposisiCount, setDisposisiCount] = useState("0");

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: smCount, error: smError } = await supabase
        .from("surat_masuk")
        .select("*", { count: "exact", head: true });

      if (smError) {
        console.error("Error fetching surat masuk count:", smError);
      } else {
        setSuratMasukCount(String(smCount || 0));
      }

      const { count: skCount, error: skError } = await supabase
        .from("surat_keluar")
        .select("*", { count: "exact", head: true });

      if (skError) {
        console.error("Error fetching surat keluar count:", skError);
      } else {
        setSuratKeluarCount(String(skCount || 0));
      }

      const { count: dCount, error: dError } = await supabase
        .from("disposisi")
        .select("*", { count: "exact", head: true });
      
      if (dError) {
        console.error("Error fetching disposisi count:", dError);
      } else {
        setDisposisiCount(String(dCount || 0));
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Surat Masuk"
          value={suratMasukCount}
          icon={Mail}
          description="Total surat diterima"
        />
        <StatCard
          title="Surat Keluar"
          value={suratKeluarCount}
          icon={Send}
          description="Total surat dikirim"
        />
        <StatCard
          title="Disposisi"
          value={disposisiCount}
          icon={FileCheck2}
          description="Total disposisi dibuat"
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