"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, ArrowLeft } from "lucide-react";
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

// Interface for contract data
interface Contract {
  id: number;
  namakontrak: string;
  status: string;
  counterparty: string;
  type: string;
  jatuhtempo: string;
}

export default function ContractViewerPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfFile = `/api/contract/${contractId}/pdf`;

  // Fetch contract data
  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/contract?id=${contractId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch contract: ${response.status}`);
        }

        const data = await response.json();
        setContract(data.contract);
      } catch (error) {
        console.error("Failed to fetch contract:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch contract"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleEdit = () => {
    router.push(`/contracts/${contractId}/edit`);
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col p-4 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center h-full">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col p-4 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center h-full">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button onClick={handleBack} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col p-4 bg-gray-50 dark:bg-gray-950">
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Contract Viewer
              </h1>
              <p className="text-muted-foreground">
                {contract ? (
                  <>
                    Contract ID:{" "}
                    <span className="font-mono">#{contractId}</span> -{" "}
                    {contract.namakontrak}
                  </>
                ) : (
                  `Contract ID: #${contractId}`
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Contract
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 rounded-lg border bg-white overflow-hidden">
        <div className="h-full w-full overflow-auto">
          <div className="min-h-full flex items-start justify-center p-2">
            <ContractViewerOverlay
              file={pdfFile}
              activeFindingId={null}
              reviewFindings={[]}
              categoryColors={{}}
              textWithCoords={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
