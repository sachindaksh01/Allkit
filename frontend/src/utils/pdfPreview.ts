import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

export async function getPDFPreview(input: File | ArrayBuffer, rotation: number = 0): Promise<{ url: string | null; error: boolean }> {
  try {
    let arrayBuffer: ArrayBuffer;
    if (input instanceof File) {
      arrayBuffer = await input.arrayBuffer();
    } else {
      arrayBuffer = input;
    }

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set up the canvas with rotation
    const viewport = page.getViewport({ scale: 1.5, rotation: rotation });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions based on rotation
    if (rotation === 90 || rotation === 270) {
      canvas.width = viewport.height;
      canvas.height = viewport.width;
    } else {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
    }

    // Apply rotation to canvas context
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.translate(-viewport.width / 2, -viewport.height / 2);

    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // Convert to image
    const url = canvas.toDataURL('image/jpeg', 0.8);
    return { url, error: false };
  } catch (error) {
    console.error('PDF Preview Error:', error);
    return { url: null, error: true };
  }
} 