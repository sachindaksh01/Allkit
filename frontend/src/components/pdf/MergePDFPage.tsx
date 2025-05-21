"use client";

import { useState, useEffect } from 'react';
import { PDFUploader } from '@/components/pdf/PDFUploader';
import { PDFPreview } from '@/components/pdf/PDFPreview';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [rotations, setRotations] = useState<number[]>([]);
  const { theme } = useTheme();

  // Initialize PDF.js worker
  useEffect(() => {
    GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
  }, []);

  const handleFilesUploaded = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setRotations(prev => [...prev, ...new Array(newFiles.length).fill(0)]);
  };

  const handleReorder = (reorderedFiles: File[]) => {
    setFiles(reorderedFiles);
  };

  const handleRotation = (index: number, rotation: number) => {
    setRotations(prev => {
      const newRotations = [...prev];
      newRotations[index] = rotation;
      return newRotations;
    });
  };

  const handleClear = () => {
    setFiles([]);
    setRotations([]);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge');
      return;
    }

    // Validate files before merging
    const invalidFiles = files.filter(f => {
      if (!f || f.size === 0) return true;
      if (f.type !== 'application/pdf') return true;
      return false;
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files detected: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);
    const formData = new FormData();
    
    // Add files and their rotations to formData
    files.forEach((file, index) => {
      formData.append('files', file);
      formData.append('rotations', rotations[index].toString());
    });

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 90) progress = 90;
      setMergeProgress(progress);
    }, 300);

    try {
      const response = await fetch('/api/merge-pdf', {
        method: 'POST',
        body: formData,
      });

      console.log('Merge response status:', response.status);
      console.log('Merge response headers:', Array.from(response.headers.entries()));

      clearInterval(progressInterval);
      setMergeProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Merge error response:', errorData);
        throw new Error(errorData?.message || `Failed to merge PDFs: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      console.log('Blob type:', blob.type, 'Blob size:', blob.size);

      if (blob.type !== 'application/pdf' || blob.size < 100) {
        console.error('Invalid blob received:', blob);
        toast.error('Server did not return a valid PDF. Please try again.');
        return;
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force click the link
      link.click();
      console.log('Download link clicked');

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('PDFs merged successfully!');
        handleClear();
      }, 800);
    } catch (error) {
      clearInterval(progressInterval);
      setMergeProgress(0);
      console.error('Merge error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to merge PDFs. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsMerging(false);
      setTimeout(() => setMergeProgress(0), 1000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Merge PDF Files</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Combine multiple PDF files into a single document. Drag and drop your files or click to upload.
        </p>
      </div>
      
      <div className="space-y-8">
        <PDFUploader onFilesUploaded={handleFilesUploaded} />
        
        {files.length > 0 && (
          <>
            <PDFPreview 
              files={files} 
              onReorder={handleReorder} 
              onClear={handleClear}
              onRotation={handleRotation}
              rotations={rotations}
            />
            
            <div className="flex justify-center flex-col items-center gap-4">
              <Button
                onClick={handleMerge}
                disabled={isMerging || files.length < 2}
                className={`
                  px-8 py-6 text-lg font-semibold
                  ${theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-lg hover:shadow-xl
                `}
              >
                {isMerging ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  'Merge PDFs'
                )}
              </Button>
              
              {isMerging && (
                <div className="w-full max-w-md">
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-200"
                      style={{ width: `${mergeProgress}%` }}
                    />
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {mergeProgress.toFixed(0)}% Complete
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 