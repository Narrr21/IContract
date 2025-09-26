"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Skeleton } from "../ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ContractViewerProps {
  file: string;
  activeFindingId: string | null;
  setActiveFindingId: (id: string) => void;
  reviewFindings: any[];
  categoryColors: any;
}

export function ContractViewer({
  file,
  activeFindingId,
  setActiveFindingId,
  reviewFindings,
  categoryColors,
}: ContractViewerProps) {
  console.log(
    `[ContractViewer] dirender dengan activeFindingId: ${activeFindingId}`
  );
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const textRenderer = useCallback(
    (textItem: any) => {
      if (textItem.str.trim().length > 1) {
        console.log(`[PDF Text Chunk]: "${textItem.str}"`);
      }
      const finding = reviewFindings.find((f) => textItem.str.includes(f.text));

      if (finding) {
        console.log(
          `[textRenderer] Menemukan finding untuk teks: ${textItem.str}`
        );
        const color = categoryColors[finding.category];
        const isActive = activeFindingId === finding.id;

        const parts = textItem.str.split(finding.text);

        return (
          // --- GANTI <mark> DENGAN <span> ---
          <span
            id={finding.id}
            onClick={() => setActiveFindingId(finding.id)}
            style={{
              backgroundColor: isActive ? "yellow" : "rgba(255, 165, 0, 0.3)",
              color: isActive ? "black" : "inherit",
              // Tambahkan outline untuk membuatnya lebih terlihat
              outline: "2px solid red",
            }}
            className="cursor-pointer"
          >
            {textItem.str}
          </span>
        );
      }
      return textItem.str;
      // --- INI BAGIAN PALING KRUSIAL ---
      // Pastikan semua variabel dari luar yang dipakai di dalam fungsi ini
      // ada di dalam array di bawah ini.
    },
    [activeFindingId, reviewFindings, categoryColors, setActiveFindingId]
  );

  return (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={<Skeleton className="w-full h-[800px]" />}
      key={`${file}-${activeFindingId}`} // Kunci sekarang unik untuk setiap finding yang aktif
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          width={800}
          className="mb-4 shadow-md"
          customTextRenderer={textRenderer}
        />
      ))}
    </Document>
  );
}
