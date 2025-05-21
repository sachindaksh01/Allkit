"use client"

import { useRef, useState } from "react"
import JSZip from "jszip"
import { Upload } from "lucide-react"

const getMimeType = (format: string) => {
  switch (format) {
    case "webp": return "image/webp"
    case "png": return "image/png"
    case "jpeg": return "image/jpeg"
    default: return "image/png"
  }
}
const getFileExtension = (format: string) => {
  switch (format) {
    case "webp": return ".webp"
    case "png": return ".png"
    case "jpeg": return ".jpg"
    default: return ".png"
  }
}

interface FileItem {
  file: File
  id: string
  preview: string
}
interface ResultItem {
  id: string
  name: string
  blob: Blob
  url: string
}

export default function ImageConvertPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [results, setResults] = useState<ResultItem[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, any>>({})
  const [outputFormat, setOutputFormat] = useState("webp")
  const [quality, setQuality] = useState(80)
  const [scale, setScale] = useState(100)
  const [zipProgress, setZipProgress] = useState(0)
  const [showZipOverlay, setShowZipOverlay] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleFiles = (fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter(f => f.type.startsWith("image/"))
    const newFiles = arr.map(file => ({
      file,
      id: Math.random().toString(36).slice(2, 9),
      preview: URL.createObjectURL(file)
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id)
      if (f) URL.revokeObjectURL(f.preview)
      return prev.filter(x => x.id !== id)
    })
    setResults(prev => {
      const r = prev.find(x => x.id === id)
      if (r) URL.revokeObjectURL(r.url)
      return prev.filter(x => x.id !== id)
    })
  }

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview))
    results.forEach(r => URL.revokeObjectURL(r.url))
    setFiles([])
    setResults([])
  }

  const convertAll = async () => {
    const newProgress: Record<string, any> = {}
    files.forEach(f => {
      newProgress[f.id] = { id: f.id, status: 'converting', progress: 0 }
    })
    setProgressMap(newProgress)
    setResults([])
    await Promise.all(files.map(async ({ file, id }) => {
      try {
        setProgressMap(prev => ({ ...prev, [id]: { ...prev[id], status: 'converting', progress: 10 } }))
        const urlImg = URL.createObjectURL(file)
        const img = new window.Image()
        img.src = urlImg
        await img.decode()
        URL.revokeObjectURL(urlImg)
        setProgressMap(prev => ({ ...prev, [id]: { ...prev[id], status: 'converting', progress: 40 } }))
        const scaleVal = scale / 100
        const w = img.width * scaleVal
        const h = img.height * scaleVal
        let canvas: HTMLCanvasElement | OffscreenCanvas
        let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null
        if (typeof window.OffscreenCanvas !== "undefined") {
          canvas = new window.OffscreenCanvas(w, h)
          ctx = (canvas as OffscreenCanvas).getContext("2d")
        } else {
          const c = document.createElement("canvas")
          c.width = w
          c.height = h
          canvas = c
          ctx = c.getContext("2d")
        }
        if (!ctx) throw new Error("Canvas context not available")
        ctx.drawImage(img, 0, 0, w, h)
        setProgressMap(prev => ({ ...prev, [id]: { ...prev[id], status: 'converting', progress: 70 } }))
        const mimeType = getMimeType(outputFormat)
        const ext = getFileExtension(outputFormat)
        const name = file.name.replace(/\.[^/.]+$/, "") + ext
        const q = Math.max(0.05, Math.min(1, quality / 100))
        let blob: Blob
        if (typeof (canvas as any).convertToBlob === "function") {
          blob = await (canvas as any).convertToBlob({ type: mimeType, quality: q })
        } else {
          blob = await new Promise<Blob>((resolve, reject) => {
            (canvas as HTMLCanvasElement).toBlob((b) => {
              if (b) resolve(b)
              else reject(new Error("Failed to convert image"))
            }, mimeType, q)
          })
        }
        const url = URL.createObjectURL(blob)
        setResults(prev => [...prev, { id, name, blob, url }])
        setProgressMap(prev => ({ ...prev, [id]: { ...prev[id], status: 'done', progress: 100 } }))
      } catch (e: any) {
        setProgressMap(prev => ({ ...prev, [id]: { ...prev[id], status: 'error', progress: 100, error: e?.message || 'Error' } }))
      }
    }))
  }

  const downloadZip = async () => {
    setShowZipOverlay(true)
    setZipProgress(0)
    const zip = new JSZip()
    results.forEach(i => zip.file(i.name, i.blob))
    const content = await zip.generateAsync({ type: "blob" }, meta => {
      setZipProgress(Math.floor(meta.percent))
    })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(content)
    a.download = "converted_images.zip"
    a.click()
    setShowZipOverlay(false)
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <div className="w-full max-w-3xl mx-auto mt-12 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-2" style={{textShadow:'0 2px 16px #0008,0 1px 0 #fff2'}}>
            Image Converter
          </h1>
          <p className="text-lg text-center text-gray-300 mb-8">Convert between WebP, PNG, and JPEG formats with ease.</p>
          <div className="flex flex-col items-center">
            <div
              className={`w-full max-w-md border-2 border-dashed border-gray-400 rounded-xl bg-[#151823] flex flex-col items-center justify-center py-10 px-4 mb-8 transition-colors duration-200 cursor-pointer relative ${isDragActive ? 'border-cyan-400 bg-[#1a1e2a]' : 'hover:border-cyan-400'}`}
              style={{minHeight:120}}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                style={{height:'100%',width:'100%'}}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  if (e.target.files) handleFiles(e.target.files)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              />
              <Upload className="mx-auto mb-3 text-cyan-400" size={48} />
              <div className="font-semibold text-xl text-white mb-1">Drag & drop image files here</div>
              <div className="text-gray-400 text-sm">or click to select files</div>
            </div>
          </div>
          {/* Controls Row (Format, Quality, Scale) */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-gray-200">Output Format</label>
              <select
                className="w-full p-2 border border-gray-700 rounded-lg bg-[#23262F] text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition"
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value)}
              >
                <option value="webp">WebP</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-gray-200">Quality: <span className="text-cyan-400">{quality}%</span></label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 rounded-lg bg-gray-700"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-gray-200">Scale: <span className="text-cyan-400">{scale}%</span></label>
              <input
                type="range"
                min={10}
                max={100}
                step={10}
                value={scale}
                onChange={e => setScale(Number(e.target.value))}
                className="w-full accent-blue-400 h-2 rounded-lg bg-gray-700"
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              className="convert-btn px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:from-cyan-600 hover:to-blue-600 transition flex-1 text-lg"
              disabled={files.length === 0}
              onClick={convertAll}
            >
              Convert Images
            </button>
            <button
              className="clear-btn px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:from-red-600 hover:to-pink-600 transition flex-1 text-lg"
              disabled={files.length === 0 && results.length === 0}
              onClick={clearAll}
            >
              Clear All
            </button>
            <button
              className="download-btn px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition flex-1 text-lg"
              disabled={results.length === 0}
              onClick={downloadZip}
            >
              Download ZIP
            </button>
          </div>
          {/* Responsive, Compact Grid for Previews */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-10">
            {files.map(f => {
              const progress = progressMap[f.id]
              const result = results.find(r => r.id === f.id)
              return (
                <div key={f.id} className="preview-item bg-[#23262F] border border-gray-700 rounded-xl p-2 relative flex flex-col items-center shadow-md hover:shadow-cyan-700/20 transition-all">
                  <img
                    src={result ? result.url : f.preview}
                    alt={result ? result.name : f.file.name}
                    className="max-w-full max-h-20 rounded mb-1 object-contain"
                    style={{ aspectRatio: '1/1', width: '100%', background: '#20232a' }}
                  />
                  <div className="info text-center text-gray-300 text-xs mb-1">
                    {result ? (
                      <>
                        {result.name.length > 7 ? result.name.slice(0, 7) + '...' : result.name}<br />
                        {(result.blob.size / 1024).toFixed(1)} KB
                      </>
                    ) : (
                      <>
                        {f.file.name.length > 7 ? f.file.name.slice(0, 7) + '...' : f.file.name}<br />
                        {(f.file.size / 1024).toFixed(1)} KB
                      </>
                    )}
                  </div>
                  {progress?.status === 'converting' && (
                    <div className="w-full my-1">
                      <div className="h-1 bg-gray-700 rounded">
                        <div className="h-1 bg-cyan-400 rounded" style={{ width: `${progress.progress}%` }}></div>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 text-center">Converting... {progress.progress}%</div>
                    </div>
                  )}
                  {progress?.status === 'error' && (
                    <div className="text-[10px] text-red-400 mt-1">{progress.error}</div>
                  )}
                  {progress?.status === 'done' && result && (
                    <a
                      href={result.url}
                      download={result.name}
                      className="download-link px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded hover:from-green-600 hover:to-emerald-600 mt-1 text-xs font-semibold shadow"
                    >Download</a>
                  )}
                  <button
                    className="remove-btn absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    onClick={() => removeFile(f.id)}
                  >×</button>
                </div>
              )
            })}
          </div>
          {showZipOverlay && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-[#23262F] rounded-2xl p-8 shadow-2xl text-center w-full max-w-xs border border-cyan-400">
                <h2 className="text-lg font-semibold mb-4 text-cyan-300">Packaging images…</h2>
                <progress className="w-full" max={100} value={zipProgress}></progress>
                <div className="percent mt-2 text-cyan-400">{zipProgress}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 