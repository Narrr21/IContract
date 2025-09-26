"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  Upload,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PDFFillerIntegrationProps {
  contractId: string;
}

interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error";
  message: string;
}

export default function PDFFillerIntegration({
  contractId,
}: PDFFillerIntegrationProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
    message: "",
  });
  const [pdfFillerUrl, setPdfFillerUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // PDFfiller configuration
  const PDFFILLER_CONFIG = {
    baseUrl: "https://www.pdffiller.com",
    embedUrl: "https://www.pdffiller.com/en/categories/embedded.htm",
  };

  useEffect(() => {
    initializeIntegration();
  }, [contractId]);

  const initializeIntegration = async () => {
    setIsLoading(true);
    try {
      // Fetch contract data
      const response = await fetch(`/api/contract?id=${contractId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch contract: ${response.status}`);
      }
      const data = await response.json();
      setContract(data.contract);

      // Initialize PDFfiller URL
      const pdfFillerEmbedUrl = generatePDFFillerUrl();
      setPdfFillerUrl(pdfFillerEmbedUrl);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize PDFfiller integration:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to initialize PDFfiller integration"
      );
      setIsLoading(false);
    }
  };

  const generatePDFFillerUrl = () => {
    // Use PDFfiller's general embed URL
    return PDFFILLER_CONFIG.embedUrl;
  };

  const uploadPDFToPDFFiller = async () => {
    setUploadStatus({
      status: "uploading",
      message: "Uploading PDF to PDFfiller...",
    });

    try {
      // First, get the PDF blob from our API
      const pdfResponse = await fetch(`/api/contract/${contractId}/pdf`);
      if (!pdfResponse.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const pdfBlob = await pdfResponse.blob();
      const formData = new FormData();
      formData.append("file", pdfBlob, `contract-${contractId}.pdf`);

      // Upload to PDFfiller through our backend API
      const uploadResponse = await fetch("/api/pdffiller/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to PDFfiller");
      }

      const result = await uploadResponse.json();

      setUploadStatus({
        status: "success",
        message: "PDF uploaded successfully to PDFfiller!",
      });

      // Update iframe URL to show the uploaded document
      if (result.documentId) {
        const editUrl = `${PDFFILLER_CONFIG.baseUrl}/en/project/embedded.htm?document_id=${result.documentId}`;
        setPdfFillerUrl(editUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      });
    }
  };

  const handleIframeMessage = (event: MessageEvent) => {
    // Handle messages from PDFfiller iframe
    if (event.origin !== PDFFILLER_CONFIG.baseUrl) return;

    const { type, data } = event.data;

    switch (type) {
      case "document_saved":
        console.log("Document saved in PDFfiller:", data);
        setUploadStatus({
          status: "success",
          message: "Document saved in PDFfiller!",
        });
        break;
      case "document_completed":
        console.log("Document completed:", data);
        downloadCompletedDocument(data.documentId);
        break;
      case "error":
        console.error("PDFfiller error:", data);
        setUploadStatus({
          status: "error",
          message: `PDFfiller error: ${data.message}`,
        });
        break;
    }
  };

  const downloadCompletedDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/pdffiller/download/${documentId}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `completed-contract-${contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setUploadStatus({
        status: "success",
        message: "Completed document downloaded successfully!",
      });
    } catch (error) {
      console.error("Download failed:", error);
      setUploadStatus({
        status: "error",
        message: "Failed to download completed document",
      });
    }
  };

  const refreshPDFFiller = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  useEffect(() => {
    // Listen for messages from PDFfiller iframe
    window.addEventListener("message", handleIframeMessage);
    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Skeleton className="w-96 h-8 mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading PDFfiller integration...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Alert className="mb-4 max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push(`/contracts/${contractId}`)}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push(`/contracts/${contractId}`)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDFfiller Editor
            </h1>
            {contract && (
              <p className="text-sm text-muted-foreground">{contract.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload Status Badge */}
          {uploadStatus.status !== "idle" && (
            <Badge
              variant={
                uploadStatus.status === "success"
                  ? "default"
                  : uploadStatus.status === "error"
                  ? "destructive"
                  : "secondary"
              }
              className="flex items-center gap-1"
            >
              {uploadStatus.status === "success" && (
                <CheckCircle className="h-3 w-3" />
              )}
              {uploadStatus.status === "error" && (
                <AlertCircle className="h-3 w-3" />
              )}
              {uploadStatus.status === "uploading" && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
              {uploadStatus.message}
            </Badge>
          )}

          <Button
            onClick={uploadPDFToPDFFiller}
            disabled={uploadStatus.status === "uploading"}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadStatus.status === "uploading"
              ? "Uploading..."
              : "Upload to PDFfiller"}
          </Button>

          <Button onClick={refreshPDFFiller} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button
            onClick={() => window.open(pdfFillerUrl, "_blank")}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with Instructions */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How to Use PDFfiller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    1
                  </span>
                  <p>
                    Click "Upload to PDFfiller" to send your PDF to the editor
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    2
                  </span>
                  <p>
                    Use the PDFfiller tools to add form fields, text,
                    signatures, and more
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    3
                  </span>
                  <p>Save your changes in PDFfiller when you're done</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    4
                  </span>
                  <p>The completed document will automatically download</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">PDFfiller Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Add text fields and form inputs</li>
                  <li>• Insert digital signatures</li>
                  <li>• Add checkboxes and dropdowns</li>
                  <li>• Insert images and logos</li>
                  <li>• Highlight and annotate text</li>
                  <li>• Professional form creation</li>
                </ul>
              </CardContent>
            </Card>

            {uploadStatus.status !== "idle" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>{uploadStatus.message}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push(`/contracts/${contractId}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Original Contract
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={refreshPDFFiller}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh PDFfiller
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open(
                      `${PDFFILLER_CONFIG.baseUrl}/en/help/`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PDFfiller Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PDFfiller Iframe */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white">
            {pdfFillerUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfFillerUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                allow="camera; microphone; geolocation"
                title="PDFfiller Editor"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    PDFfiller Not Loaded
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Click "Upload to PDFfiller" to get started
                  </p>
                  <Button onClick={uploadPDFToPDFFiller}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to PDFfiller
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
