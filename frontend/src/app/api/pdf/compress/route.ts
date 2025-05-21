import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const compressionLevel = formData.get('compression_level') as string

    if (!file) {
      return NextResponse.json(
        { detail: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { detail: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { detail: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    const compressionValue = parseInt(compressionLevel)
    if (isNaN(compressionValue) || compressionValue < 0 || compressionValue > 100) {
      return NextResponse.json(
        { detail: 'Invalid compression level' },
        { status: 400 }
      )
    }

    // Create unique filenames
    const inputId = uuidv4()
    const outputId = uuidv4()
    const inputPath = join('/tmp', `${inputId}.pdf`)
    const outputPath = join('/tmp', `${outputId}.pdf`)

    // Save uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(inputPath, buffer)

    // Calculate quality based on compression level
    // Higher compression = lower quality
    const quality = Math.max(1, Math.floor(100 - compressionValue))

    // Compress PDF using Ghostscript
    const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`

    await execAsync(command)

    // Read the compressed file
    const compressedFile = await readFile(outputPath)

    // Clean up temporary files
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {})
    ])

    // Return the compressed file
    return new NextResponse(compressedFile, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="compressed.pdf"'
      }
    })

  } catch (error) {
    console.error('Compression error:', error)
    return NextResponse.json(
      { detail: 'Failed to compress file' },
      { status: 500 }
    )
  }
} 