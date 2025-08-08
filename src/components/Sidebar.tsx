import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { to: "/data-bidang", label: "Data Bidang", icon: Briefcase, color: "text-cyan-500" },
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4 lg:h-[68px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-3 font-semibold">
            <img src="/logo-lombok-barat.png" alt="Logo e-SuKa" className="h-8 w-auto" />
            <div>
              <span className="text-lg">e-SuKa</span>
              <p className="text-xs font-normal text-muted-foreground">Bappeda Kabupaten Lombok Barat</p>
            </div>
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
        <div className="mt-auto p-4 border-t">
          <Button size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <div className="mt-4 text-left text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">e-SuKa v1.0</p>
            <p>Bappeda Kabupaten Lombok Barat</p>
            <p>&copy; EwinWidiyan</p>
          </div>
        </div>
      </div>
    </div>
  );
}