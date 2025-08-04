import { Outlet, NavLink } from "react-router-dom";
import {
  Menu,
  Mails,
  LayoutDashboard,
  Mail,
  Send,
  FileCheck2,
  Book,
  Archive,
  FileText,
  Users,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

const menuItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/surat-masuk", label: "Surat Masuk", icon: Mail },
  { to: "/surat-keluar", label: "Surat Keluar", icon: Send },
  { to: "/disposisi", label: "Disposisi", icon: FileCheck2 },
  { to: "/klasifikasi-surat", label: "Klasifikasi Surat", icon: Book },
  { to: "/galeri-arsip", label: "Galeri Arsip", icon: Archive },
  { to: "/laporan", label: "Laporan", icon: FileText },
  { to: "/data-user", label: "Data User", icon: Users },
];

export function Layout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <NavLink
                  to="/"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Mails className="h-6 w-6 text-primary" />
                  <span className="sr-only">e-SuKa</span>
                </NavLink>
                {menuItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto">
                <Button size="sm" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">e-SuKa</h1>
            <p className="text-xs text-muted-foreground">Cepat Suratnya, Aman Arsipnya</p>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}