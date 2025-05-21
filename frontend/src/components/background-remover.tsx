"use client"

import { useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Download, X, Palette } from "lucide-react"
import axios from "axios"
import JSZip from "jszip"

interface FileWithPreview extends File {
  preview: string
}

export function BackgroundRemover() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff")
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertedImages, setConvertedImages] = useState<{ url: string; name: string }[]>([])
  const [zipUrl, setZipUrl] = useState<string>("")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          const newFile = Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
          setFiles(prev => [...prev, newFile])
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
      setFiles(prev => [...prev, ...newFiles])
      setError(null)
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

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview))
    setFiles([])
    convertedImages.forEach(image => URL.revokeObjectURL(image.url))
    setConvertedImages([])
    if (zipUrl) {
      URL.revokeObjectURL(zipUrl)
      setZipUrl("")
    }
    setShowColorPicker(false)
    setBackgroundColor("#ffffff")
    setDownloadProgress(0)
    setError(null)
  }

  const removeConvertedImage = (index: number) => {
    setConvertedImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].url)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleBackgroundRemoval = async () => {
    if (files.length === 0) {
      setError("Please select at least one image")
      return
    }

    setIsProcessing(true)
    setError(null)
    setDownloadProgress(0)

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      if (showColorPicker) {
        formData.append('bg_color', backgroundColor)
      } else {
        formData.append('bg_color', 'transparent')
      }

      const response = await axios.post("/api/remove-background", formData, {
        responseType: "blob",
        headers: {
          'Accept': 'application/zip'
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setDownloadProgress(percentCompleted)
        }
      })

      if (response.data.type === 'application/json') {
        const errorText = await response.data.text()
        throw new Error(errorText || 'Background removal failed')
      }

      const zip = await JSZip.loadAsync(response.data)
      const newImages: { url: string; name: string }[] = []
      
      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const blob = await file.async('blob')
          const url = URL.createObjectURL(blob)
          const pngFilename = filename.replace(/\.[^/.]+$/, '.png')
          newImages.push({ url, name: pngFilename })
        }
      }
      
      setConvertedImages(newImages)
      setZipUrl(URL.createObjectURL(response.data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove background')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadZip = async () => {
    if (!zipUrl) return

    setDownloadProgress(0)
    const response = await fetch(zipUrl)
    const reader = response.body?.getReader()
    const contentLength = Number(response.headers.get('Content-Length'))

    if (!reader) return

    let receivedLength = 0
    const chunks = []

    while(true) {
      const {done, value} = await reader.read()
      
      if (done) break
      
      chunks.push(value)
      receivedLength += value.length
      setDownloadProgress(Math.round((receivedLength / contentLength) * 100))
    }

    const blob = new Blob(chunks)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transparent-images.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setDownloadProgress(0)
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
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
              ? "Drop the images here..."
              : "Drag and drop images here, or click to select files. You can also paste (Ctrl+V) images from your clipboard."}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  {showColorPicker ? 'Hide Color Picker' : 'Add Background Color'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAll}
                >
                  Clear All
                </Button>
              </div>
              <Button
                onClick={handleBackgroundRemoval}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Remove Backgrounds'
                )}
              </Button>
            </div>

            {showColorPicker && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Background Color:</label>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-24 h-10 p-1"
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {convertedImages.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Processed Images</h3>
              <Button
                onClick={handleDownloadZip}
                disabled={downloadProgress > 0}
                className="flex items-center gap-2"
              >
                {downloadProgress > 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {downloadProgress}%
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download All (ZIP)
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {convertedImages.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <div className="w-full h-full rounded-lg bg-[url('/checkered.png')] bg-repeat">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <button
                      onClick={() => handleDownloadImage(image.url, image.name)}
                      className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeConvertedImage(index)}
                      className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 