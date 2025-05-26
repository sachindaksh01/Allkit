"use client";

import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

const units = ["px", "%", "cm", "inch"];
const formats = ["jpeg", "png", "webp"];

function getImageSize(file: File) {
  return new Promise<{width:number, height:number}>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageCompressorResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [unit, setUnit] = useState("px");
  const [dpi, setDpi] = useState<number>(72);
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState<{width: number, height: number} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
      const size = await getImageSize(file);
      setWidth(size.width);
      setHeight(size.height);
      setNaturalSize(size);
      setResultUrl("");
      setResultSize(null);
    }
  });

  const handleResizeCompress = async () => {
    if (!file || !width || !height) return;
    setIsProcessing(true);
    setResultUrl("");
    setResultSize(null);
    try {
      const img = new window.Image();
      img.src = preview;
      await img.decode();
      let w = width, h = height;
      if (unit === "%") {
        w = Math.round(img.width * (width / 100));
        h = Math.round(img.height * (height / 100));
      } else if (unit === "cm") {
        w = Math.round((width / 2.54) * dpi);
        h = Math.round((height / 2.54) * dpi);
      } else if (unit === "inch") {
        w = Math.round(width * dpi);
        h = Math.round(height * dpi);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(img, 0, 0, w, h);
      // Set DPI (for PNG/JPEG)
      if (format === "jpeg" || format === "png") {
        const d = dpi;
        const b64 = canvas.toDataURL(`image/${format}`, quality / 100);
        // Optionally, set DPI in metadata (advanced, not all browsers support)
        setResultUrl(b64);
        setResultSize(Math.round((b64.length * 3) / 4 / 1024));
      } else {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultSize(Math.round(blob.size / 1024));
          }
        }, `image/${format}`, quality / 100);
      }
      toast.success("Image processed successfully!");
    } catch (e) {
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `output.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const clearAll = () => {
    setFile(null);
    setPreview("");
    setWidth(null);
    setHeight(null);
    setResultUrl("");
    setResultSize(null);
  };

  // Convert width/height to px for preview
  let previewWidth = width;
  let previewHeight = height;
  if (unit === "%" && naturalSize) {
    previewWidth = Math.round(naturalSize.width * ((width ?? 100) / 100));
    previewHeight = Math.round(naturalSize.height * ((height ?? 100) / 100));
  } else if (unit === "cm") {
    previewWidth = Math.round(((width ?? 0) / 2.54) * dpi);
    previewHeight = Math.round(((height ?? 0) / 2.54) * dpi);
  } else if (unit === "inch") {
    previewWidth = Math.round((width ?? 0) * dpi);
    previewHeight = Math.round((height ?? 0) * dpi);
  }
  // Fallback to natural size if invalid
  if (!previewWidth || previewWidth <= 0 || !previewHeight || previewHeight <= 0) {
    previewWidth = naturalSize?.width ?? 200;
    previewHeight = naturalSize?.height ?? 200;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Compressor & Resizer</h1>
        {!file && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-lg">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop image here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">Supports PNG, JPG, JPEG, WEBP</p>
            </div>
          </div>
        )}
        {file && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <img src={preview} alt="Preview" style={{width: previewWidth, height: previewHeight, maxWidth: 400, maxHeight: 400, objectFit: 'contain'}} className="rounded-lg border" />
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
              <div className="flex flex-col items-center w-full md:w-1/2">
                <label className="text-xs mb-1">Width</label>
                <input type="number" value={width ?? ''} onChange={e => setWidth(Number(e.target.value))} className="w-full border rounded p-1" />
              </div>
              <div className="flex flex-col items-center w-full md:w-1/2">
                <label className="text-xs mb-1">Height</label>
                <input type="number" value={height ?? ''} onChange={e => setHeight(Number(e.target.value))} className="w-full border rounded p-1" />
              </div>
              <div className="flex flex-col items-center w-full md:w-1/2">
                <label className="text-xs mb-1">Unit</label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-center w-full md:w-1/2">
                <label className="text-xs mb-1">DPI</label>
                <input type="number" value={dpi} onChange={e => setDpi(Number(e.target.value))} className="w-full border rounded p-1" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center mt-4">
              <div className="flex flex-col items-center w-full md:w-1/2">
                <label className="text-xs mb-1">Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
                  <SelectContent>
                    {formats.map(f => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-center w-full md:w-1/2">
                <label className="text-xs mb-1">Quality</label>
                <Slider value={[quality]} min={1} max={100} step={1} onValueChange={([v]) => setQuality(v)} />
              </div>
            </div>
            <div className="flex gap-4 justify-center mt-4">
              <Button onClick={handleResizeCompress} disabled={isProcessing} className="flex items-center gap-2"><Download size={18}/>Convert & Download</Button>
              <Button variant="secondary" onClick={clearAll} className="flex items-center gap-2"><Trash2 size={18}/>Clear</Button>
            </div>
            {resultUrl && (
              <div className="mt-4 text-center">
                <img src={resultUrl} alt="Result Preview" className="rounded-lg max-w-[200px] max-h-[200px] border mx-auto object-contain" />
                <p className="text-xs text-gray-500 mt-2">Result size: {resultSize} KB</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 