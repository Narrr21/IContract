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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  FileText,
  Bot,
  Upload,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReviewAccess } from "@/components/auth/ProtectedRoute";

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

// AI Analysis interface
interface AIAnalysis {
  success: boolean;
  analysis: string;
  analysisType: string;
  contractType: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  timestamp: string;
}

// Palet warna untuk setiap kategori temuan
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

function ContractReviewerPageContent() {
  // Existing state
  const [activeFindingId, setActiveFindingId] = useState<string | null>(
    "finding-1"
  );
  const [textWithCoords, setTextWithCoords] = useState([]);
  const [isLoadingText, setIsLoadingText] = useState(true);
  const pdfFile = "sample-kontrak.pdf";

  // NEW: AI Analysis state
  const [contractContent, setContractContent] = useState("");
  const [contractType, setContractType] = useState("partnership");
  const [analysisType, setAnalysisType] = useState("review");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isExtractingFromPDF, setIsExtractingFromPDF] = useState(false);

  // NEW: Dynamic findings from AI or static data
  const [groupedFindings, setGroupedFindings] = useState<{
    [key: string]: Finding[];
  }>({
    Kesalahan: [
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
    Hukum: [
      {
        id: "finding-3",
        page: 3,
        text: "confidential information",
        comment:
          'Definisi "informasi rahasia" sudah jelas dan komprehensif. Bagus.',
        category: "Positive",
      },
    ],
  });

  const allFindings = Object.values(groupedFindings).flat();

  // UPDATED: Extract text from PDF and populate contract content
  const extractTextFromPDF = async () => {
    setIsExtractingFromPDF(true);
    try {
      const response = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: pdfFile }),
      });

      if (!response.ok) {
        throw new Error(`Failed to extract text: ${response.status}`);
      }

      const data = await response.json();

      // Convert coordinate data to plain text
      const extractedText =
        data.textData
          ?.map((item: any) => {
            // Handle different text item formats
            if (typeof item === "string") return item;
            if (item.text) return item.text;
            if (item.str) return item.str; // Some PDF parsers use 'str'
            return "";
          })
          .filter((text: string) => text.trim()) // Remove empty strings
          .join(" ") || "";

      if (extractedText.length > 0) {
        setContractContent(extractedText);
        console.log(`✅ Extracted ${extractedText.length} characters from PDF`);
      } else {
        throw new Error("No text content found in PDF");
      }
    } catch (error) {
      console.error("❌ Failed to extract text from PDF:", error);
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Failed to extract text from PDF"
      );
    } finally {
      setIsExtractingFromPDF(false);
    }
  };

  // Existing useEffect for text coordinates - UPDATED to auto-extract content
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
        const textData = data.textData || [];
        setTextWithCoords(textData);

        // NEW: Auto-populate contract content when PDF is loaded
        const extractedText =
          textData
            ?.map((item: any) => {
              if (typeof item === "string") return item;
              if (item.text) return item.text;
              if (item.str) return item.str;
              return "";
            })
            .filter((text: string) => text.trim())
            .join(" ") || "";

        if (extractedText.length > 0 && !contractContent) {
          setContractContent(extractedText);
          console.log(
            `🔄 Auto-populated contract content (${extractedText.length} characters)`
          );
        }
      } catch (error) {
        console.error("Failed to fetch text coordinates", error);
        setTextWithCoords([]);
      } finally {
        setIsLoadingText(false);
      }
    };
    fetchTextData();
  }, [pdfFile]); // Removed contractContent dependency to avoid loop

  useEffect(() => {
    if (activeFindingId) {
      const element = document.getElementById(activeFindingId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeFindingId]);

  // NEW: AI Analysis function
  const handleAIAnalysis = async () => {
    if (!contractContent.trim()) {
      setAnalysisError(
        "No contract content available. Please extract text from PDF first."
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);

    try {
      console.log("🤖 Starting AI analysis...");

      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractContent: contractContent.trim(),
          contractType,
          analysisType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Analysis failed: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setAiAnalysis(data);
      console.log("✅ AI analysis completed successfully");

      // NEW: Parse AI analysis and create findings
      parseAIAnalysisToFindings(data.analysis);
    } catch (error) {
      console.error("❌ AI analysis error:", error);
      setAnalysisError(
        error instanceof Error ? error.message : "Failed to analyze contract"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAIAnalysisToFindings = (analysis: string) => {
    try {
      // Clear previous AI findings
      const filteredFindings = Object.fromEntries(
        Object.entries(groupedFindings).filter(([key]) => !key.startsWith("AI"))
      );

      // Split by section headers (## format)
      const sections = analysis
        .split(/(?=^##\s)/m)
        .filter((section) => section.trim());
      const newFindings: { [key: string]: Finding[] } = {};
      let findingCounter = 1;

      sections.forEach((section, index) => {
        const trimmedSection = section.trim();
        if (trimmedSection.length < 30) return; // Skip very short sections

        // Extract header and content
        const lines = trimmedSection.split("\n");
        const header = lines[0].replace(/^#+\s*/, "").trim();
        const content = lines.slice(1).join("\n").trim();

        if (!content) return; // Skip if no content

        // Categorize based on section header
        let category: "Critical" | "Suggestion" | "Positive" = "Suggestion";
        let groupName = "AI General Analysis";

        const lowerHeader = header.toLowerCase();

        // Map specific headers to categories
        if (
          lowerHeader.includes("critical") ||
          lowerHeader.includes("risk") ||
          lowerHeader.includes("issues") ||
          lowerHeader.includes("violations") ||
          lowerHeader.includes("problems")
        ) {
          category = "Critical";
          groupName = "AI Critical Issues";
        } else if (
          lowerHeader.includes("recommend") ||
          lowerHeader.includes("improvement") ||
          lowerHeader.includes("suggest") ||
          lowerHeader.includes("missing") ||
          lowerHeader.includes("compliance") ||
          lowerHeader.includes("clauses")
        ) {
          category = "Suggestion";
          groupName = "AI Recommendations";
        } else if (
          lowerHeader.includes("positive") ||
          lowerHeader.includes("good") ||
          lowerHeader.includes("well") ||
          lowerHeader.includes("compliant") ||
          lowerHeader.includes("elements")
        ) {
          category = "Positive";
          groupName = "AI Positive Notes";
        } else if (
          lowerHeader.includes("summary") ||
          lowerHeader.includes("assessment") ||
          lowerHeader.includes("analysis") ||
          lowerHeader.includes("terms")
        ) {
          category = "Suggestion";
          groupName = "AI Analysis Summary";
        }

        if (!newFindings[groupName]) newFindings[groupName] = [];

        // Split content into bullet points if possible
        const bulletPoints = content
          .split(/(?=^[-•*]\s)/m)
          .filter((point) => point.trim());

        if (bulletPoints.length > 1) {
          // Multiple points - create separate findings
          bulletPoints.forEach((point, pointIndex) => {
            const cleanPoint = point.replace(/^[-•*]\s*/, "").trim();
            if (cleanPoint.length < 20) return;

            const firstLine = cleanPoint.split("\n")[0];
            const restOfPoint = cleanPoint.split("\n").slice(1).join("\n");

            newFindings[groupName].push({
              id: `ai-finding-${findingCounter++}`,
              page: -1,
              text:
                firstLine.substring(0, 80) ||
                `${header} - Point ${pointIndex + 1}`,
              comment: restOfPoint || firstLine,
              category,
            });
          });
        } else {
          // Single section - create one finding
          const firstLine = content.split("\n")[0];
          const restOfContent = content.split("\n").slice(1).join("\n");

          newFindings[groupName].push({
            id: `ai-finding-${findingCounter++}`,
            page: -1,
            text: firstLine.substring(0, 80) || header,
            comment: restOfContent || content,
            category,
          });
        }
      });

      // If no structured sections found, fall back to simple parsing
      if (Object.keys(newFindings).length === 0) {
        console.log("📝 No structured sections found, using fallback parsing");

        // Simple fallback parsing
        const paragraphs = analysis
          .split("\n\n")
          .filter((p) => p.trim().length > 30);

        paragraphs.forEach((paragraph, index) => {
          const lowerParagraph = paragraph.toLowerCase();
          let category: "Critical" | "Suggestion" | "Positive" = "Suggestion";
          let groupName = "AI General Analysis";

          if (
            lowerParagraph.includes("risk") ||
            lowerParagraph.includes("critical") ||
            lowerParagraph.includes("violation") ||
            lowerParagraph.includes("problem")
          ) {
            category = "Critical";
            groupName = "AI Critical Issues";
          } else if (
            lowerParagraph.includes("recommend") ||
            lowerParagraph.includes("suggest") ||
            lowerParagraph.includes("improve") ||
            lowerParagraph.includes("consider")
          ) {
            category = "Suggestion";
            groupName = "AI Recommendations";
          } else if (
            lowerParagraph.includes("good") ||
            lowerParagraph.includes("positive") ||
            lowerParagraph.includes("compliant") ||
            lowerParagraph.includes("well")
          ) {
            category = "Positive";
            groupName = "AI Positive Notes";
          }

          if (!newFindings[groupName]) newFindings[groupName] = [];

          const firstSentence = paragraph.split(".")[0] + ".";

          newFindings[groupName].push({
            id: `ai-finding-${findingCounter++}`,
            page: -1,
            text: firstSentence.substring(0, 80),
            comment: paragraph,
            category,
          });
        });
      }

      // Merge new findings with existing non-AI findings
      setGroupedFindings({
        ...filteredFindings,
        ...newFindings,
      });

      const totalFindings = Object.values(newFindings).flat().length;
      console.log(
        `📊 Created ${totalFindings} AI findings across ${
          Object.keys(newFindings).length
        } categories`
      );

      // Log the categories for debugging
      Object.entries(newFindings).forEach(([category, findings]) => {
        console.log(`  - ${category}: ${findings.length} findings`);
      });
    } catch (error) {
      console.error("Error parsing AI analysis:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Periksa Hukum dan Ketepatan Penulisan Kontrak
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                <strong>Judul Kontrak:</strong> Dibuat pada 1 Januari 2025
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200"
              >
                Simpan perubahan 🖊️
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* UPDATED: AI Analysis Panel */}
      {showAIPanel && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Contract Analysis
              {contractContent && (
                <Badge variant="secondary" className="ml-2">
                  Ready ({contractContent.length.toLocaleString()} chars)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Contract Type</label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partnership">
                      Partnership Agreement
                    </SelectItem>
                    <SelectItem value="employment">
                      Employment Contract
                    </SelectItem>
                    <SelectItem value="service">Service Agreement</SelectItem>
                    <SelectItem value="nda">NDA/Confidentiality</SelectItem>
                    <SelectItem value="general">General Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Analysis Type</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Full Legal Review</SelectItem>
                    <SelectItem value="extract">
                      Extract Key Information
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Contract Content</label>
                <div className="flex gap-2">
                  <Button
                    onClick={extractTextFromPDF}
                    disabled={isExtractingFromPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {isExtractingFromPDF ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        Re-extract from PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Contract content will be automatically extracted from the PDF above, or you can paste content here manually..."
                value={contractContent}
                onChange={(e) => setContractContent(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            {analysisError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{analysisError}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing || !contractContent.trim()}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>

              {!contractContent.trim() && (
                <span className="text-sm text-muted-foreground">
                  {isLoadingText
                    ? "Loading PDF content..."
                    : "Extract PDF text first"}
                </span>
              )}

              {aiAnalysis?.usage && (
                <div className="text-sm text-muted-foreground">
                  Tokens used: {aiAnalysis.usage.total_tokens}
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium mb-2">AI Analysis Results:</h4>
                <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {aiAnalysis.analysis}
                  </pre>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    Model:{" "}
                    {process.env.NEXT_PUBLIC_AI_MODEL ||
                      "anthropic/claude-3.5-sonnet"}
                  </span>
                  <span>Analysis Type: {aiAnalysis.analysisType}</span>
                  <span>
                    Generated: {new Date(aiAnalysis.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Rekomendasi Hukum */}
        <div className="w-1/3 border-r bg-white flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Rekomendasi Hukum</h2>
              <Button
                onClick={() => setShowAIPanel(!showAIPanel)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                {showAIPanel ? "Hide" : "Show"} AI
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            
            {/* AI Analysis Panel */}
            {showAIPanel && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Contract Analysis
                    {contractContent && (
                      <Badge variant="secondary" className="ml-2">
                        Ready ({contractContent.length.toLocaleString()} chars)
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium">Contract Type</label>
                      <Select value={contractType} onValueChange={setContractType}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="partnership">Partnership Agreement</SelectItem>
                          <SelectItem value="employment">Employment Contract</SelectItem>
                          <SelectItem value="service">Service Agreement</SelectItem>
                          <SelectItem value="nda">NDA/Confidentiality</SelectItem>
                          <SelectItem value="general">General Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Analysis Type</label>
                      <Select value={analysisType} onValueChange={setAnalysisType}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review">Full Legal Review</SelectItem>
                          <SelectItem value="extract">Extract Key Information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={extractTextFromPDF}
                      disabled={isExtractingFromPDF}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {isExtractingFromPDF ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Extract from PDF
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleAIAnalysis}
                      disabled={isAnalyzing || !contractContent}
                      className="flex items-center gap-1"
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3" />
                          Run AI Analysis
                        </>
                      )}
                    </Button>
                  </div>

                  {analysisError && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{analysisError}</AlertDescription>
                    </Alert>
                  )}

                  {aiAnalysis && (
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm">
                        <div className="font-medium mb-2">AI Analysis Result:</div>
                        <div className="text-gray-700 text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {aiAnalysis.analysis}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                          <span>Type: {aiAnalysis.analysisType}</span>
                          <span>•</span>
                          <span>Generated: {new Date(aiAnalysis.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Hukum Recommendations */}
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Pasal 1320 KUH Perdata – Syarat Sahnya Perjanjian
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      "Perjanjian ini telah memenuhi 4 syarat sahnya perjanjian, kesepakatan para pihak, objek tertentu, dan sebab yang halal."
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      "Alasan: Mengatur dasar legalitas kontrak, jika tidak memenuhi syarat ini, kontrak bisa dianggap batal demi hukum."
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Hapus
                      </Button>
                      <Button size="sm" className="text-xs bg-blue-500 text-white">
                        Tambah ke daftar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Pasal 1338 KUH Perdata – Asas Kebebasan Berkontrak
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      "Perjanjian ini telah memenuhi 4 syarat sahnya perjanjian, kesepakatan para pihak, objek tertentu, dan sebab yang halal."
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      "Alasan: Mengatur dasar legalitas kontrak, jika tidak memenuhi syarat ini, kontrak bisa dianggap batal demi hukum."
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Hapus
                      </Button>
                      <Button size="sm" className="text-xs bg-blue-500 text-white">
                        Tambah ke daftar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Pasal Terkait */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Daftar Pasal terkait:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pasal 1320 KUH Perdata – Syarat Sahnya Perjanjian</p>
                    <p className="text-xs text-gray-600">Perjanjian ini telah memenuhi 4 syarat sahnya perjanjian, kesepakatan para pihak, objek tertentu, dan sebab yang halal.</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      Hapus
                    </Button>
                    <Button size="sm" className="text-xs bg-blue-500 text-white">
                      Lihat penjelasan
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pasal 1320 KUH Perdata – Syarat Sahnya Perjanjian</p>
                    <p className="text-xs text-gray-600">Perjanjian ini telah memenuhi 4 syarat sahnya perjanjian, kesepakatan para pihak, objek tertentu, dan sebab yang halal.</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs">
                      Hapus
                    </Button>
                    <Button size="sm" className="text-xs bg-blue-500 text-white">
                      Lihat penjelasan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - PDF Viewer */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            {isLoadingText ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <div className="w-full h-full">
                <ContractViewerOverlay
                  file={pdfFile}
                  activeFindingId={activeFindingId}
                  reviewFindings={allFindings}
                  categoryColors={categoryColors}
                  textWithCoords={textWithCoords}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Skor Risiko */}
        <div className="w-1/3 border-l bg-white flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Skor Risiko</h2>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Total Findings Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{allFindings.length}</div>
                <div className="text-sm text-blue-700">Total Findings</div>
                {Object.keys(groupedFindings).some((key) => key.startsWith("AI")) && (
                  <Badge variant="outline" className="mt-2">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
            </div>

            {/* Findings by Category */}
            <div className="space-y-4">
              {Object.entries(groupedFindings).map(([groupTitle, findings]) => (
                <div key={groupTitle} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{groupTitle}</h3>
                    <Badge variant="secondary" className="text-xs">{findings.length}</Badge>
                    {groupTitle.startsWith("AI") && (
                      <Badge variant="outline" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  {findings.map((finding) => {
                    const isActive = activeFindingId === finding.id;
                    const colorClass = 
                      finding.category === 'Critical' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                      finding.category === 'Suggestion' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
                      'bg-green-50 border-green-200 hover:bg-green-100';
                    
                    const iconClass = 
                      finding.category === 'Critical' ? 'bg-red-500' :
                      finding.category === 'Suggestion' ? 'bg-orange-500' :
                      'bg-green-500';

                    return (
                      <div
                        key={finding.id}
                        className={`${colorClass} ${isActive ? 'ring-2 ring-blue-500' : ''} border rounded-lg p-3 cursor-pointer transition-all duration-200`}
                        onClick={() => setActiveFindingId(activeFindingId === finding.id ? null : finding.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${iconClass} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0`}>
                            {finding.category === 'Critical' ? '!' : 
                             finding.category === 'Suggestion' ? '?' : '✓'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${categoryColors[finding.category].badge} text-white text-xs`}>
                                {finding.category}
                              </Badge>
                              <span className="text-xs text-gray-500">Page {finding.page}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              {finding.id.startsWith("ai-") ? "AI Finding" : "Finding"} #{finding.id.split("-")[finding.id.split("-").length - 1]}
                            </p>
                            <p className="text-xs text-gray-600 italic mb-2 line-clamp-2">
                              "{finding.text}"
                            </p>
                            {isActive && (
                              <p className="text-xs text-gray-700 mt-2 p-2 bg-white rounded border">
                                {finding.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractReviewerPage() {
  return (
    <ReviewAccess>
      <ContractReviewerPageContent />
    </ReviewAccess>
  );
}
