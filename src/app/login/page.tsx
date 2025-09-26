// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

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
      <div className="min-h-screen flex">
          {/* Left Side - Blue Geometric Background */}
          <div className="flex-1 relative bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
            {/* Background Image - Add your geometric image here */}
            <div className="w-full h-full relative overflow-hidden">
              {/* Background overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/90 via-blue-500/90 to-blue-600/90" />
              
              <Image 
                src="/images/register-bg.jpg" 
                alt="Geometric Background"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
  
          {/* Right Side - Form */}
          <div className="flex-1 flex flex-col justify-center px-12 py-8 bg-white">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Masuk</h1>
                <p className="text-gray-600">
                  Kelola, awasi, dan amankan semua kontrak<br />
                  Anda di satu platform.
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
          </div>
      </div>
    );
}
