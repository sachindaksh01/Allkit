'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, Button, Progress, Alert } from '@/components/ui';
import { convertPdfToExcel, downloadFile } from '@/lib/api/pdf';

export default function PDFToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
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
        setError('File size exceeds 50MB limit');
      } else if (error.code === 'file-invalid-type') {
        setError('Please upload a PDF file');
      } else {
        setError('Error uploading file');
      }
    },
  });

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Convert file
      const response = await convertPdfToExcel(file);
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);

      // Download file
      downloadFile(response.data, response.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
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
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">PDF to Excel Converter</h1>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div>
                <p className="text-lg font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg">
                  {isDragActive
                    ? 'Drop the PDF file here'
                    : 'Drag and drop a PDF file here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum file size: 50MB
                </p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              {error}
            </Alert>
          )}

          {isConverting && (
            <div className="mt-4">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-gray-500 text-center">
                Converting... {progress}%
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            {file && (
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isConverting}
              >
                Clear
              </Button>
            )}
            <Button
              onClick={handleConvert}
              disabled={!file || isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert to Excel'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 