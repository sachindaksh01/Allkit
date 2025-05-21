'use client';

import { useState } from 'react';
import { FileText, Image, FileSpreadsheet, Presentation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileUploader } from '@/components/FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const outputTypes = [
  {
    name: 'PDF to Image',
    value: 'image',
    icon: Image,
    color: 'text-blue-500'
  },
  {
    name: 'PDF to Word',
    value: 'word',
    icon: FileText,
    color: 'text-green-500'
  },
  {
    name: 'PDF to Excel',
    value: 'excel',
    icon: FileSpreadsheet,
    color: 'text-yellow-500'
  },
  {
    name: 'PDF to PowerPoint',
    value: 'powerpoint',
    icon: Presentation,
    color: 'text-red-500'
  }
];

export default function PDFToAnyPage() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!file || !selectedType) {
      toast({
        title: 'Error',
        description: 'Please select both a PDF file and output type',
        variant: 'destructive'
      });
      return;
    }

    setIsConverting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_type', selectedType);

    try {
      const response = await fetch('/api/pdf/pdf-to-any', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-${file.name.split('.')[0]}.${selectedType === 'image' ? 'zip' : selectedType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Your file has been converted successfully!'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center mb-8 text-center">
        <FileText className="h-12 w-12 text-blue-500 mb-2" />
        <h1 className="text-3xl font-bold mb-2">PDF to Any</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Convert your PDF files into Image, Word, Excel, or PowerPoint formats with just a few clicks.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Output Type</CardTitle>
            <CardDescription>Choose the format you want to convert your PDF to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {outputTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => setSelectedType(type.value)}
                >
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                  <span className="font-medium">{type.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedType && (
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>Drag and drop your PDF file here or click to browse</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                accept="application/pdf"
                maxSize={50 * 1024 * 1024} // 50MB
                onFileSelect={setFile}
                file={file}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleConvert}
            disabled={!file || !selectedType || isConverting}
            className="w-full md:w-auto"
          >
            {isConverting ? 'Converting...' : 'Convert Now'}
          </Button>
        </div>
      </div>
    </div>
  );
} 