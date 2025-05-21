'use client';

import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd/dist/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PDFOrganizer } from '@/components/pdf/PDFOrganizer';
import { LayoutGrid } from 'lucide-react';

export default function OrganizePDFPage() {
  return (
    <div className="container py-12 flex flex-col items-center">
      <div className="flex flex-col items-center mb-8 text-center">
        <LayoutGrid className="h-14 w-14 text-blue-500 mb-2" />
        <h1 className="text-4xl font-bold mb-2">Organize PDF Pages</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Reorder, remove, and insert pages in your PDF. Drag and drop to rearrange, remove unwanted pages, or insert blank pages with ease.
        </p>
      </div>
      <div className="w-full max-w-3xl">
        <DndProvider backend={HTML5Backend}>
          <PDFOrganizer />
        </DndProvider>
      </div>
    </div>
  );
} 