import { Mail, Send, FileCheck2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import MailChart from "@/components/MailChart";
import RecentMail from "@/components/RecentMail";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Surat Masuk"
          value="142"
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