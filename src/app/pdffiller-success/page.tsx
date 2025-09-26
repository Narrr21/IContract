"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function PDFFillerSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("token");
    if (accessToken) {
      setToken(accessToken);
      // Store token in localStorage or send to your backend
      localStorage.setItem("pdffiller_access_token", accessToken);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl">
            PDFfiller Connected Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your PDFfiller account has been successfully connected to IContract.
            You can now upload and edit PDFs using PDFfiller's advanced tools.
          </p>

          {token && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Authentication token received and stored securely.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
