"use client";

import Link from "next/link";
import { MountainIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react"; // 'useEffect' diperlukan
import { Button } from "../ui/button"; // Path disesuaikan jika perlu
import { useRouter } from "next/navigation";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  initials: string;
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // 1. Tambahkan state 'isMounted'
  const router = useRouter();

  // Efek ini hanya akan berjalan di sisi klien setelah komponen terpasang
  useEffect(() => {
    setIsMounted(true); // 2. Set 'isMounted' menjadi true

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
          // placeholder
          setUser({
            firstName: "John",
            lastName: "Doe",
            email: "tes",
            avatarUrl: "https://i.pravatar.cc/150?img=3",
            initials: "JD",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []); // Dependensi kosong agar hanya berjalan sekali

  const handleLogout = async () => {
    await fetch("/api/logout");
    setUser(null);
    router.push("/login");
  };

  // 3. Tampilkan placeholder jika komponen belum terpasang di klien
  // Ini memastikan render server dan render awal klien identik
  if (!isMounted) {
    return (
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <MountainIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-lg font-bold">CMX</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          {/* Tampilkan placeholder yang konsisten */}
          <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse" />
        </nav>
      </header>
    );
  }

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center">
        <MountainIcon className="h-6 w-6 text-orange-500" />
        <span className="ml-2 text-lg font-bold">CMX</span>
      </Link>

      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link
          href="/"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Dashboard
        </Link>
        <Link
          href="/draft"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Create Contract
        </Link>

        {isLoading ? (
          <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse" />
        ) : user ? (
          <>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </>
        ) : (
          <>
            <Link
              href="/register"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
