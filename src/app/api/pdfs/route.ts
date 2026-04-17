import { NextResponse } from "next/server"
import { readConfigFile } from "@/lib/drive"
import localPdfs from "../../../../data/pdfs.json"

export interface PdfItem {
  id: string
  name: string
  description: string
  filename: string // Google Drive file ID or local filename
  type?: "drive" | "local" // default: "drive"
}

export async function GET() {
  const drivePdfs = await readConfigFile<PdfItem[]>("pdfs.json", [])
  const localIds = new Set((localPdfs as PdfItem[]).map((p) => p.id))
  const merged = [
    ...(localPdfs as PdfItem[]),
    ...drivePdfs.filter((p) => !localIds.has(p.id)),
  ]
  return NextResponse.json(merged)
}
