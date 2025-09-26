'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Create a separate component that uses useSearchParams
function PDFFillerSuccessContent() {
  const searchParams = useSearchParams()
  const documentId = searchParams.get('documentId')
  const fileName = searchParams.get('fileName') || 'document'

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            PDF Successfully Filled!
          </CardTitle>
          <CardDescription>
            Your document has been processed and is ready for download.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Document: <span className="font-semibold">{fileName}</span>
            </p>
            
            {documentId && (
              <p className="text-sm text-gray-500">
                Document ID: {documentId}
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild variant="default">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            
            {documentId && (
              <Button asChild variant="outline">
                <a 
                  href={`/api/download-filled-pdf?documentId=${documentId}`}
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component wrapped with Suspense
export default function PDFFillerSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PDFFillerSuccessContent />
    </Suspense>
  )
}