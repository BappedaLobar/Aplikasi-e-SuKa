import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SuratMasuk from "./pages/SuratMasuk";
import SuratKeluar from "./pages/SuratKeluar";
import Disposisi from "./pages/Disposisi";
import KlasifikasiSurat from "./pages/KlasifikasiSurat";
import GalleriArsip from "./pages/GalleriArsip";
import Laporan from "./pages/Laporan";
import DataUser from "./pages/DataUser";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/surat-masuk" element={<SuratMasuk />} />
            <Route path="/surat-keluar" element={<SuratKeluar />} />
            <Route path="/disposisi" element={<Disposisi />} />
            <Route path="/klasifikasi-surat" element={<KlasifikasiSurat />} />
            <Route path="/galeri-arsip" element={<GalleriArsip />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/data-user" element={<DataUser />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;