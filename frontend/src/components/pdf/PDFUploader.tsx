'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PDFUploaderProps {
  onFilesUploaded: (files: File[]) => void;
}

export function PDFUploader({ onFilesUploaded }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are allowed');
    }
    
    if (pdfFiles.length > 0) {
      onFilesUploaded(pdfFiles);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <Upload className="w-12 h-12 text-gray-400" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop your PDF files here' : 'Drag & drop PDF files here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to select files
          </p>
        </div>
      </div>
    </div>
  );
} 