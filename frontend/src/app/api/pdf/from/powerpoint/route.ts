import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Create unique filename
    const uniqueId = uuidv4();
    const inputPath = join('/tmp', `${uniqueId}-${file.name}`);
    const outputPath = join('/tmp', `${uniqueId}-output.pdf`);

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(inputPath, buffer);

    // Call Python API
    const response = await fetch('http://localhost:5000/api/pdf/from/powerpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input_file: inputPath,
        output_file: outputPath,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File converted successfully',
      output_file: data.output_file,
    });
  } catch (error) {
    console.error('Error in PowerPoint to PDF conversion:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 