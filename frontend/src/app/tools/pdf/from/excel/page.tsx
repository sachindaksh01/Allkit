'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Trash2, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL!;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const excelFile = acceptedFiles[0];
    setFile(excelFile);
    setPreview(URL.createObjectURL(excelFile));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File size must be less than 50MB');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Only .xls and .xlsx files are allowed');
      } else {
        toast.error('Error uploading file');
      }
    }
  });

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setPdfBlob(null);
    setPdfFileName("");
    toast.success('File removed');
  };

  const clearAll = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setPdfBlob(null);
    setPdfFileName("");
    setProgress(0);
    setIsConverting(false);
    toast.success('All files cleared');
  };

  const convertToPdf = async () => {
    if (!file) {
      toast.error('Please select an Excel file first');
      return;
    }
    setIsConverting(true);
    setProgress(0);
    setPdfBlob(null);
    setPdfFileName("");
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${apiBaseUrl}/api/pdf/from/excel/convert`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Conversion failed');
      const blob = await response.blob();
      setPdfBlob(blob);
      setPdfFileName(file.name.replace(/\.[^/.]+$/, '.pdf'));
      toast.success('PDF created successfully!');
    } catch (error) {
      toast.error('An error occurred during conversion');
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (pdfBlob && pdfFileName) {
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', pdfFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Convert Excel to PDF</h1>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg">
              {isDragActive
                ? 'Drop the Excel file here...'
                : 'Drag & drop Excel file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supports .xls and .xlsx files (max 50MB)
            </p>
          </div>
        </div>
        {file && (
          <div className="mt-8">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="text-green-500" size={24} />
                <span className="text-sm text-gray-600">{file.name}</span>
                <span className="text-xs text-gray-400">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={removeFile}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
                Remove
              </button>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={convertToPdf}
                disabled={isConverting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isConverting ? 'Converting...' : 'Convert to PDF'}
              </button>
              <button
                onClick={clearAll}
                disabled={isConverting || !file}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
              {pdfBlob && pdfFileName && !isConverting && (
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Download PDF
                </button>
              )}
            </div>
            {isConverting && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-center mt-2 text-sm text-gray-600">
                  Converting to PDF... {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 