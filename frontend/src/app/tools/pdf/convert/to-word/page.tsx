import { Metadata } from "next"
import { PDFToWordConverter } from "@/components/tools/pdf/convert/PDFToWordConverter"

export const metadata: Metadata = {
  title: "PDF to Word Converter - AllKit",
  description: "Convert PDF to Word documents with formatting preserved. Free online PDF to Word converter.",
}

export default function PDFToWordPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">PDF to Word Converter</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Convert your PDF documents to editable Word files while preserving formatting, tables, and images.
        </p>
      </div>

      <PDFToWordConverter />
    </div>
  )
} 