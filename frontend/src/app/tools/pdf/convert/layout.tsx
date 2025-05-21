import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PDF Conversion Tools - AllKit",
  description: "Convert PDF to Word, Excel, PowerPoint, Images and vice versa. Free online PDF conversion tools.",
}

export default function PDFConvertLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 