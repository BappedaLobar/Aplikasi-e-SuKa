import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Sign Up
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) {
        showError(error.message);
      } else {
        showSuccess("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
      }
    } else {
      // Sign In
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        showError("Email atau password salah.");
      }
      // Successful login will be handled by the onAuthStateChange listener in App.tsx
    }
    setLoading(false);
  };

  return (
    <Card>
      <form onSubmit={handleAuth}>
        <CardContent className="space-y-4 pt-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nama Anda"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@contoh.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : isSignUp ? "Daftar" : "Masuk"}
          </Button>
          <Button
            type="button"
            variant="link"
            className="text-sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Sudah punya akun? Masuk"
              : "Belum punya akun? Daftar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}