'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { FileUp, Loader2 } from 'lucide-react';

export function PDFToExcelConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError(null);
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setError('File size must be less than 50MB');
      } else if (error.code === 'file-invalid-type') {
        setError('Only PDF files are allowed');
      } else {
        setError('Error uploading file');
      }
    }
  });

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/pdf/convert/to-excel', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.xlsx');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress(100);
      toast.success('PDF converted to Excel successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert PDF');
      toast.error('Failed to convert PDF to Excel');
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setProgress(0);
    setError(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>PDF to Excel Converter</CardTitle>
        <CardDescription>
          Convert your PDF files to Excel format with ease. Upload your PDF file and get an Excel file in return.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <FileUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-muted-foreground">Drop the PDF file here</p>
          ) : (
            <p className="text-muted-foreground">
              Drag and drop a PDF file here, or click to select a file
            </p>
          )}
        </div>

        {file && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isConverting && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Converting... {progress}%
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleConvert}
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert to Excel'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 