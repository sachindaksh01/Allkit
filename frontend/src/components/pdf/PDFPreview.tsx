'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FileText, X, RotateCw, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPDFPreview } from '@/utils/pdfPreview';
import { useTheme } from 'next-themes';

interface PDFPreviewProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onClear?: () => void;
  onRotation: (index: number, rotation: number) => void;
  rotations: number[];
}

interface PreviewState {
  url: string | null;
  loading: boolean;
  error: boolean;
}

export function PDFPreview({ files, onReorder, onClear, onRotation, rotations }: PDFPreviewProps) {
  const [previews, setPreviews] = useState<PreviewState[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const loadPreviews = async () => {
      const newPreviews: PreviewState[] = await Promise.all(
        files.map(async (file) => {
          const { url, error } = await getPDFPreview(file, rotations[files.indexOf(file)]);
          return { url, loading: false, error };
        })
      );
      if (isMounted) setPreviews(newPreviews);
    };
    setPreviews(files.map(() => ({ url: null, loading: true, error: false })));
    loadPreviews();
    return () => {
      isMounted = false;
    };
  }, [files, rotations]);

  const handleRotate = (index: number) => {
    const newRotation = (rotations[index] + 90) % 360;
    onRotation(index, newRotation);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onReorder(newFiles);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorder(items);
  };

  // Theme-based color classes
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const iconColor = theme === 'dark' ? 'text-blue-300' : 'text-blue-600';
  const removeColor = theme === 'dark' ? 'text-red-300' : 'text-red-600';
  const bgColor = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-zinc-700' : 'border-gray-200';
  const previewBgColor = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-50';

  // Function to truncate filename
  const truncateFileName = (name: string, maxLength: number = 12) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    return `${nameWithoutExt.slice(0, maxLength)}...${extension}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${textColor}`}>PDF Files ({files.length})</h2>
        {onClear && (
          <Button variant="outline" onClick={onClear} className="ml-2">Clear</Button>
        )}
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pdf-list" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-row flex-wrap gap-6 pb-4 justify-start"
            >
              {files.map((file, index) => (
                <Draggable
                  key={`${file.name}-${index}`}
                  draggableId={`${file.name}-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex flex-col items-center ${bgColor} p-3 rounded-xl shadow-lg border-2 ${borderColor} w-[140px] min-h-[220px] relative group cursor-move select-none transition-transform hover:scale-105 hover:border-blue-500 duration-200`}
                    >
                      {/* Remove & Rotate Buttons */}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-100 z-10">
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${iconColor} hover:bg-blue-100 dark:hover:bg-blue-900`} onClick={() => handleRotate(index)} title="Rotate">
                          <RotateCw className={`w-5 h-5 ${iconColor}`} />
                        </Button>
                        <Button size="icon" variant="ghost" className={`h-7 w-7 ${removeColor} hover:bg-red-100 dark:hover:bg-red-900`} onClick={() => removeFile(index)} title="Remove">
                          <X className={`w-5 h-5 ${removeColor}`} />
                        </Button>
                      </div>
                      {/* PDF First Page Preview */}
                      <div className={`w-full aspect-[3/4] flex items-center justify-center ${previewBgColor} rounded-lg overflow-hidden mb-2 border border-dashed border-gray-300 dark:border-zinc-700`}>
                        {previews[index]?.loading ? (
                          <Loader2 className="animate-spin w-7 h-7 text-blue-400 opacity-70" />
                        ) : previews[index]?.error ? (
                          <div className="flex flex-col items-center justify-center text-red-400">
                            <AlertTriangle className="w-7 h-7 mb-1" />
                            <span className="text-[11px]">Preview Error</span>
                          </div>
                        ) : previews[index]?.url ? (
                          <img
                            src={previews[index].url!}
                            alt={file.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                            className="rounded shadow"
                          />
                        ) : (
                          <FileText className={`w-9 h-9 text-blue-500 opacity-60`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-center mt-1 w-full">
                        <p className={`text-xs font-medium truncate ${textColor}`} title={file.name}>
                          {truncateFileName(file.name, 18)}
                        </p>
                        <p className={`text-[10px] ${subTextColor}`}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 