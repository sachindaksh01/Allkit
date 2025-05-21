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
    const pageRanges = formData.get('page_ranges') as string

    if (!file) {
      return NextResponse.json(
        { detail: 'No file provided' },
        { status: 400 }
      )
    }

    if (!pageRanges) {
      return NextResponse.json(
        { detail: 'No page ranges provided' },
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

    // Validate page ranges format
    const pageRangeRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/
    if (!pageRangeRegex.test(pageRanges)) {
      return NextResponse.json(
        { detail: 'Invalid page range format. Use format like: 1-3, 5, 7-9' },
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

    // Create PDF split command
    const command = `pdftk ${inputPath} cat ${pageRanges} output ${outputPath}`

    await execAsync(command)

    // Read the split file
    const splitFile = await readFile(outputPath)

    // Clean up temporary files
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {})
    ])

    // Return the split file
    return new NextResponse(splitFile, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="split.pdf"'
      }
    })

  } catch (error) {
    console.error('Split error:', error)
    return NextResponse.json(
      { detail: 'Failed to split file' },
      { status: 500 }
    )
  }
} 