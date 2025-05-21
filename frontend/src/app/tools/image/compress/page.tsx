"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload, Download } from "lucide-react";
import JSZip from "jszip";
import axios from "axios";

export default function ImageCompressPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff']
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setError(null);
    }
  });

  const handleCompress = async () => {
    if (files.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsCompressing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("quality", quality.toString());

      const response = await axios.post("/api/image/compress", formData, {
        responseType: "blob"
      });

      // Download ZIP
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "compressed_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFiles([]);
    } catch (err) {
      setError("Failed to compress images. Please try again.");
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
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
            onClick={handleCompress}
            disabled={isCompressing || files.length === 0}
          >
            {isCompressing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Compress Images
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </Card>
    </div>
  );
} 