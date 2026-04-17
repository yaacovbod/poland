import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    const decoded = decodeURIComponent(filename)
    const filePath = path.join(process.cwd(), "files", decoded)
    const buffer = await readFile(filePath)
    const ext = decoded.split(".").pop()?.toLowerCase()
    const contentType =
      ext === "pdf" ? "application/pdf" :
      ext === "doc" || ext === "docx" ? "application/msword" :
      "application/octet-stream"
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(decoded)}`,
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
