import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const outputFormat = formData.get("output_format") as string
    const quality = parseInt(formData.get("quality") as string)
    const scale = parseInt(formData.get("scale") as string || "100")

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    if (!outputFormat) {
      return NextResponse.json(
        { error: "Output format not specified" },
        { status: 400 }
      )
    }

    // Forward the request to the Python backend
    const backendFormData = new FormData()
    files.forEach((file) => {
      backendFormData.append("files", file)
    })
    backendFormData.append("output_format", outputFormat)
    backendFormData.append("quality", quality.toString())
    backendFormData.append("scale", scale.toString())

    const response = await fetch("http://localhost:8000/tools/image/converter/convert", {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to convert images")
    }

    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=converted_images.zip",
      },
    })
  } catch (error) {
    console.error("Error converting images:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to convert images" },
      { status: 500 }
    )
  }
} 