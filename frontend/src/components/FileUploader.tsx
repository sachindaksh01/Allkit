'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export function FileUploader({ accept, maxSize, onFileSelect, file }: FileUploaderProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onFileSelect(file);
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-600">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <FileText className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a file here, or click to select'}
            </p>
            {accept && (
              <p className="text-xs text-gray-500">
                Accepted format: {accept.replace('.', '')}
              </p>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 