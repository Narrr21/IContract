// types/pdfjs.d.ts

// FIX: Update the module path to match the legacy build.
declare module "pdfjs-dist/legacy/build/pdf.js" {
  export * from "pdfjs-dist/types/src/pdf";
}