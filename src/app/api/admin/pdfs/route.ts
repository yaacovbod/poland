import { NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import path from "path"
import { PdfItem } from "../../pdfs/route"

const DATA_DIR = path.join(process.cwd(), "data")
const PDFS_FILE = path.join(DATA_DIR, "pdfs.json")
const PUBLIC_PDFS_DIR = path.join(process.cwd(), "public", "pdfs")

function checkAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password")
  return auth === process.env.ADMIN_PASSWORD
}

function getPdfs(): PdfItem[] {
  try {
    return JSON.parse(readFileSync(PDFS_FILE, "utf-8"))
  } catch {
    return []
  }
}

function savePdfs(pdfs: PdfItem[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(PDFS_FILE, JSON.stringify(pdfs, null, 2), "utf-8")
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File

    if (!name || !file) {
      return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
    }

    if (!existsSync(PUBLIC_PDFS_DIR)) mkdirSync(PUBLIC_PDFS_DIR, { recursive: true })

    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const buffer = Buffer.from(await file.arrayBuffer())
    writeFileSync(path.join(PUBLIC_PDFS_DIR, filename), buffer)

    const pdfs = getPdfs()
    const newItem: PdfItem = {
      id: Date.now().toString(),
      name,
      description: description || "",
      filename,
    }
    pdfs.push(newItem)
    savePdfs(pdfs)

    return NextResponse.json({ success: true, item: newItem })
  } catch (err) {
    console.error("Admin PDF upload error:", err)
    return NextResponse.json({ error: "שגיאה בשמירת הקובץ" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }

  const { id } = await req.json()
  const pdfs = getPdfs()
  const updated = pdfs.filter((p) => p.id !== id)
  savePdfs(updated)
  return NextResponse.json({ success: true })
}
