// review/page.tsx

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

type Finding = {
  id: string;
  page: number;
  text: string;
  comment: string;
  category: "Critical" | "Suggestion" | "Positive";
};

const reviewFindings: Finding[] = [
  {
    id: "finding-1",
    page: 5,
    text: "Jika kepada PENGIRIM, maka bentuk pengirimannya adalah :",
    comment:
      "The effective date is ambiguous. It should be a specific, defined date to avoid confusion.",
    category: "Critical",
  },
  {
    id: "finding-2",
    page: 2,
    text: "The term of this Agreement will be for a period of 12 months",
    comment:
      "Consider adding an auto-renewal clause with a 30-day notice period for termination.",
    category: "Suggestion",
  },
  {
    id: "finding-3",
    page: 3,
    text: "confidential information",
    comment:
      'The definition of "confidential information" is well-defined and comprehensive. Good.',
    category: "Positive",
  },
];

// In review/page.tsx (CORRECTED)
const categoryColors = {
  Critical: {
    bg: "bg-red-100 dark:bg-red-900/30", // Added this
    border: "border-red-500",
    badge: "bg-red-500",
  },
  Suggestion: {
    bg: "bg-yellow-100 dark:bg-yellow-800/30", // Added this
    border: "border-yellow-500",
    badge: "bg-yellow-500",
  },
  Positive: {
    bg: "bg-green-100 dark:bg-green-900/30", // Added this
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
        setTextWithCoords([]); // Set to empty array on error
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
                reviewFindings={reviewFindings}
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
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeFindingId || ""}
                // FIX: State is now controlled here, not in the trigger's onClick
                onValueChange={(value) => setActiveFindingId(value)}
              >
                {reviewFindings.map((finding) => (
                  <AccordionItem
                    key={finding.id}
                    value={finding.id}
                    className={`mb-2 rounded-lg border-l-4 ${
                      categoryColors[finding.category].border
                    } bg-white dark:bg-gray-900`}
                  >
                    {/* FIX: onClick handler is removed from here */}
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${
                            categoryColors[finding.category].badge
                          } text-white`}
                        >
                          {finding.category}
                        </Badge>
                        <span>
                          Finding #{finding.id.split("-")[1]} on Page{" "}
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
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
