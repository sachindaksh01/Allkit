'use client';

import { useState, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd/dist/hooks';
import type { DropTargetMonitor } from 'react-dnd';
import { PDFPage } from './PDFPage';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';
import { extractPages } from '@/utils/pdf';
import { Progress } from '@/components/ui/progress';

interface PDFFile {
  id: string;
  file: File;
  pages: { id: string; pageNumber: number; preview: string }[];
}

interface DropItem {
  files: File[];
}

const BLANK_PAGE_PREVIEW = '/blank-page.svg';

export function PDFOrganizer() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadWithProgress = (formData: FormData) => {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/pdf/organize-pdf');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        setUploadProgress(0);
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = () => {
        setUploadProgress(0);
        reject(xhr.statusText);
      };
      xhr.responseType = 'blob';
      xhr.send(formData);
    });
  };

  const downloadWithProgress = async (blob: Blob, filename: string) => {
    setDownloadProgress(100);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setTimeout(() => setDownloadProgress(0), 1000);
  };

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (newFiles.length === 0) return;

    for (const file of newFiles) {
      const fileId = Math.random().toString(36).substring(7);
      const pages = await extractPages(file);
      setPdfFiles(prev => [...prev, { id: fileId, file, pages }]);
    }
  }, []);

  const [{ isOver }, drop] = useDrop<DropItem, void, { isOver: boolean }>(() => ({
    accept: 'pdf',
    drop: (item: DropItem) => {
      handleDrop(item.files);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(dropRef);

  const movePage = (fromIndex: number, toIndex: number) => {
    setPdfFiles(prev => {
      const allPages = prev.flatMap(file =>
        file.pages.map(page => ({
          ...page,
          fileId: file.id,
          file,
        }))
      );

      const [movedPage] = allPages.splice(fromIndex, 1);
      allPages.splice(toIndex, 0, movedPage);

      const newFiles: PDFFile[] = [];
      for (const file of prev) {
        const pages = allPages.filter(p => p.fileId === file.id).map(({ fileId, file, ...rest }) => rest);
        if (pages.length > 0) {
          newFiles.push({ ...file, pages });
        }
      }
      return newFiles;
    });
  };

  const removePage = (fileId: string, pageId: string) => {
    setPdfFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? {
              ...file,
              pages: file.pages.filter(page => page.id !== pageId),
            }
          : file
      )
    );
  };

  const insertBlankPage = (fileId: string, afterPageId: string) => {
    setPdfFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? {
              ...file,
              pages: file.pages.reduce((acc, page) => {
                acc.push(page);
                if (page.id === afterPageId) {
                  acc.push({
                    id: Math.random().toString(36).substring(7),
                    pageNumber: page.pageNumber + 1,
                    preview: BLANK_PAGE_PREVIEW,
                  });
                }
                return acc;
              }, [] as typeof file.pages),
            }
          : file
      )
    );
  };

  const clearAll = () => {
    setPdfFiles([]);
  };

  const handleOrganize = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      const pageOrder = [];

      for (const file of pdfFiles) {
        formData.append('files', file.file);
        for (const page of file.pages) {
          pageOrder.push({
            fileName: file.file.name,
            pageNumber: page.pageNumber,
            isBlank: page.preview === BLANK_PAGE_PREVIEW,
          });
        }
      }

      formData.append('pageOrder', JSON.stringify(pageOrder));

      const blobData = await uploadWithProgress(formData);
      const blob = new Blob([blobData]);
      await downloadWithProgress(blob, 'organized.pdf');
    } catch (error) {
      console.error('Error organizing PDF:', error);
      // TODO: Show error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        ref={dropRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop PDF files here, or click to select files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleDrop(Array.from(e.target.files))}
        />
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <Progress value={uploadProgress} />
            <p className="text-xs mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {pdfFiles.length > 0 && (
        <>
          <div className="grid grid-cols-7 gap-4">
            {pdfFiles.map((file) =>
              file.pages.map((page, index) => (
                <PDFPage
                  key={page.id}
                  page={page}
                  index={index}
                  movePage={movePage}
                  removePage={() => removePage(file.id, page.id)}
                  insertBlankPage={() => insertBlankPage(file.id, page.id)}
                />
              ))
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearAll}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>

            <Button
              onClick={handleOrganize}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Organize & Download'}
            </Button>
          </div>
          {downloadProgress > 0 && downloadProgress < 100 && (
            <div className="mt-4">
              <Progress value={downloadProgress} />
              <p className="text-xs mt-1">Downloading... {downloadProgress}%</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 