'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { FileUp, Download, FileImage, FileText, FileSpreadsheet, Presentation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Accept } from 'react-dropzone';

type ConversionType = 'image' | 'word' | 'powerpoint' | 'excel';

const conversionTypes: {
  type: ConversionType;
  label: string;
  icon: any;
  accept: Accept;
}[] = [
  {
    type: 'image',
    label: 'Image to PDF',
    icon: FileImage,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    }
  },
  {
    type: 'word',
    label: 'Word to PDF',
    icon: FileText,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.oasis.opendocument.text': ['.odt']
    }
  },
  {
    type: 'powerpoint',
    label: 'PowerPoint to PDF',
    icon: Presentation,
    accept: {
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    }
  },
  {
    type: 'excel',
    label: 'Excel to PDF',
    icon: FileSpreadsheet,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods']
    }
  }
];

export default function AnyToPDF() {
  const [selectedType, setSelectedType] = useState<ConversionType | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => file.size <= 50 * 1024 * 1024);
    if (validFiles.length !== acceptedFiles.length) {
      toast.error('Some files exceeded 50MB and were skipped.');
    }
    setFiles(validFiles);

    if (selectedType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(validFiles[0]);
    } else {
      setPreview(null);
    }
  }, [selectedType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedType ? (conversionTypes.find(t => t.type === selectedType)?.accept as Accept) : undefined,
    maxFiles: 20,
    multiple: true,
    disabled: !selectedType
  });

  const handleConvert = async () => {
    if (!files.length || !selectedType) return;
    setIsConverting(true);
    setProgress(0);
    setDownloadProgress(0);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('type', selectedType);
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      const response = await fetch('/api/convert-to-pdf', {
        method: 'POST',
        body: formData
      });
      clearInterval(progressInterval);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Conversion failed');
      }
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const total = parseInt(contentLength, 10);
        const reader = response.body?.getReader();
        let received = 0;
        let chunks = [];
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          setDownloadProgress(Math.round((received / total) * 100));
        }
        const blob = new Blob(chunks, { type: contentType || 'application/octet-stream' });
        if (contentType && contentType.includes('application/zip')) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'converted_pdfs.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('All files converted and downloaded as ZIP!');
        } else if (contentType && contentType.includes('application/pdf')) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${files[0].name.split('.')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('File converted successfully!');
        }
      } else {
        if (contentType && contentType.includes('application/zip')) {
          const zipBlob = await response.blob();
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'converted_pdfs.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('All files converted and downloaded as ZIP!');
        } else if (contentType && contentType.includes('application/pdf')) {
          const pdfBlob = await response.blob();
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${files[0].name.split('.')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('File converted successfully!');
        }
      }
      setProgress(100);
      setDownloadProgress(100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to convert file');
    } finally {
      setIsConverting(false);
      setProgress(0);
      setDownloadProgress(0);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setPreview(null);
    setSelectedType(null);
    setProgress(0);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Convert to PDF</h1>
        <p className="text-muted-foreground text-lg">
          Convert your files to PDF format with just a few clicks
        </p>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select Conversion Type</h2>
          <RadioGroup
            value={selectedType || ''}
            onValueChange={(value) => {
              setSelectedType(value as ConversionType);
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {conversionTypes.map(({ type, label, icon: Icon }) => (
              <div key={type}>
                <RadioGroupItem
                  value={type}
                  id={type}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type}
                  className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-accent transition-colors"
                >
                  <Icon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {selectedType && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload File</h2>
              {files.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  disabled={isConverting}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {!files.length ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Drag & drop your files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 50MB
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {preview && (
                  <div className="flex justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 rounded-lg shadow-sm"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div key={file.name + idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const Icon = conversionTypes.find(t => t.type === selectedType)?.icon;
                          return Icon ? <Icon className="h-5 w-5 text-primary" /> : null;
                        })()}
                        <span className="font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {(isConverting || progress > 0 || downloadProgress > 0) && (
                  <div className="space-y-2 mb-4">
                    <Progress value={downloadProgress > 0 ? downloadProgress : progress} />
                    <p className="text-sm text-muted-foreground text-center font-semibold">
                      {downloadProgress > 0
                        ? `Downloading... ${downloadProgress}%`
                        : `Processing... ${progress}%`}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full"
                  size="lg"
                >
                  {isConverting ? (
                    <>Converting...</>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Convert to PDF
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 