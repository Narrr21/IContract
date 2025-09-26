"use client";

import { useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Skeleton } from "../ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ViewerProps {
  file: string;
  activeFindingId: string | null;
  reviewFindings: any[];
  categoryColors: any;
  textWithCoords: any[];
}

export function ContractViewerOverlay({
  file,
  activeFindingId,
  reviewFindings,
  categoryColors,
  textWithCoords,
}: ViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageDimensions, setPageDimensions] = useState<
    { width: number; height: number }[]
  >([]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  async function onPageLoadSuccess(page: any) {
    setPageDimensions((prev) => {
      const newDims = [...prev];
      newDims[page.pageNumber - 1] = { width: page.width, height: page.height };
      return newDims;
    });
  }

  // Memoize perhitungan posisi sorotan agar tidak dihitung ulang setiap render
  const highlights = useMemo(() => {
    return reviewFindings
      .map((finding) => {
        const relevantChunks = textWithCoords.filter(
          (chunk: any) =>
            chunk.page === finding.page &&
            finding.text.includes(chunk.text.trim()) &&
            chunk.text.trim().length > 0
        );

        if (relevantChunks.length === 0) return null;

        const yPositions = relevantChunks.map((c: any) => c.y);
        const top = Math.min(...yPositions);
        const bottom = Math.max(...yPositions) + relevantChunks[0].height;

        return {
          ...finding,
          positions: relevantChunks.map((chunk: any, index: number) => {
            // Mengkalkulasi posisi absolut untuk setiap highlight div
            const pageTopOffset = pageDimensions
              .slice(0, chunk.page - 1)
              .reduce((acc, dim) => acc + (dim?.height || 0) + 16, 0); // 16px = margin-bottom (mb-4)

            return {
              left: `${
                (chunk.x / pageDimensions[chunk.page - 1]?.width) * 100
              }%`,
              top: `${
                pageTopOffset +
                pageDimensions[chunk.page - 1]?.height -
                chunk.y -
                chunk.height
              }px`,
              width: `${
                (chunk.width / pageDimensions[chunk.page - 1]?.width) * 100
              }%`,
              height: `${chunk.height}px`,
            };
          }),
        };
      })
      .filter(Boolean);
  }, [reviewFindings, textWithCoords, pageDimensions]);

  return (
    <div style={{ position: "relative" }}>
      {/* Layer Overlay untuk Sorotan */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          width: "100%",
          height: "100%",
        }}
      >
        {highlights.map((finding: any) => {
          const isActive = activeFindingId === finding.id;
          const color = categoryColors[finding.category];

          return finding.positions.map((pos: any, index: number) => (
            <div
              key={`${finding.id}-${index}`}
              id={index === 0 ? finding.id : undefined} // Hanya beri ID pada elemen pertama agar scroll bekerja
              style={{
                ...pos,
                position: "absolute",
                // After
                backgroundColor:
                  color?.bg?.replace("bg-", "") ?? "rgba(255, 255, 0, 0.4)", // Default to semi-transparent yellow
                opacity: 0.4,
                border: isActive ? "2px solid blue" : "none",
                borderRadius: "2px",
              }}
            />
          ));
        })}
      </div>

      {/* Layer PDF */}
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Skeleton className="w-[800px] h-[1131px]" />}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={800}
            className="mb-4 shadow-md"
            onLoadSuccess={onPageLoadSuccess}
            renderTextLayer={false} // Matikan text layer bawaan agar tidak tumpang tindih
          />
        ))}
      </Document>
    </div>
  );
}
