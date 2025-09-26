"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getRoleDisplayName, hasRouteAccess } from "@/lib/rolePermissions";

// Interface User with role information
interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string; // Avatar bisa jadi opsional
  initials: string;
  category?: "MANAGEMENT" | "ADMIN" | "HR" | "LEGAL";
}

export function Navbar() {
  // --- LOGIKA STATE MANAGEMENT DARI KODE ANDA (DIPERTAHANKAN) ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Hook untuk mendapatkan path URL saat ini

  useEffect(() => {
    setIsMounted(true); // Komponen sudah terpasang di client

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/account");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    // Fungsi logout dari kode Anda
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  // Role-based navigation configuration
  // MANAGEMENT: Can view dashboard, review, employment contracts, and drafts
  // ADMIN: Full access to all features
  // HR: Can create contracts, manage employment contracts, and drafts
  // LEGAL: Can create contracts, review contracts, and manage drafts
  const getNavLinksForRole = (category?: string) => {
    const allNavLinks = {
      dashboard: { href: "/dashboard", label: "Beranda" },
      create: { href: "/create", label: "Buat Kontrak" },
      employment: { href: "/employment", label: "Kontrak Kerja" },
      draft: { href: "/draft", label: "Draft" },
      profile: { href: "/profile", label: "Profil" },
      register: { href: "/register", label: "Buat Akun" },
    };

    // Define role-based navigation access
    switch (category) {
      case "MANAGEMENT":
        return [
          allNavLinks.dashboard,
        ];
      case "ADMIN":
        return [allNavLinks.dashboard, allNavLinks.register];
      case "HR":
        return [allNavLinks.dashboard, allNavLinks.create];
      case "LEGAL":
        return [
          allNavLinks.dashboard,
        ];
      default:
        // Default navigation for users without specific roles
        return [allNavLinks.dashboard];
    }
  };

  const navLinks = getNavLinksForRole(user?.category);

  const homeLink = user ? "/dashboard" : "/";

  // --- RENDER UI YANG SESUAI DESAIN (DIADOPSI DARI JAWABAN SEBELUMNYA) ---

  // Placeholder yang lebih baik untuk mencegah layout shift saat !isMounted
  if (!isMounted) {
    return (
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </header>
    );
  }

  // UI utama setelah komponen terpasang di client
  // UI utama setelah komponen terpasang di client
  return (
    <header className="px-4 lg:px-6 h-16 w-sc flex items-center border-b bg-[#F8F8FF] dark:bg-gray-950 sticky top-0 z-50">
      <div className="container mx-auto w-screen flex items-center justify-between">
        {/* BAGIAN KIRI: Menggabungkan Logo dan Navigasi */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center">
            <img src="/Frame.svg" alt="IContract Logo" className="h-6 w-auto" />
          </Link>
        </div>

        {/* BAGIAN KANAN: Hanya berisi Tombol Masuk atau Profil Pengguna */}
        <div className="ml-auto flex gap-6">
          {/* Navigasi untuk pengguna yang sudah login */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === link.href
                      ? "text-blue-600" // Gaya untuk link aktif
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          {isLoading ? (
            <div className="h-9 w-24 bg-[#3D74EA] rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-blue-600 bg-transparent hover:bg-blue-50 text-blue-600"
                >
                  Profil
                  {isDropdownOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-0 w-fit bg-transparent border-gray-200"
                style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
              >
                <DropdownMenuLabel className="text-sm font-medium text-gray-600 bg-[#F8F8FF]">
                  {user.firstName} {user.lastName}
                </DropdownMenuLabel>
                {user.category && (
                  <DropdownMenuLabel className="text-xs text-blue-600 bg-[#F8F8FF] pt-0">
                    {getRoleDisplayName(user.category)}
                  </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="text-black bg-[#F8F8FF] hover:bg-gray-100 cursor-pointer focus:bg-gray-100 flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 bg-[#F8F8FF] hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:text-red-500 flex items-center gap-2"
                >
                  <LogOutIcon className="h-4 w-4 text-red-500" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="bg-[#3D74EA]">Masuk</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
