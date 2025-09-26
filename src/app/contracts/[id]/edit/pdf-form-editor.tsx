"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Type,
  CheckSquare,
  Calendar,
  FileSignature,
  Edit3,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import SignaturePad from "@/components/signature-pad";

// PDF Form Field Types
interface FormField {
  id: string;
  type:
    | "text"
    | "textarea"
    | "checkbox"
    | "radio"
    | "select"
    | "date"
    | "signature";
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  page: number;
  name?: string;
}

interface PDFEditorProps {
  contractId: string;
}

export default function PDFEditor({ contractId }: PDFEditorProps) {
  const router = useRouter();

  // PDF references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // PDF state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);

  // Form fields state
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [mode, setMode] = useState<"view" | "edit" | "add">("view");
  const [fieldType, setFieldType] = useState<FormField["type"]>("text");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signingFieldId, setSigningFieldId] = useState<string | null>(null);

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

        // Load PDF document
        const pdfUrl = tempResponse.ok ? tempPdfFile : originalPdfFile;
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        console.log("✅ PDF loaded with", pdf.numPages, "pages");

        // Initialize first page
        await renderPage(pdf, 1);

        // Load existing form fields if any
        await loadFormFields();
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
      contextRef.current = context;

      // Update overlay size to match canvas
      if (overlayRef.current) {
        overlayRef.current.style.width = `${canvas.width}px`;
        overlayRef.current.style.height = `${canvas.height}px`;
      }
    },
    [scale]
  );

  // Load existing form fields
  const loadFormFields = async () => {
    try {
      const response = await fetch(`/api/contract/${contractId}/form-fields`);
      if (response.ok) {
        const fields = await response.json();
        setFormFields(fields);
      }
    } catch (error) {
      console.log("No existing form fields found");
    }
  };

  // Add new form field
  const addFormField = (x: number, y: number) => {
    if (mode !== "add") return;

    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      x: x - (overlayRef.current?.offsetLeft || 0),
      y: y - (overlayRef.current?.offsetTop || 0),
      width:
        fieldType === "textarea" ? 200 : fieldType === "checkbox" ? 20 : 150,
      height:
        fieldType === "textarea" ? 80 : fieldType === "checkbox" ? 20 : 30,
      value: "",
      page: currentPage,
      required: false,
    };

    setFormFields((prev) => [...prev, newField]);
    setSelectedField(newField.id);
    setMode("edit");
  };

  // Update form field value
  const updateFieldValue = (fieldId: string, value: string) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, value } : field))
    );
  };

  // Update field position and size
  const updateFieldGeometry = (
    fieldId: string,
    updates: Partial<FormField>
  ) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  // Handle field drag start
  const handleFieldMouseDown = (
    e: React.MouseEvent,
    fieldId: string,
    handle?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedField(fieldId);
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setDragStart({ x: startX, y: startY });

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
  };

  // Handle mouse move for drag/resize
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedField || (!isDragging && !isResizing)) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    const field = formFields.find((f) => f.id === selectedField);
    if (!field) return;

    if (isDragging) {
      // Move field
      updateFieldGeometry(selectedField, {
        x: Math.max(0, field.x + deltaX),
        y: Math.max(0, field.y + deltaY),
      });
    } else if (isResizing && resizeHandle) {
      // Resize field
      let newWidth = field.width;
      let newHeight = field.height;
      let newX = field.x;
      let newY = field.y;

      switch (resizeHandle) {
        case "se": // Southeast corner
          newWidth = Math.max(50, field.width + deltaX);
          newHeight = Math.max(20, field.height + deltaY);
          break;
        case "sw": // Southwest corner
          newWidth = Math.max(50, field.width - deltaX);
          newHeight = Math.max(20, field.height + deltaY);
          newX = field.x + deltaX;
          break;
        case "ne": // Northeast corner
          newWidth = Math.max(50, field.width + deltaX);
          newHeight = Math.max(20, field.height - deltaY);
          newY = field.y + deltaY;
          break;
        case "nw": // Northwest corner
          newWidth = Math.max(50, field.width - deltaX);
          newHeight = Math.max(20, field.height - deltaY);
          newX = field.x + deltaX;
          newY = field.y + deltaY;
          break;
        case "e": // East side
          newWidth = Math.max(50, field.width + deltaX);
          break;
        case "w": // West side
          newWidth = Math.max(50, field.width - deltaX);
          newX = field.x + deltaX;
          break;
        case "n": // North side
          newHeight = Math.max(20, field.height - deltaY);
          newY = field.y + deltaY;
          break;
        case "s": // South side
          newHeight = Math.max(20, field.height + deltaY);
          break;
      }

      updateFieldGeometry(selectedField, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: newWidth,
        height: newHeight,
      });
    }

    setDragStart({ x: currentX, y: currentY });
  };

  // Handle mouse up for drag/resize
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Delete form field
  const deleteField = (fieldId: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== fieldId));
    setSelectedField(null);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === "add") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addFormField(x, y);
    } else {
      setSelectedField(null);
    }
  };

  // Page navigation
  const goToPage = async (pageNum: number) => {
    if (pdfDoc && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      await renderPage(pdfDoc, pageNum);
    }
  };

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Re-render when scale changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [scale, pdfDoc, currentPage, renderPage]);

  // Save signature
  const handleSignatureSave = (signature: string) => {
    if (signingFieldId) {
      updateFieldValue(signingFieldId, signature);
      setSigningFieldId(null);
    }
    setShowSignaturePad(false);
  };

  // Flatten fields into PDF (render as one image)
  const flattenPDFWithFields = async () => {
    if (!canvasRef.current || !contextRef.current) return null;

    const canvas = canvasRef.current;
    const context = contextRef.current;

    // Save current canvas state
    context.save();

    // Render all fields for current page onto the canvas
    const pageFields = formFields.filter((f) => f.page === currentPage);

    for (const field of pageFields) {
      context.save();

      switch (field.type) {
        case "text":
        case "textarea":
          if (field.value) {
            // Set text properties
            context.fillStyle = "#000000";
            context.font = `${field.type === "textarea" ? "12" : "14"}px Arial`;
            context.textBaseline = "top";

            // Fill background
            context.fillStyle = "rgba(255, 255, 255, 0.9)";
            context.fillRect(field.x, field.y, field.width, field.height);

            // Add border
            context.strokeStyle = "#d1d5db";
            context.lineWidth = 1;
            context.strokeRect(field.x, field.y, field.width, field.height);

            // Draw text
            context.fillStyle = "#000000";
            if (field.type === "textarea") {
              // Multi-line text
              const words = field.value.split(" ");
              const lineHeight = 16;
              const maxWidth = field.width - 8;
              let line = "";
              let y = field.y + 6;

              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + " ";
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > maxWidth && n > 0) {
                  context.fillText(line, field.x + 4, y);
                  line = words[n] + " ";
                  y += lineHeight;

                  // Stop if we exceed field height
                  if (y > field.y + field.height - lineHeight) break;
                } else {
                  line = testLine;
                }
              }
              if (line && y <= field.y + field.height - lineHeight) {
                context.fillText(line, field.x + 4, y);
              }
            } else {
              // Single line text
              const maxWidth = field.width - 8;
              let text = field.value;
              while (
                context.measureText(text).width > maxWidth &&
                text.length > 0
              ) {
                text = text.slice(0, -1);
              }
              context.fillText(text, field.x + 4, field.y + 8);
            }
          }
          break;

        case "checkbox":
          // Fill background
          context.fillStyle = "rgba(255, 255, 255, 0.9)";
          context.fillRect(field.x, field.y, field.width, field.height);

          // Draw checkbox border
          context.strokeStyle = "#374151";
          context.lineWidth = 2;
          context.strokeRect(
            field.x + 2,
            field.y + 2,
            field.width - 4,
            field.height - 4
          );

          // Draw checkmark if checked
          if (field.value === "true") {
            context.strokeStyle = "#059669";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(field.x + 4, field.y + field.height / 2);
            context.lineTo(
              field.x + field.width / 2,
              field.y + field.height - 4
            );
            context.lineTo(field.x + field.width - 4, field.y + 4);
            context.stroke();
          }
          break;

        case "signature":
          if (field.value) {
            const img = new Image();
            img.onload = () => {
              context.drawImage(
                img,
                field.x,
                field.y,
                field.width,
                field.height
              );
            };
            img.src = field.value;
          }
          break;
      }

      context.restore();
    }

    // Restore canvas state
    context.restore();

    // Return flattened canvas as blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  };

  // Save flattened PDF
  const saveFormFields = async () => {
    setIsSaving(true);
    try {
      // First flatten the current page
      const flattenedBlob = await flattenPDFWithFields();

      if (flattenedBlob) {
        // Save the flattened image
        const formData = new FormData();
        formData.append(
          "flattenedPage",
          flattenedBlob,
          `page-${currentPage}.png`
        );
        formData.append("page", currentPage.toString());
        formData.append("fields", JSON.stringify(formFields));

        const response = await fetch(
          `/api/contract/${contractId}/flatten-pdf`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          console.log("✅ PDF flattened and saved");
        }
      }

      // Also save form fields data
      const fieldsResponse = await fetch(
        `/api/contract/${contractId}/form-fields`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: formFields }),
        }
      );

      if (fieldsResponse.ok) {
        console.log("✅ Form fields saved");
        router.push(`/contracts/${contractId}`);
      } else {
        throw new Error("Failed to save form fields");
      }
    } catch (error) {
      console.error("Failed to save:", error);
      setError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Render form field component
  const renderFormField = (field: FormField) => {
    const isSelected = selectedField === field.id;
    const isCurrentPage = field.page === currentPage;

    if (!isCurrentPage) return null;

    const style = {
      position: "absolute" as const,
      left: field.x,
      top: field.y,
      width: field.width,
      height: field.height,
      border: isSelected ? "2px solid #3b82f6" : "1px solid #d1d5db",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      zIndex: 10,
    };

    const handleFieldClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedField(field.id);
    };

    // Resize handles for selected field
    const renderResizeHandles = () => {
      if (!isSelected) return null;

      const handleSize = 8;
      const handleStyle = {
        position: "absolute" as const,
        width: handleSize,
        height: handleSize,
        backgroundColor: "#3b82f6",
        border: "1px solid white",
        borderRadius: "2px",
        cursor: "pointer",
        zIndex: 15,
      };

      return (
        <>
          {/* Corner handles */}
          <div
            style={{
              ...handleStyle,
              top: -handleSize / 2,
              left: -handleSize / 2,
              cursor: "nw-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "nw")}
          />
          <div
            style={{
              ...handleStyle,
              top: -handleSize / 2,
              right: -handleSize / 2,
              cursor: "ne-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "ne")}
          />
          <div
            style={{
              ...handleStyle,
              bottom: -handleSize / 2,
              left: -handleSize / 2,
              cursor: "sw-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "sw")}
          />
          <div
            style={{
              ...handleStyle,
              bottom: -handleSize / 2,
              right: -handleSize / 2,
              cursor: "se-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "se")}
          />

          {/* Side handles */}
          <div
            style={{
              ...handleStyle,
              top: "50%",
              left: -handleSize / 2,
              transform: "translateY(-50%)",
              cursor: "w-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "w")}
          />
          <div
            style={{
              ...handleStyle,
              top: "50%",
              right: -handleSize / 2,
              transform: "translateY(-50%)",
              cursor: "e-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "e")}
          />
          <div
            style={{
              ...handleStyle,
              top: -handleSize / 2,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "n-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "n")}
          />
          <div
            style={{
              ...handleStyle,
              bottom: -handleSize / 2,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "s-resize",
            }}
            onMouseDown={(e) => handleFieldMouseDown(e, field.id, "s")}
          />
        </>
      );
    };

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} style={{ position: "relative" }}>
            <Input
              value={field.value}
              placeholder={field.placeholder || "Enter text..."}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              onClick={handleFieldClick}
              onMouseDown={(e) => {
                if (!isSelected) {
                  handleFieldClick(e);
                } else {
                  handleFieldMouseDown(e, field.id);
                }
              }}
              className={`absolute select-none ${
                isSelected ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                ...style,
                cursor: isSelected ? "move" : "text",
              }}
            />
            {renderResizeHandles()}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} style={{ position: "relative" }}>
            <Textarea
              value={field.value}
              placeholder={field.placeholder || "Enter text..."}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              onClick={handleFieldClick}
              onMouseDown={(e) => {
                if (!isSelected) {
                  handleFieldClick(e);
                } else {
                  handleFieldMouseDown(e, field.id);
                }
              }}
              className={`absolute resize-none select-none ${
                isSelected ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                ...style,
                cursor: isSelected ? "move" : "text",
              }}
            />
            {renderResizeHandles()}
          </div>
        );

      case "checkbox":
        return (
          <div
            key={field.id}
            style={style}
            onClick={handleFieldClick}
            className={`flex items-center justify-center ${
              isSelected ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <Checkbox
              checked={field.value === "true"}
              onCheckedChange={(checked) =>
                updateFieldValue(field.id, checked ? "true" : "false")
              }
            />
          </div>
        );

      case "date":
        return (
          <Input
            key={field.id}
            type="date"
            style={style}
            value={field.value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            onClick={handleFieldClick}
            className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
          />
        );

      case "signature":
        return (
          <div
            key={field.id}
            style={style}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedField(field.id);
              if (!field.value) {
                setSigningFieldId(field.id);
                setShowSignaturePad(true);
              }
            }}
            className={`flex items-center justify-center border-2 border-dashed cursor-pointer ${
              isSelected ? "border-blue-500" : "border-gray-300"
            } bg-gray-50 hover:bg-gray-100`}
          >
            {field.value ? (
              <img
                src={field.value}
                alt="Signature"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-xs text-gray-500 text-center">
                <FileSignature className="h-4 w-4 mx-auto mb-1" />
                Click to sign
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Skeleton className="w-96 h-8 mb-4" />
          <p className="text-sm text-muted-foreground">Loading PDF editor...</p>
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
      <div className="flex items-center justify-between p-4 bg-white border-b">
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
            <h1 className="text-lg font-semibold">PDF Form Editor</h1>
            {contract && (
              <p className="text-sm text-muted-foreground">{contract.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{formFields.length} fields</Badge>
          <Button
            onClick={async () => {
              const blob = await flattenPDFWithFields();
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `contract-${contractId}-page-${currentPage}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download as Image
          </Button>
          <Button onClick={saveFormFields} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save & Flatten"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={mode === "view" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("view")}
                  className="w-full justify-start"
                >
                  View & Edit Fields
                </Button>
                <Button
                  variant={mode === "add" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("add")}
                  className="w-full justify-start"
                >
                  Add New Field
                </Button>
              </CardContent>
            </Card>

            {/* Field Type Selection */}
            {mode === "add" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Field Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={fieldType}
                    onValueChange={(value: FormField["type"]) =>
                      setFieldType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center">
                          <Type className="h-4 w-4 mr-2" />
                          Text Input
                        </div>
                      </SelectItem>
                      <SelectItem value="textarea">
                        <div className="flex items-center">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Text Area
                        </div>
                      </SelectItem>
                      <SelectItem value="checkbox">
                        <div className="flex items-center">
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Checkbox
                        </div>
                      </SelectItem>
                      <SelectItem value="date">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Date Picker
                        </div>
                      </SelectItem>
                      <SelectItem value="signature">
                        <div className="flex items-center">
                          <FileSignature className="h-4 w-4 mr-2" />
                          Signature
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Selected Field Properties */}
            {selectedField && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Field Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(() => {
                    const field = formFields.find(
                      (f) => f.id === selectedField
                    );
                    return field ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <div className="text-sm font-medium capitalize">
                            {field.type}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Position</Label>
                          <div className="text-xs text-muted-foreground">
                            X: {Math.round(field.x)}, Y: {Math.round(field.y)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Size</Label>
                          <div className="text-xs text-muted-foreground">
                            {field.width} × {field.height}
                          </div>
                        </div>
                        {field.type === "signature" && field.value && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSigningFieldId(field.id);
                              setShowSignaturePad(true);
                            }}
                            className="w-full"
                          >
                            <FileSignature className="h-4 w-4 mr-2" />
                            Re-sign
                          </Button>
                        )}
                        {field.type === "signature" && field.value && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFieldValue(field.id, "")}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Signature
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteField(selectedField)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Field
                        </Button>
                      </>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Field List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Form Fields ({formFields.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {formFields
                  .filter((f) => f.page === currentPage)
                  .map((field) => (
                    <div
                      key={field.id}
                      className={`p-2 rounded border text-sm cursor-pointer ${
                        selectedField === field.id
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50"
                      }`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <div className="font-medium capitalize">{field.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {field.value || "Empty"}
                      </div>
                    </div>
                  ))}
                {formFields.filter((f) => f.page === currentPage).length ===
                  0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No fields on this page
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Page Controls */}
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
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
              <span className="text-sm font-medium">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* PDF Canvas with Form Overlay */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="flex justify-center">
              <div
                className="relative"
                onClick={handleCanvasClick}
                style={{ cursor: mode === "add" ? "crosshair" : "default" }}
              >
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 bg-white shadow-lg"
                />

                {/* Form Fields Overlay */}
                <div
                  ref={overlayRef}
                  className="absolute top-0 left-0 pointer-events-auto"
                  style={{
                    width: canvasRef.current?.width || 0,
                    height: canvasRef.current?.height || 0,
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {formFields.map(renderFormField)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {mode === "add" && (
        <div className="p-3 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            Click anywhere on the PDF to add a {fieldType} field
          </p>
        </div>
      )}

      {/* Signature Pad Dialog */}
      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => {
          setShowSignaturePad(false);
          setSigningFieldId(null);
        }}
        onSave={handleSignatureSave}
      />
    </div>
  );
}
