"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Upload, Download } from "lucide-react"
import JSZip from "jszip"
import axios from "axios"

const SUPPORTED_FORMATS = ["jpg", "png", "webp", "gif", "bmp", "tiff"]
const DEFAULT_QUALITY = 80

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([])
  const [outputFormat, setOutputFormat] = useState<string>("png")
  const [quality, setQuality] = useState<number>(DEFAULT_QUALITY)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff']
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles)
      setError(null)
    }
  })

  const handleConvert = async () => {
    if (files.length === 0) {
      setError("Please select at least one image")
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("output_format", outputFormat)
      formData.append("quality", quality.toString())

      const response = await axios.post("/api/convert", formData, {
        responseType: "blob"
      })

      const zip = new JSZip()
      const zipBlob = await zip.loadAsync(response.data)
      
      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = "converted_images.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setFiles([])
    } catch (err) {
      setError("Failed to convert images. Please try again.")
      console.error(err)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the files here..."
              : "Drag and drop images here, or click to select files"}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_FORMATS.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quality: {quality}%</label>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleConvert}
            disabled={isConverting || files.length === 0}
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Convert Images
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </Card>
    </div>
  )
}