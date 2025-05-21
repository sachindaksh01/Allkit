import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string;

    if (!files.length || !type) {
      return NextResponse.json(
        { detail: 'File(s) and conversion type are required' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { detail: `File ${file.name} size must be less than 50MB` },
          { status: 400 }
        );
      }
    }

    // Forward the request to the Python backend
    const backendFormData = new FormData();
    files.forEach(file => backendFormData.append('files', file));
    backendFormData.append('type', type);

    const response = await fetch('http://localhost:8000/api/convert-to-pdf', {
      method: 'POST',
      body: backendFormData
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { detail: error.detail || 'Conversion failed' },
        { status: response.status }
      );
    }

    // Get the blob from the backend
    const contentType = response.headers.get('content-type');
    const blob = await response.blob();

    // Return the file (PDF or ZIP)
    let filename = 'converted_pdfs.zip';
    if (contentType && contentType.includes('application/pdf') && files.length === 1) {
      filename = files[0].name.split('.')[0] + '.pdf';
    }
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { detail: 'Failed to convert file(s)' },
      { status: 500 }
    );
  }
} 