'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { X, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Add security measures
const preventDevTools = () => {
  if (process.env.NODE_ENV === 'production') {
    // Disable right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        toast.error('This action is not allowed');
        return false;
      }
      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        toast.error('This action is not allowed');
        return false;
      }
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        toast.error('This action is not allowed');
        return false;
      }
    });

    // Detect DevTools opening
    let devToolsOpen = false;
    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          toast.error('Developer tools are not allowed');
          // You can add additional actions here
        }
      } else {
        devToolsOpen = false;
      }
    };
    window.addEventListener('resize', checkDevTools);
  }
};

interface ImageFile {
  file: File;
  preview: string;
}

export default function ImageToPdfPage() {
  useEffect(() => {
    preventDevTools();
  }, []);

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles
      .filter(file => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
    
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
    setPdfBlob(null);
    setPdfFileName("");
    toast.success('Image removed');
  };

  const clearAllImages = () => {
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    setPdfBlob(null);
    setPdfFileName("");
    toast.success('All images cleared');
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast.error('Please add some images first');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setPdfBlob(null);
    setPdfFileName("");

    try {
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageBytes = await image.file.arrayBuffer();
        let pdfImage;
        if (image.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        }
        const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfImage.width,
          height: pdfImage.height,
        });
        setProgress(((i + 1) / images.length) * 100);
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfBlob(blob);
      setPdfFileName('images-to-pdf.pdf');
      toast.success('PDF created successfully!');
    } catch (error) {
      console.error('Error converting to PDF:', error);
      toast.error('Failed to create PDF. Please try again.');
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
        <h1 className="text-3xl font-bold mb-8 text-center">Convert Images to PDF</h1>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-lg">
              {isDragActive
                ? 'Drop the images here...'
                : 'Drag & drop images here, or click to select files'}
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, JPEG, and PNG files
            </p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="flex flex-col items-center bg-gray-50 rounded-lg p-4 relative shadow">
                  <img src={image.preview} alt={image.file.name} className="w-full h-32 object-contain rounded mb-2" />
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-gray-700 font-medium">{image.file.name}</span>
                    <span className="text-xs text-gray-400">{(image.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
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
                onClick={clearAllImages}
                disabled={isConverting || images.length === 0}
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