    import { Header } from "@/components/custom/header";
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
        </>
      );
    }
    

