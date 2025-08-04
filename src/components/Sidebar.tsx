import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Send,
  FileCheck2,
  Book,
  Archive,
  FileText,
  Users,
  LogOut,
  Mails,
} from "lucide-react";

const menuItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { to: "/surat-masuk", label: "Surat Masuk", icon: Mail, color: "text-green-500" },
  { to: "/surat-keluar", label: "Surat Keluar", icon: Send, color: "text-red-500" },
  { to: "/disposisi", label: "Disposisi", icon: FileCheck2, color: "text-purple-500" },
  { to: "/klasifikasi-surat", label: "Klasifikasi Surat", icon: Book, color: "text-yellow-500" },
  { to: "/galeri-arsip", label: "Galeri Arsip", icon: Archive, color: "text-indigo-500" },
  { to: "/laporan", label: "Laporan", icon: FileText, color: "text-pink-500" },
  { to: "/data-user", label: "Data User", icon: Users, color: "text-teal-500" },
];

const CustomNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink to={to}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        {children}
      </Button>
    </NavLink>
  );
};

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Mails className="h-6 w-6 text-primary" />
            <span className="">e-SuKa</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {menuItems.map((item) => (
              <CustomNavLink key={item.to} to={item.to}>
                <item.icon className={cn("mr-2 h-4 w-4", item.color)} />
                {item.label}
              </CustomNavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button size="sm" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}