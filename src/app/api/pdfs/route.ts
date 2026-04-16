import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import path from "path"

export interface PdfItem {
  id: string
  name: string
  description: string
  filename: string
}

function getPdfs(): PdfItem[] {
  try {
    const filePath = path.join(process.cwd(), "data", "pdfs.json")
    const raw = readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function GET() {
  const pdfs = getPdfs()
  return NextResponse.json(pdfs)
}
