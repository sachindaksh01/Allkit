import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB per file

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files: File[] = []
    
    // Collect all files from formData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length < 2) {
      return NextResponse.json(
        { detail: 'At least 2 PDF files are required' },
        { status: 400 }
      )
    }

    // Validate each file
    for (const file of files) {
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
    }

    // Create unique filenames for input files
    const inputPaths: string[] = []
    const fileIds: string[] = []

    // Save all input files
    for (const file of files) {
      const fileId = uuidv4()
      fileIds.push(fileId)
      const inputPath = join('/tmp', `${fileId}.pdf`)
      inputPaths.push(inputPath)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(inputPath, buffer)
    }

    // Create output file path
    const outputId = uuidv4()
    const outputPath = join('/tmp', `${outputId}.pdf`)

    // Create PDF merge command
    const inputFiles = inputPaths.join(' ')
    const command = `pdftk ${inputFiles} cat output ${outputPath}`

    await execAsync(command)

    // Read the merged file
    const mergedFile = await readFile(outputPath)

    // Clean up temporary files
    await Promise.all([
      ...inputPaths.map(path => unlink(path).catch(() => {})),
      unlink(outputPath).catch(() => {})
    ])

    // Return the merged file
    return new NextResponse(mergedFile, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"'
      }
    })

  } catch (error) {
    console.error('Merge error:', error)
    return NextResponse.json(
      { detail: 'Failed to merge files' },
      { status: 500 }
    )
  }
} 