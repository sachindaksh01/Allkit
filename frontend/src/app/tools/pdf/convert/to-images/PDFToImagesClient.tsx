"use client";

import React, { useRef, useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { Upload, FileText, X, Loader2 } from "lucide-react";

export default function PDFToImagesClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
  }, []);

  async function handlePDFtoImages(file: File) {
    setLoading(true);
    setProgress(0);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context!, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/png")
        );
        if (blob) {
          zip.file(`page-${i}.png`, blob);
        }
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
        setProgress(Math.round(metadata.percent));
      });
      saveAs(zipBlob, file.name.replace(/\.pdf$/i, "") + "-images.zip");
    } catch (e: any) {
      setError("Failed to convert PDF. Please try another file.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  }

  function handleDownload() {
    if (pdfFile) {
      handlePDFtoImages(pdfFile);
    }
  }

  function handleRemove() {
    setPdfFile(null);
    setError(null);
    setProgress(0);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">PDF to Images Converter</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Convert every page of your PDF into high-quality images. Drag and drop your PDF or click to upload.
        </p>
      </div>
      <div className="space-y-8">
        {/* Drag & Drop Upload Box */}
        {!pdfFile && (
          <div
            className={
              `border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out ` +
              `border-gray-300 hover:border-blue-400 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950`
            }
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={inputRef}
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag & drop your PDF here</p>
                <p className="text-sm text-gray-500">or click to select file</p>
              </div>
            </div>
          </div>
        )}
        {/* File Preview Card */}
        {pdfFile && (
          <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border-2 border-gray-200 dark:border-zinc-700 p-6 relative">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <FileText className="w-12 h-12 text-blue-500" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900 dark:text-white text-lg">{pdfFile.name}</span>
                <span className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
              onClick={handleRemove}
              title="Remove file"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        {/* Error Message */}
        {error && <div className="text-red-500 text-center mb-2 font-medium">{error}</div>}
        {/* Progress Bar */}
        {loading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs mt-2 text-blue-600">
              <Loader2 className="animate-spin w-4 h-4" /> Processing... {progress}%
            </div>
          </div>
        )}
        {/* Download Button */}
        <button
          className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold mt-2 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          onClick={handleDownload}
          disabled={!pdfFile || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5" /> Processing...</span>
          ) : (
            "Download Images as ZIP"
          )}
        </button>
      </div>
    </div>
  );
} 