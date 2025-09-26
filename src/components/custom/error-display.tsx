import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void; // Fungsi opsional untuk tombol "Coba Lagi"
}

export function ErrorDisplay({
  title = "Oops! Something went wrong.",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Anda bisa menambahkan detail error tambahan di sini jika perlu */}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
          {onRetry && <Button onClick={onRetry}>Try Again</Button>}
        </CardFooter>
      </Card>
    </div>
  );
}
