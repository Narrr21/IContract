// api/extract-text/route.ts

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { PdfReader } from "pdfreader";

// A helper function to parse the PDF with Promises
function parsePdf(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const allTextWithCoords: any[] = [];
    let currentPage = 0;

    new PdfReader(null).parseBuffer(buffer, (err, item) => {
      if (err) {
        // If there's an error, reject the promise
        reject(err);
      } else if (!item) {
        // If we're done, resolve the promise with the collected data
        resolve(allTextWithCoords);
      } else if (item.page) {
        // A new page has started
        currentPage = item.page;
      } else if (item.text) {
        // An item with text has been found
        allTextWithCoords.push({
          text: item.text,
          x: (item as any).x, // FIX: Tell TypeScript to trust us
          y: (item as any).y, // FIX: Tell TypeScript to trust us
          // Note: pdfreader doesn't provide width/height, but x/y is enough for highlighting
          width: 0,
          height: 0,
          page: currentPage,
        });
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }

    const pdfPath = path.resolve("./public", fileName);
    const pdfBuffer = await fs.readFile(pdfPath);

    // Use our new helper function to get the text data
    const textData = await parsePdf(pdfBuffer);

    return NextResponse.json({ textData });
  } catch (error) {
    console.error("Failed to extract text from PDF:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
