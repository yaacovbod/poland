import { NextResponse } from "next/server"
import { readConfigFile } from "@/lib/drive"

export interface PdfItem {
  id: string
  name: string
  description: string
  filename: string // Google Drive file ID or local filename
  type?: "drive" | "local" // default: "drive"
}

export async function GET() {
  const pdfs = await readConfigFile<PdfItem[]>("pdfs.json", [])
  return NextResponse.json(pdfs)
}
