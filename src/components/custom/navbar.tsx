import Link from "next/link";
import { MountainIcon } from "lucide-react";

export function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center">
        <MountainIcon className="h-6 w-6 text-orange-500" />
        <span className="ml-2 text-lg font-bold">CMX</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
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
        <Link
          href="/login"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
