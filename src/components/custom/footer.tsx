import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <div className="bg-[#E4EDFF] border-t border-gray-200 px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          {/* Logo IContract */}
          <Image 
            src="/Frame.svg"
            alt="IContract Logo"
            width={150}
            height={40}
            className="rounded"
          />
        </div>
        <p className="text-sm text-gray-600 mb-4 max-w-2xl font-[var(--font-noto-sans)]">
          IContract membantu perusahaan mengelola kontrak secara efisien, akurat, dan terintegrasi dengan 
          dukungan AI – memastikan transparansi dan pengurusan kepastian yang lebih cerdas.
        </p>
        <div className="flex gap-4 mb-4">
          {/* Social Media Icons */}
          <a href="#" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.391-2.18 4.61-1.284 1.219-2.857 1.861-4.728 1.928v-2.378h1.804c.169 0 .315-.13.332-.297l.223-2.175c.018-.177-.114-.329-.294-.329h-2.065V8.997c0-.453.185-.665.555-.665h1.357c.169 0 .306-.137.306-.306V6.292c0-.169-.137-.306-.306-.306h-1.947c-1.524 0-2.512.987-2.512 2.511v1.622H7.56c-.18 0-.325.145-.325.325v2.175c0 .18.145.325.325.325h1.572v6.26c-4.481-.367-7.977-4.154-7.977-8.782 0-4.836 3.896-8.732 8.732-8.732s8.732 3.896 8.732 8.732c0 .746-.093 1.467-.265 2.16z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>© 2025 IContract Semua hak dilindungi</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-700">Privasi dan Kebijakan</Link>
            <Link href="#" className="hover:text-gray-700">Syarat dan Ketentuan</Link>
          </div>
        </div>
      </div>
    </div>
  );
}