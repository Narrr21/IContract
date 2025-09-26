"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-[#F8F8FF] sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center">
          <img src="/Frame.svg" alt="IContract Logo" className="h-6 w-auto" />
        </Link>
        
        {/* Tombol Masuk */}
        <Link href="/login">
          <Button className="bg-[#3D74EA]">Masuk</Button>
        </Link>
      </div>
    </header>
  );
}

