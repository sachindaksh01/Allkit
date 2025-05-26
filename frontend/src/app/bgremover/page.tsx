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

export default function BackgroundRemover() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff")
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertedImages, setConvertedImages] = useState<{ url: string; name: string }[]>([])
  const [zipUrl, setZipUrl] = useState<string>("")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

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
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
      setFiles(prev => [...prev, ...newFiles])
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
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
    if (files.length === 0) return

    setIsProcessing(true)
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    if (showColorPicker) {
      formData.append('background_color', backgroundColor)
    } else {
      formData.append('background_color', 'transparent')
    }
    formData.append('format', 'png')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tools/image/bgremover/remove-background`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to remove background')

      const blob = await response.blob()
      const zip = await JSZip.loadAsync(blob)
      
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
      setZipUrl(URL.createObjectURL(blob))
    } catch (error) {
      console.error('Error:', error)
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
    <div className="min-h-screen bg-[#10131a] text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <div className="w-full max-w-3xl mx-auto mt-12 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-2" style={{textShadow:'0 2px 16px #0008,0 1px 0 #fff2'}}>
            Background Remover
          </h1>
          <p className="text-lg text-center text-gray-300 mb-8">Remove backgrounds from your images with AI. Upload multiple images and download them as transparent PNGs.</p>
          <div className="flex flex-col items-center">
            <div
              {...getRootProps()}
              className={`w-full max-w-md border-2 border-dashed border-gray-400 rounded-xl bg-[#151823] flex flex-col items-center justify-center py-10 px-4 mb-8 transition-colors duration-200 cursor-pointer relative ${isDragActive ? 'border-cyan-400 bg-[#1a1e2a]' : 'hover:border-cyan-400'}`}
              style={{minHeight:120}}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-3 text-cyan-400" size={48} />
              <div className="font-semibold text-xl text-white mb-1">Drag & drop image files here</div>
              <div className="text-gray-400 text-sm">or click to select files</div>
            </div>
          </div>
          {files.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex items-center gap-2 border-gray-700 bg-[#23262F] text-white hover:border-cyan-400"
                  >
                    <Palette className="h-4 w-4" />
                    {showColorPicker ? 'Hide Color Picker' : 'Add Background Color'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearAll}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0"
                  >
                    Clear All
                  </Button>
                </div>
                <Button
                  onClick={handleBackgroundRemoval}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-600 border-0"
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
                <div className="mb-4 flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-200">Background Color:</label>
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-24 h-10 p-1 border-0 bg-[#23262F]"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group aspect-square bg-[#23262F] border border-gray-700 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-cyan-700/20 transition-all p-2">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-lg mb-1"
                      style={{ aspectRatio: '1/1', background: '#20232a', maxHeight: 90 }}
                    />
                    <div className="info text-center text-gray-300 text-xs mb-1">
                      {file.name.length > 5 ? file.name.slice(0, 5) + '...' : file.name}<br />
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-80 hover:bg-red-600 hover:opacity-100 transition-opacity text-xs w-5 h-5 flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {convertedImages.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Processed Images</h3>
                <Button
                  onClick={handleDownloadZip}
                  disabled={downloadProgress > 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-600 border-0"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {convertedImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square bg-[#23262F] border border-gray-700 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-cyan-700/20 transition-all p-2">
                    <div className="w-full h-full rounded-lg bg-[url('/checkered.png')] bg-repeat">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-contain"
                        style={{ maxHeight: 90 }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <button
                        onClick={() => handleDownloadImage(image.url, image.name)}
                        className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeConvertedImage(index)}
                        className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="info text-center text-gray-300 text-xs mb-1">
                      {image.name.length > 5 ? image.name.slice(0, 5) + '...' : image.name}<br />
                      {/* size not available for processed images, so just show name */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 