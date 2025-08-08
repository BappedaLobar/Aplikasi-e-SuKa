import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            navigate("/");
        }
    };
    checkSession();


    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm p-4">
        <div className="text-center mb-6">
            <img src="/logo-lombok-barat.png" alt="Logo e-SuKa" className="mx-auto h-20 w-auto" />
            <h1 className="text-3xl font-bold mt-4">e-SuKa</h1>
            <p className="text-muted-foreground mt-1">Elektronik Surat dan Kearsipan Administrasi</p>
        </div>
        <AuthForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Bappeda Kabupaten Lombok Barat
        </p>
      </div>
    </div>
  );
}