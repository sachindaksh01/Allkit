import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const execAsync = promisify(exec);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filenames
    const inputFilename = `${uuidv4()}.pdf`;
    const outputFilename = `${uuidv4()}.xlsx`;
    const inputPath = path.join(process.cwd(), 'tmp', inputFilename);
    const outputPath = path.join(process.cwd(), 'tmp', outputFilename);

    // Save the uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    try {
      // Convert PDF to Excel using pdftk and other tools
      // Note: This is a placeholder. You'll need to implement the actual conversion logic
      // using appropriate libraries or tools
      await execAsync(`pdftk ${inputPath} output ${outputPath}`);

      // Read the converted file
      const convertedFile = await readFile(outputPath);

      // Clean up temporary files
      await Promise.all([
        unlink(inputPath),
        unlink(outputPath)
      ]);

      // Return the converted file
      return new NextResponse(convertedFile, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '.xlsx')}"`
        }
      });
    } catch (error) {
      // Clean up temporary files in case of error
      await Promise.all([
        unlink(inputPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ]);

      throw error;
    }
  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
    return NextResponse.json(
      { message: 'Failed to convert PDF to Excel' },
      { status: 500 }
    );
  }
} 