"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { FileUp, SplitSquareHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// IMPORTANT: Place pdf.worker.min.js in your public/ directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Helper to get a page preview thumbnail (move to top-level)
async function getPageThumbnail(pageNum: number, file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context!, viewport }).promise;
    return canvas.toDataURL();
  } catch (err) {
    console.error('Thumbnail generation failed for page', pageNum, err);
    return null;
  }
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [ranges, setRanges] = useState<{ from: number; to: number }[]>([{ from: 1, to: 1 }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previews, setPreviews] = useState<{ pageNumber: number; thumbnail: string }[]>([]);
  const [splitMode, setSplitMode] = useState<'range' | 'pages' | 'size'>('range');
  const [pageMode, setPageMode] = useState<'all' | 'parts'>('all');
  const [numParts, setNumParts] = useState<number>(2);
  const [maxSize, setMaxSize] = useState<number>(100);
  const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('MB');
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      return;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast.error('File size must be less than 100MB');
      return;
    }
    setIsLoading(true);
    setFile(file);
    setPreviewError(null);
    try {
      // Load PDF and get total pages
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      setTotalPages(pages);
      setRanges([{ from: 1, to: pages }]);
      // Generate previews
      try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const previews: { pageNumber: number; thumbnail: string }[] = [];
        for (let i = 1; i <= Math.min(pages, 5); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({
            canvasContext: context!,
            viewport: viewport
          }).promise;
          previews.push({
            pageNumber: i,
            thumbnail: canvas.toDataURL()
          });
        }
        setPreviews(previews);
      } catch (previewErr) {
        setPreviewError('Preview generation failed, but you can still split the PDF.');
        setPreviews([]);
        console.error('Preview error:', previewErr);
      }
    } catch (error) {
      toast.error('Failed to load PDF');
      setFile(null); // Only reset for unrecoverable errors
      console.error('PDF load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const addRange = () => {
    if (ranges.length === 0) {
      setRanges([{ from: 1, to: totalPages }]);
    } else {
      const lastRange = ranges[ranges.length - 1];
      const newFrom = lastRange.to + 1;
      if (newFrom <= totalPages) {
        setRanges([...ranges, { from: newFrom, to: totalPages }]);
      }
    }
  };

  const removeRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index: number, field: 'from' | 'to', value: number) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;
    for (let i = index + 1; i < newRanges.length; i++) {
      const prevRange = newRanges[i - 1];
      newRanges[i].from = prevRange.to + 1;
      if (newRanges[i].to < newRanges[i].from) {
        newRanges[i].to = totalPages;
      }
    }
    setRanges(newRanges);
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const zip = new JSZip();
      if (splitMode === 'range') {
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const newPdf = await PDFDocument.create();
          for (let j = range.from - 1; j < range.to; j++) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [j]);
            newPdf.addPage(copiedPage);
          }
          const pdfBytes = await newPdf.save();
          zip.file(`split_${range.from}-${range.to}.pdf`, pdfBytes);
          setProgress(((i + 1) / ranges.length) * 100);
        }
      } else if (splitMode === 'pages') {
        if (pageMode === 'all') {
          for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            zip.file(`page_${i + 1}.pdf`, pdfBytes);
            setProgress(((i + 1) / totalPages) * 100);
          }
        } else {
          const pagesPerPart = Math.ceil(totalPages / numParts);
          for (let i = 0; i < numParts; i++) {
            const newPdf = await PDFDocument.create();
            const startPage = i * pagesPerPart;
            const endPage = Math.min(startPage + pagesPerPart, totalPages);
            for (let j = startPage; j < endPage; j++) {
              const [copiedPage] = await newPdf.copyPages(pdfDoc, [j]);
              newPdf.addPage(copiedPage);
            }
            const pdfBytes = await newPdf.save();
            zip.file(`part_${i + 1}.pdf`, pdfBytes);
            setProgress(((i + 1) / numParts) * 100);
          }
        }
      } else {
        const maxBytes = maxSize * (sizeUnit === 'MB' ? 1024 * 1024 : 1024);
        let currentPdf = await PDFDocument.create();
        let partNumber = 1;
        for (let i = 0; i < totalPages; i++) {
          const [copiedPage] = await currentPdf.copyPages(pdfDoc, [i]);
          currentPdf.addPage(copiedPage);
          const tempBytes = await currentPdf.save();
          if (tempBytes.length > maxBytes) {
            currentPdf.removePage(currentPdf.getPageCount() - 1);
            const pdfBytes = await currentPdf.save();
            zip.file(`part_${partNumber}.pdf`, pdfBytes);
            currentPdf = await PDFDocument.create();
            const [page] = await currentPdf.copyPages(pdfDoc, [i]);
            currentPdf.addPage(page);
            partNumber++;
          }
          setProgress(((i + 1) / totalPages) * 100);
        }
        if (currentPdf.getPageCount() > 0) {
          const pdfBytes = await currentPdf.save();
          zip.file(`part_${partNumber}.pdf`, pdfBytes);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split_pdfs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF split successfully!');
    } catch (error) {
      toast.error('Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setProgress(0);
    setPreviewError(null);
    setRanges([{ from: 1, to: 1 }]);
    setPreviews([]);
    setTotalPages(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Controls */}
        <div className="w-full md:w-1/3">
          <Card className="p-6 sticky top-8">
            <h1 className="text-2xl font-bold mb-4 text-center">Split PDF</h1>
            <p className="text-center text-gray-500 mb-6">Split your PDF by page range, extract pages, or split by file size.</p>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="w-12 h-12 mb-2 text-blue-500 mx-auto" />
                <p className="text-base font-medium mb-1">Drag & drop your PDF here</p>
                <p className="text-xs text-gray-500 mb-1">or click to select a file</p>
                <p className="text-xs text-gray-400">Maximum file size: 100MB</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-sm truncate max-w-[120px]">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <Button variant="ghost" size="icon" onClick={handleClear} disabled={isProcessing}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Tabs defaultValue={splitMode} className="w-full" onValueChange={(v: string) => setSplitMode(v as 'range' | 'pages' | 'size')}>
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="range">By Range</TabsTrigger>
                    <TabsTrigger value="pages">By Pages</TabsTrigger>
                    <TabsTrigger value="size">By Size</TabsTrigger>
                  </TabsList>
                  <TabsContent value="range" className="space-y-2">
                    {ranges.map((range, index) => (
                      <div key={index} className="p-2 border rounded bg-muted/50 flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>From</Label>
                          <Input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={range.from}
                            onChange={(e) => updateRange(index, 'from', parseInt(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>To</Label>
                          <Input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={range.to}
                            onChange={(e) => updateRange(index, 'to', parseInt(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        {index > 0 && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeRange(index)}
                            className="mt-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button onClick={addRange} className="w-full" size="sm">
                      Add Range
                    </Button>
                  </TabsContent>
                  <TabsContent value="pages" className="space-y-2">
                    <RadioGroup value={pageMode} onValueChange={(v: string) => setPageMode(v as 'all' | 'parts')}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="text-sm">Extract All Pages</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parts" id="parts" />
                        <Label htmlFor="parts" className="text-sm">Split into Equal Parts</Label>
                      </div>
                    </RadioGroup>
                    {pageMode === 'parts' && (
                      <div className="space-y-1">
                        <Label>Number of Parts</Label>
                        <Input
                          type="number"
                          min={2}
                          max={totalPages}
                          value={numParts}
                          onChange={(e) => setNumParts(parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="size" className="space-y-2">
                    <div>
                      <Label>Maximum Size per File</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="number"
                          min={10}
                          value={maxSize}
                          onChange={(e) => setMaxSize(parseInt(e.target.value))}
                        />
                        <select
                          value={sizeUnit}
                          onChange={(e) => setSizeUnit(e.target.value as 'KB' | 'MB')}
                          className="px-2 py-1 border rounded-md bg-background text-xs"
                        >
                          <option value="KB">KB</option>
                          <option value="MB">MB</option>
                        </select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                {isProcessing && (
                  <div className="mt-4">
                    <Progress value={progress} className="mb-1" />
                    <p className="text-xs text-muted-foreground text-center">Processing... {Math.round(progress)}%</p>
                  </div>
                )}
                <Button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="w-full mt-4"
                  size="lg"
                >
                  <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                  Split PDF
                </Button>
              </>
            )}
          </Card>
        </div>
        {/* Right: Preview */}
        <div className="w-full md:w-2/3">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Preview</h2>
            {previewError && (
              <div className="mb-4 text-red-500 text-sm font-medium text-center">{previewError}</div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[120px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : splitMode === 'range' && file ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ranges.map((range, idx) => (
                  <RangePreview
                    key={idx}
                    file={file}
                    from={range.from}
                    to={range.to}
                    rangeIndex={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {previews.map((preview) => (
                  <div key={preview.pageNumber} className="relative group">
                    <img
                      src={preview.thumbnail}
                      alt={`Page ${preview.pageNumber}`}
                      className="w-full border rounded-lg shadow-sm transition-transform group-hover:scale-105 h-24 object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                      Page {preview.pageNumber}
                    </div>
                  </div>
                ))}
                {totalPages > 5 && (
                  <div className="col-span-3 md:col-span-4 text-center text-xs text-muted-foreground mt-2">
                    Showing first 5 pages of {totalPages} total pages
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function RangePreview({ file, from, to, rangeIndex }: { file: File, from: number, to: number, rangeIndex: number }) {
  const [firstThumb, setFirstThumb] = useState<string | null>(null);
  const [lastThumb, setLastThumb] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    getPageThumbnail(from, file).then((thumb: string | null) => { if (mounted) setFirstThumb(thumb); });
    getPageThumbnail(to, file).then((thumb: string | null) => { if (mounted) setLastThumb(thumb); });
    return () => { mounted = false; };
  }, [file, from, to]);
  return (
    <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center mb-4 mx-2 bg-white dark:bg-zinc-900">
      <div className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Range {rangeIndex + 1}</div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          {firstThumb ? (
            <img src={firstThumb} alt={`Page ${from}`} className="w-32 rounded-lg shadow" />
          ) : (
            <div className="w-32 h-40 bg-gray-200 animate-pulse rounded-lg" />
          )}
          <span className="text-xs mt-1 text-gray-500">Page {from}</span>
        </div>
        <span className="mx-2 text-gray-400">→</span>
        <div className="flex flex-col items-center">
          {lastThumb ? (
            <img src={lastThumb} alt={`Page ${to}`} className="w-32 rounded-lg shadow" />
          ) : (
            <div className="w-32 h-40 bg-gray-200 animate-pulse rounded-lg" />
          )}
          <span className="text-xs mt-1 text-gray-500">Page {to}</span>
        </div>
      </div>
    </div>
  );
} 