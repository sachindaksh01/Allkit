import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const bgColor = formData.get("bg_color") as string | null

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    // Forward the request to the Python backend
    const backendFormData = new FormData()
    files.forEach((file) => {
      backendFormData.append("files", file)
    })
    if (bgColor) {
      backendFormData.append("bg_color", bgColor)
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tools/image/bgremover/remove-background`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to remove background")
    }

    // Return the ZIP file directly
    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=transparent-images.zip"
      }
    })
  } catch (error) {
    console.error("Error removing background:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove background" },
      { status: 500 }
    )
  }
} 