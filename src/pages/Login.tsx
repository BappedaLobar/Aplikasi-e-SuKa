import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Mails } from "lucide-react";

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
            <Mails className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold mt-2">e-SuKa Login</h1>
            <p className="text-muted-foreground">Masukan email dan password untuk melanjutkan</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
}