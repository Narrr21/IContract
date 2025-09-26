"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ContractViewerOverlay = dynamic(
  () =>
    import("@/components/custom/contract-viewer-overlay").then(
      (mod) => mod.ContractViewerOverlay
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />,
  }
);

// Tipe data untuk setiap temuan
type Finding = {
  id: string;
  page: number;
  text: string;
  comment: string;
  category: "Critical" | "Suggestion" | "Positive";
};

// MODIFIKASI: Struktur data diubah menjadi objek yang dikelompokkan
const groupedFindings: { [key: string]: Finding[] } = {
  "Kesalahan": [
    {
      id: "finding-1",
      page: 5,
      text: "Jika kepada PENGIRIM, maka bentuk pengirimannya adalah :",
      comment:
        "Tanggal efektif tidak jelas. Seharusnya tanggal yang spesifik dan terdefinisi untuk menghindari kebingungan.",
      category: "Critical",
    },
    {
      id: "finding-2",
      page: 2,
      text: "The term of this Agreement will be for a period of 12 months",
      comment:
        "Pertimbangkan untuk menambahkan klausul perpanjangan otomatis dengan periode pemberitahuan 30 hari untuk penghentian.",
      category: "Suggestion",
    },
  ],
  "Hukum": [
    {
      id: "finding-3",
      page: 3,
      text: "confidential information",
      comment:
        'Definisi "informasi rahasia" sudah jelas dan komprehensif. Bagus.',
      category: "Positive",
    },
  ],
};

// Palet warna untuk setiap kategori temuan (tidak berubah)
const categoryColors = {
  Critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-500",
    badge: "bg-red-500",
  },
  Suggestion: {
    bg: "bg-yellow-100 dark:bg-yellow-800/30",
    border: "border-yellow-500",
    badge: "bg-yellow-500",
  },
  Positive: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-500",
    badge: "bg-green-500",
  },
};

export default function ContractReviewerPage() {
  const [activeFindingId, setActiveFindingId] = useState<string | null>(
    "finding-1"
  );
  const [textWithCoords, setTextWithCoords] = useState([]);
  const [isLoadingText, setIsLoadingText] = useState(true);
  const pdfFile = "sample-kontrak.pdf";

  // BARU: Buat array datar dari semua temuan untuk diteruskan ke viewer
  const allFindings = Object.values(groupedFindings).flat();

  useEffect(() => {
    const fetchTextData = async () => {
      setIsLoadingText(true);
      try {
        const response = await fetch("/api/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: pdfFile }),
        });
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        setTextWithCoords(data.textData || []);
      } catch (error) {
        console.error("Failed to fetch text coordinates", error);
        setTextWithCoords([]);
      } finally {
        setIsLoadingText(false);
      }
    };
    fetchTextData();
  }, [pdfFile]);

  useEffect(() => {
    if (activeFindingId) {
      const element = document.getElementById(activeFindingId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeFindingId]);

  return (
    <div className="h-screen w-full flex flex-col p-4 bg-gray-50 dark:bg-gray-950">
      <header className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Contract Reviewer
        </h1>
        <p className="text-muted-foreground">
          Reviewing document: <span className="font-mono">{pdfFile}</span>
        </p>
      </header>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border"
      >
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full items-start justify-center p-2 overflow-y-auto">
            {isLoadingText ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ContractViewerOverlay
                file={pdfFile}
                activeFindingId={activeFindingId}
                reviewFindings={allFindings} // MODIFIKASI: Gunakan array datar
                categoryColors={categoryColors}
                textWithCoords={textWithCoords}
              />
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40}>
          <Card className="h-full rounded-none border-0 border-l">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle />
                Review Findings
              </CardTitle>
            </CardHeader>
            {/* MODIFIKASI: Implementasi Accordion Bertingkat */}
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <Accordion type="multiple" className="w-full space-y-4">
                {Object.entries(groupedFindings).map(
                  ([groupTitle, findings]) => (
                    <AccordionItem
                      key={groupTitle}
                      value={groupTitle}
                      className="rounded-lg border bg-gray-50 dark:bg-gray-900"
                    >
                      <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                        {groupTitle} ({findings.length})
                      </AccordionTrigger>
                      <AccordionContent className="p-2 pt-0">
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full space-y-2"
                          value={activeFindingId || ""}
                          onValueChange={(value) => setActiveFindingId(value)}
                        >
                          {findings.map((finding) => (
                            <AccordionItem
                              key={finding.id}
                              value={finding.id}
                              id={finding.id}
                              className={`rounded-lg border-l-4 ${
                                categoryColors[finding.category].border
                              } bg-white dark:bg-gray-800`}
                            >
                              <AccordionTrigger className="p-4 hover:no-underline">
                                <div className="flex items-center gap-3 text-left">
                                  <Badge
                                    className={`${
                                      categoryColors[finding.category].badge
                                    } text-white`}
                                  >
                                    {finding.category}
                                  </Badge>
                                  <span>
                                    Temuan #{finding.id.split("-")[1]} di Hal.{" "}
                                    {finding.page}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-4 pt-0">
                                <p className="text-muted-foreground italic mb-2">
                                  "{finding.text}"
                                </p>
                                <p>{finding.comment}</p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}