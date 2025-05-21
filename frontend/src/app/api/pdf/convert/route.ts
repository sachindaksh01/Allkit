import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const ALLOWED_TYPES = ['word', 'excel', 'powerpoint', 'image']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const outputType = formData.get('output_type') as string

    if (!file) {
      return NextResponse.json(
        { detail: 'No file provided' },
        { status: 400 }
      )
    }

    if (!outputType || !ALLOWED_TYPES.includes(outputType)) {
      return NextResponse.json(
        { detail: 'Invalid output type' },
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

    // Create unique filenames
    const inputId = uuidv4()
    const outputId = uuidv4()
    const inputPath = join('/tmp', `${inputId}.pdf`)
    const outputPath = join('/tmp', `${outputId}.${getOutputExtension(outputType)}`)

    // Save uploaded file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(inputPath, buffer)

    // Convert file based on output type
    let command: string
    switch (outputType) {
      case 'word':
        command = `soffice --headless --convert-to docx --outdir /tmp ${inputPath}`
        break
      case 'excel':
        command = `soffice --headless --convert-to xlsx --outdir /tmp ${inputPath}`
        break
      case 'powerpoint':
        command = `soffice --headless --convert-to pptx --outdir /tmp ${inputPath}`
        break
      case 'image':
        command = `pdftoppm -png ${inputPath} ${outputPath}`
        break
      default:
        throw new Error('Invalid output type')
    }

    await execAsync(command)

    // Read the converted file
    const convertedFile = await readFile(outputPath)

    // Clean up temporary files
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {})
    ])

    // Return the converted file
    return new NextResponse(convertedFile, {
      headers: {
        'Content-Type': getOutputContentType(outputType),
        'Content-Disposition': `attachment; filename="converted.${getOutputExtension(outputType)}"`
      }
    })

  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { detail: 'Failed to convert file' },
      { status: 500 }
    )
  }
}

function getOutputExtension(type: string): string {
  switch (type) {
    case 'word':
      return 'docx'
    case 'excel':
      return 'xlsx'
    case 'powerpoint':
      return 'pptx'
    case 'image':
      return 'png'
    default:
      throw new Error('Invalid output type')
  }
}

function getOutputContentType(type: string): string {
  switch (type) {
    case 'word':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'powerpoint':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    case 'image':
      return 'image/png'
    default:
      throw new Error('Invalid output type')
  }
} 