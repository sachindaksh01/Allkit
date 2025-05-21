"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { FileText, FileImage, FileSpreadsheet, Presentation } from "lucide-react"
import Link from "next/link"
import { PDFToWordConverter } from "@/components/tools/pdf/convert/PDFToWordConverter"

const conversionTools = [
  {
    title: "PDF to Word",
    description: "Convert PDF to editable Word documents",
    icon: FileText,
    href: "/tools/pdf/convert/to-word",
    features: ["Preserve formatting", "Extract text", "Maintain tables", "Keep images"]
  },
  {
    title: "PDF to Excel",
    description: "Convert PDF to Excel spreadsheets",
    icon: FileSpreadsheet,
    href: "/tools/pdf/convert/to-excel",
    features: ["Extract tables", "Maintain data", "Format cells", "Multiple sheets"]
  },
  {
    title: "PDF to PowerPoint",
    description: "Convert PDF to PowerPoint presentations",
    icon: Presentation,
    href: "/tools/pdf/convert/to-powerpoint",
    features: ["One page per slide", "Keep formatting", "Preserve images", "Maintain layout"]
  },
  {
    title: "PDF to Images",
    description: "Convert PDF pages to high-quality images",
    icon: FileImage,
    href: "/tools/pdf/convert/to-image",
    features: ["High resolution", "Multiple formats", "Batch convert", "Custom DPI"]
  }
]

export default function PDFConvertPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Convert PDF to Any Format</h1>
          <p className="text-xl text-muted-foreground">
            Transform your PDFs into Word, Excel, PowerPoint, or Images with just a few clicks
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="word" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="word">PDF to Word</TabsTrigger>
              <TabsTrigger value="excel">PDF to Excel</TabsTrigger>
              <TabsTrigger value="powerpoint">PDF to PowerPoint</TabsTrigger>
              <TabsTrigger value="image">PDF to Images</TabsTrigger>
            </TabsList>

            <TabsContent value="word" className="mt-6">
              <PDFToWordConverter />
            </TabsContent>

            <TabsContent value="excel" className="mt-6">
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="powerpoint" className="mt-6">
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="image" className="mt-6">
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Fast Conversion</h3>
            <p className="text-muted-foreground">
              Convert your PDFs in seconds with our high-performance conversion engine
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your files are automatically deleted after 20 minutes. We never store your data
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">High Quality</h3>
            <p className="text-muted-foreground">
              Maintain formatting, images, and text quality in your converted documents
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
} 