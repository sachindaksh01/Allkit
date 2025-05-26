'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Trash2, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';

// Security measures
const preventDevTools = () => {
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        toast.error('This action is not allowed');
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        toast.error('This action is not allowed');
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        toast.error('This action is not allowed');
        return false;
      }
    });
  }
};

interface WordFile {
  file: File;
  preview: string;
}

export default function WordToPdfPage() {
  useEffect(() => {
    preventDevTools();
  }, []);

  const [files, setFiles] = useState<WordFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL!;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-Word files
    const wordFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.doc') || file.name.endsWith('.docx')
    );

    if (wordFiles.length !== acceptedFiles.length) {
      toast.error('Some files were skipped. Only .doc and .docx files are supported.');
    }

    if (wordFiles.length > 0) {
      const newFiles = wordFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB per file
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File size must be less than 50MB');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Only .doc and .docx files are allowed');
      } else {
        toast.error('Error uploading file');
      }
    }
  });

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error('Please add a Word file first');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setPdfBlob(null);
    setPdfFileName("");

    try {
      const formData = new FormData();
      formData.append('file', files[0].file);

      const response = await axios.post(`${apiBaseUrl}/api/pdf/from/word/convert`, formData, {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        },
        timeout: 300000 // 5 minutes timeout
      });

      // Store the PDF blob and filename in state
      setPdfBlob(new Blob([response.data], { type: 'application/pdf' }));
      setPdfFileName(files[0].file.name.replace(/\.[^/.]+$/, '.pdf'));

      toast.success('PDF created successfully!');
    } catch (error: any) {
      console.error('Error converting to PDF:', error);
      if (error.response?.status === 413) {
        toast.error('Files are too large. Please reduce the file size or upload fewer files.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again with fewer files.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to create PDF. Please try again.');
      }
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

  const clearAllFiles = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setProgress(0);
    setIsConverting(false);
    setPdfBlob(null);
    setPdfFileName("");
    toast.success('All files cleared');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Convert Word to PDF</h1>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg">
              {isDragActive
                ? 'Drop the Word files here...'
                : 'Drag & drop Word files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supports .doc and .docx files (max 50MB per file)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={24} />
                    <span className="text-sm text-gray-600">{file.file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                    Remove
                  </button>
                </div>
              ))}
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
                onClick={clearAllFiles}
                disabled={isConverting || files.length === 0}
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