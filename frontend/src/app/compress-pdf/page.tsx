'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import JSZip from 'jszip';

type CompressionPreset = 'extreme' | 'recommended' | 'less';

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState<CompressionPreset>('recommended');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [originalSizes, setOriginalSizes] = useState<number[]>([]);
  const [compressedSizes, setCompressedSizes] = useState<number[]>([]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are allowed');
    }
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      setOriginalSizes(prev => [...prev, ...pdfFiles.map(f => f.size)]);
      setCompressedSizes([]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setOriginalSizes(prev => prev.filter((_, i) => i !== index));
    setCompressedSizes(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setOriginalSizes([]);
    setCompressedSizes([]);
    setProgress(0);
    setIsCompressing(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 20,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsCompressing(true);
    setProgress(0);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('preset', preset);
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tools/pdf/compress-pdf`, {
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      if (!response.ok) {
        throw new Error('Compression failed');
      }
      const blob = await response.blob();
      setProgress(100);
      // Download ZIP
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_pdfs.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`PDFs compressed successfully! Downloaded as ZIP.`);
    } catch (error) {
      toast.error('Failed to compress PDF(s). Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Compress PDF</h1>
          <p className="text-muted-foreground">
            Reduce PDF file size while maintaining quality
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your files are processed locally and automatically deleted after 20 minutes.
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b py-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeFile(idx)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-lg">Drag & drop your PDF(s) here, or click to select</p>
                <p className="text-sm text-gray-500">Maximum file size: 100MB each</p>
              </div>
            )}
          </div>
        </Card>

        {files.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Compression Level</h2>
            <RadioGroup
              value={preset}
              onValueChange={(value) => setPreset(value as CompressionPreset)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="extreme" id="extreme" />
                <Label htmlFor="extreme" className="flex-1">
                  <div>
                    <p className="font-medium">Extreme Compression</p>
                    <p className="text-sm text-gray-500">Maximum file size reduction, lower quality</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recommended" id="recommended" />
                <Label htmlFor="recommended" className="flex-1">
                  <div>
                    <p className="font-medium">Recommended Compression</p>
                    <p className="text-sm text-gray-500">Balanced quality and file size</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="less" id="less" />
                <Label htmlFor="less" className="flex-1">
                  <div>
                    <p className="font-medium">Less Compression</p>
                    <p className="text-sm text-gray-500">Higher quality, minimal size reduction</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>
        )}

        {isCompressing && (
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compressing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </Card>
        )}

        {compressedSizes.length > 0 && (
          <Card className="p-6">
            <div className="space-y-2">
              <h3 className="font-medium">Compression Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {files.map((file, idx) => (
                  <div key={idx}>
                    <p className="text-muted-foreground">Original Size</p>
                    <p className="font-medium">{formatFileSize(originalSizes[idx])}</p>
                  </div>
                ))}
                {compressedSizes.map((size, idx) => (
                  <div key={idx}>
                    <p className="text-muted-foreground">Compressed Size</p>
                    <p className="font-medium">{formatFileSize(size)}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Reduced by {((originalSizes[0] - compressedSizes[0]) / originalSizes[0] * 100).toFixed(1)}%
              </p>
            </div>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCompress}
            disabled={files.length === 0 || isCompressing}
          >
            {isCompressing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compressing...
              </>
            ) : (
              'Compress PDF(s)'
            )}
          </Button>
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={clearAll}
            disabled={isCompressing && files.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
} 