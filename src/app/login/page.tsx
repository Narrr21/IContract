// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Logika fetch API Anda tetap sama
      const response = await fetch('/api/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      if (data.success) {
        console.log("Login successful!", data.user);
        router.push("/");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">

      {/* 2. Bagian Konten Utama */}
      <main className="flex-grow container mx-auto grid md:grid-cols-2 gap-16 items-center p-8">
        
        {/* Kolom Kiri: Gambar Ilustrasi */}
        <div className="hidden md:block">
           {/* Ganti src dengan path gambar ilustrasi Anda di folder /public */}
          <img 
            src="/images/register-bg.jpg" 
            alt="Contract Illustration" 
            className="object-cover"
          />
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Masuk</h1>
            <p className="text-gray-500">
              Kelola, awasi, dan amankan semua kontrak Anda di satu platform.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
