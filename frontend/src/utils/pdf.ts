import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker from local public folder for reliability and speed
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export async function extractPages(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context!,
      viewport,
    }).promise;

    pages.push({
      id: Math.random().toString(36).substring(7),
      pageNumber: i,
      preview: canvas.toDataURL('image/jpeg', 0.5),
    });
  }

  return pages;
} 