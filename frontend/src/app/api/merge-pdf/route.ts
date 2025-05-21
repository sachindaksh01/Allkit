import { NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';

export async function GET() {
  return NextResponse.json({ message: 'PDF merge API is ready' });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const rotations = formData.getAll('rotations').map(r => parseInt(r as string));

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rotation = rotations[i] || 0;

      // Validate file type
      if (!file.type.includes('pdf')) {
        console.warn(`Skipping invalid file: ${file.name}`);
        continue;
      }

      // Check if file is empty
      if (file.size === 0) {
        console.warn(`Skipping empty file: ${file.name}`);
        continue;
      }

      try {
        // Read the file
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Copy all pages
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        // Add pages to merged PDF with rotation
        pages.forEach(page => {
          const { width, height } = page.getSize();
          // Convert degrees to PDF rotation value
          const normalizedRotation = rotation % 360;
          page.setRotation(degrees(normalizedRotation));
          mergedPdf.addPage(page);
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        continue;
      }
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Return the merged PDF
    return new NextResponse(mergedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"'
      }
    });
  } catch (error) {
    console.error('PDF Merge Error:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDFs' },
      { status: 500 }
    );
  }
} 