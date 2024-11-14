import { NextRequest, NextResponse } from "next/server"
import PDFMerger from "pdf-merger-js"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files")

    const merger = new PDFMerger()

    // Add each file to the merger
    for (const file of files) {
      const buffer = await (file as File).arrayBuffer()
      await merger.add(buffer)
    }

    // Merge and get the final buffer
    const mergedPdfBuffer = await merger.saveAsBuffer()

    return new NextResponse(mergedPdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=merged-expenses.pdf",
      },
    })
  } catch (error) {
    console.error("Error processing PDFs:", error)
    return NextResponse.json({ error: "Failed to merge PDFs" }, { status: 500 })
  }
}
