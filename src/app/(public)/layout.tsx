import { Header } from "@/components/custom/header";
import { Footer } from "@/components/custom/footer";
import { Poppins, Noto_Sans } from "next/font/google";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
