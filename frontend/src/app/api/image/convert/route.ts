import { NextRequest, NextResponse } from "next/server"
import { writeFile, unlink, readFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const outputFormat = formData.get("output_format") as string

    if (!file) {
      return NextResponse.json(
        { detail: "No file provided" },
        { status: 400 }
      )
    }

    if (!outputFormat) {
      return NextResponse.json(
        { detail: "Output format not specified" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { detail: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    const validFormats = ["jpeg", "png", "webp", "gif", "bmp", "tiff"]
    if (!validFormats.includes(outputFormat.toLowerCase())) {
      return NextResponse.json(
        { detail: "Invalid output format" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const inputFilename = `${uuidv4()}-input.${file.name.split('.').pop()}`
    const outputFilename = `${uuidv4()}-output.${outputFormat}`
    const inputPath = join("/tmp", inputFilename)
    const outputPath = join("/tmp", outputFilename)

    await writeFile(inputPath, buffer)

    // Use ImageMagick for conversion
    const command = `convert "${inputPath}" "${outputPath}"`
    await execAsync(command)

    // Read the converted file
    const convertedFile = await readFile(outputPath)

    // Clean up temporary files
    await Promise.all([
      unlink(inputPath),
      unlink(outputPath)
    ])

    return new NextResponse(convertedFile, {
      headers: {
        "Content-Type": `image/${outputFormat}`,
        "Content-Disposition": `attachment; filename="converted.${outputFormat}"`,
      },
    })
  } catch (error) {
    console.error("Image conversion error:", error)
    return NextResponse.json(
      { detail: "Failed to convert image" },
      { status: 500 }
    )
  }
} 