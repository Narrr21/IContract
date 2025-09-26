import { Navbar } from "@/components/custom/navbar";
import { Poppins, Noto_Sans } from "next/font/google";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </>
  );
}
