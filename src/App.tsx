import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { showSuccess } from "./utils/toast";

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

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcomeToastShown, setWelcomeToastShown] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && !welcomeToastShown) {
      const user = session.user;
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;
      showSuccess(`Selamat Datang, ${userName}!`);
      setWelcomeToastShown(true);
    } else if (!session) {
      setWelcomeToastShown(false);
    }
  }, [session, welcomeToastShown]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
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
};

export default App;