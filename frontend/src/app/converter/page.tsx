"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Upload, X, Download, Loader2, FileDown } from "lucide-react"
import JSZip from "jszip"

const imageFormats = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF" },
]

interface FileWithPreview extends File {
  preview: string
}

interface ConvertedImage {
  url: string
  name: string
}

export default function ImageConverterPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [targetFormat, setTargetFormat] = useState("png")
  const [quality, setQuality] = useState(85)
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [zipUrl, setZipUrl] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    )
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('format', targetFormat)
      formData.append('quality', quality.toString())

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/convert`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to convert images')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setZipUrl(url)

      // Create individual image URLs
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(blob)
      
      const newConvertedImages: ConvertedImage[] = []
      for (const [filename, file] of Object.entries(zipContent.files)) {
        if (!file.dir) {
          const imageBlob = await file.async('blob')
          const imageUrl = URL.createObjectURL(imageBlob)
          newConvertedImages.push({
            url: imageUrl,
            name: filename
          })
        }
      }
      setConvertedImages(newConvertedImages)
    } catch (error) {
      console.error('Error converting images:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadZip = () => {
    if (!zipUrl) return

    const link = document.createElement('a')
    link.href = zipUrl
    link.download = 'converted_images.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadImage = (image: ConvertedImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Image Converter</CardTitle>
          <CardDescription>
            Convert multiple images to different formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-gray-500">
                Drag and drop images here, or click to select
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Format</label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
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

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      'Convert'
                    )}
                  </Button>
                  {zipUrl && (
                    <Button
                      onClick={handleDownloadZip}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All (ZIP)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {convertedImages.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Converted Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {convertedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDownloadImage(image)}
                      className="absolute top-2 right-2 p-1 bg-primary text-white rounded-full hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 