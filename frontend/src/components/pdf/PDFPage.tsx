'use client';

import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd/dist/hooks';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFPageProps {
  page: {
    id: string;
    pageNumber: number;
    preview: string;
  };
  index: number;
  movePage: (dragIndex: number, hoverIndex: number) => void;
  removePage: () => void;
  insertBlankPage: () => void;
}

export function PDFPage({ page, index, movePage, removePage, insertBlankPage }: PDFPageProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'page',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'page',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      movePage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={page.preview}
          alt={`Page ${page.pageNumber}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
      </div>

      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6"
          onClick={removePage}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={insertBlankPage}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        Page {page.pageNumber}
      </div>
    </div>
  );
} 