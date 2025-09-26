"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Type,
  Square,
  Circle,
  Pen,
  Move,
  Eraser,
  Trash2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DrawingElement {
  type: "text" | "rectangle" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  fontSize?: number;
  strokeWidth?: number;
  points?: { x: number; y: number }[];
}

type Tool = "move" | "text" | "rectangle" | "circle" | "pen" | "eraser";

interface Props {
  contractId: string;
}

export default function CanvasEditor({ contractId }: Props) {
  const router = useRouter();

  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);

  // Drawing state
  const [tool, setTool] = useState<Tool>("move");
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(
    null
  );

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [tempDocCreated, setTempDocCreated] = useState(false);

  // Drawing properties
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);

  const tempPdfFile = `/api/contract/${contractId}/temp-pdf`;
  const originalPdfFile = `/api/contract/${contractId}/pdf`;

  // Initialize PDF editor
  useEffect(() => {
    const initializePDFEditor = async () => {
      if (!contractId) return;

      setIsLoading(true);
      try {
        // Load PDF.js
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        // Fetch contract data
        const response = await fetch(`/api/contract?id=${contractId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch contract: ${response.status}`);
        }
        const data = await response.json();
        setContract(data.contract);

        // Create temporary document
        const tempResponse = await fetch(
          `/api/contract/${contractId}/create-temp`,
          {
            method: "POST",
          }
        );

        if (tempResponse.ok) {
          setTempDocCreated(true);
          console.log("✅ Temporary document created");
        }

        // Load PDF document
        const pdfUrl = tempResponse.ok ? tempPdfFile : originalPdfFile;
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        console.log("✅ PDF loaded with", pdf.numPages, "pages");

        // Initialize first page
        await renderPage(pdf, 1);
      } catch (error) {
        console.error("Failed to initialize PDF editor:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize PDF editor"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializePDFEditor();
  }, [contractId]);

  // Render PDF page to canvas
  const renderPage = useCallback(
    async (pdf: any, pageNum: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !pdf) return;

      const page = await pdf.getPage(pageNum);
      const context = canvas.getContext("2d");
      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Store context for drawing
      contextRef.current = context;

      // Redraw all elements for current page
      redrawElements();
    },
    [scale]
  );

  // Redraw all drawing elements
  const redrawElements = useCallback(() => {
    const context = contextRef.current;
    if (!context) return;

    elements.forEach((element) => {
      context.save();
      context.fillStyle = element.color || textColor;
      context.strokeStyle = element.color || textColor;
      context.lineWidth = element.strokeWidth || 2;

      switch (element.type) {
        case "text":
          context.font = `${element.fontSize || fontSize}px Arial`;
          context.fillText(element.text || "", element.x, element.y);
          break;
        case "rectangle":
          context.strokeRect(
            element.x,
            element.y,
            element.width || 0,
            element.height || 0
          );
          break;
        case "circle":
          const radius = Math.min(element.width || 0, element.height || 0) / 2;
          context.beginPath();
          context.arc(
            element.x + radius,
            element.y + radius,
            radius,
            0,
            2 * Math.PI
          );
          context.stroke();
          break;
        case "line":
          if (element.points && element.points.length > 1) {
            context.beginPath();
            context.moveTo(element.points[0].x, element.points[0].y);
            element.points.forEach((point) => {
              context.lineTo(point.x, point.y);
            });
            context.stroke();
          }
          break;
      }
      context.restore();
    });
  }, [elements, textColor, fontSize]);

  // Canvas event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || tool === "move") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newElement: DrawingElement = {
          type: "text",
          x,
          y,
          text,
          color: textColor,
          fontSize,
        };
        addElement(newElement);
      }
    } else if (tool === "pen") {
      const newElement: DrawingElement = {
        type: "line",
        x,
        y,
        points: [{ x, y }],
        color: textColor,
        strokeWidth: 2,
      };
      setCurrentElement(newElement);
    } else if (tool === "rectangle" || tool === "circle") {
      const newElement: DrawingElement = {
        type: tool,
        x,
        y,
        width: 0,
        height: 0,
        color: textColor,
        strokeWidth: 2,
      };
      setCurrentElement(newElement);
    }
  };

  const continueDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !currentElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "pen" && currentElement.points) {
      currentElement.points.push({ x, y });
      redrawElements();

      // Draw current line segment
      const context = contextRef.current;
      if (context && currentElement.points.length > 1) {
        context.strokeStyle = textColor;
        context.lineWidth = 2;
        context.beginPath();
        const lastPoint =
          currentElement.points[currentElement.points.length - 2];
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(x, y);
        context.stroke();
      }
    } else if (tool === "rectangle" || tool === "circle") {
      currentElement.width = x - currentElement.x;
      currentElement.height = y - currentElement.y;

      // Redraw everything including current shape
      if (pdfDoc) {
        renderPage(pdfDoc, currentPage);
      }

      const context = contextRef.current;
      if (context) {
        context.strokeStyle = textColor;
        context.lineWidth = 2;

        if (tool === "rectangle") {
          context.strokeRect(
            currentElement.x,
            currentElement.y,
            currentElement.width,
            currentElement.height
          );
        } else if (tool === "circle") {
          const radius =
            Math.min(
              Math.abs(currentElement.width),
              Math.abs(currentElement.height)
            ) / 2;
          context.beginPath();
          context.arc(
            currentElement.x + currentElement.width / 2,
            currentElement.y + currentElement.height / 2,
            radius,
            0,
            2 * Math.PI
          );
          context.stroke();
        }
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentElement) {
      addElement(currentElement);
      setCurrentElement(null);
    }
  };

  // Add element to history
  const addElement = (element: DrawingElement) => {
    const newElements = [...elements, element];
    setElements(newElements);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Clear all
  const clearAll = () => {
    const newElements: DrawingElement[] = [];
    setElements(newElements);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Page navigation
  const goToPage = async (pageNum: number) => {
    if (pdfDoc && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      await renderPage(pdfDoc, pageNum);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Re-render when scale changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [scale, pdfDoc, currentPage, renderPage]);

  // Save changes
  const saveChanges = async () => {
    if (!contract) return;

    setIsSaving(true);
    try {
      // Save drawing elements data
      const saveData = {
        elements,
        currentPage,
        scale,
      };

      const response = await fetch(`/api/contract/${contractId}/save-temp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawingData: saveData }),
      });

      if (response.ok) {
        console.log("✅ Canvas changes saved");
        router.push(`/contracts/${contractId}`);
      } else {
        throw new Error("Failed to save canvas changes");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/contracts/${contractId}`);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col p-4 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Skeleton className="w-96 h-8 mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading PDF editor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col p-4 bg-gray-50 dark:bg-gray-950">
        <Alert className="mb-4 border-destructive bg-destructive/10">
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
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
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <div className="flex items-center gap-4">
          <Button onClick={handleCancel} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Edit Contract</h1>
            {contract && (
              <p className="text-sm text-muted-foreground">{contract.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={tempDocCreated ? "default" : "secondary"}>
            {tempDocCreated ? "Draft Mode" : "View Only"}
          </Badge>
          <Button onClick={saveChanges} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Drawing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tool === "move" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool("move")}
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool("text")}
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "rectangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool("rectangle")}
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "circle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool("circle")}
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "pen" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool("pen")}
                >
                  <Pen className="h-4 w-4" />
                </Button>
                <Button
                  variant={tool === "eraser" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool("eraser")}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>

              {/* History controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs font-medium">Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>

              {/* Font size */}
              <div>
                <label className="text-xs font-medium">Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  {fontSize}px
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page controls */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={continueDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-300 bg-white cursor-crosshair shadow-lg"
                style={{ cursor: tool === "move" ? "default" : "crosshair" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
