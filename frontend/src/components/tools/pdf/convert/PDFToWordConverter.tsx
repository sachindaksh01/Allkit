"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { FileText, Upload, X, Download } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PDFToWordConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      setError(null)
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        setError('File size must be less than 50MB')
      } else if (error.code === 'file-invalid-type') {
        setError('Only PDF files are allowed')
      } else {
        setError('Error uploading file')
      }
    }
  })

  const handleConvert = async () => {
    if (!file) return

    setIsConverting(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('output_type', 'word')

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch('/api/pdf/convert', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Conversion failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.split('.')[0]}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setProgress(100)
      toast({
        title: "Success!",
        description: "Your PDF has been converted to Word successfully.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert file')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to convert file',
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setProgress(0)
    setError(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse (max 50MB)
          </p>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={isConverting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {(isConverting || progress > 0) && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  {progress === 100 ? "Downloading..." : "Converting..."}
                </p>
              </div>
            )}

            <Button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full"
              size="lg"
            >
              {isConverting ? (
                "Converting..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Convert to Word
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Your files are automatically deleted after 20 minutes</p>
        <p>We never store your files on our servers</p>
      </div>
    </div>
  )
} 