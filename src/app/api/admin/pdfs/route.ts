import { NextRequest, NextResponse } from "next/server"
import { readConfigFile, writeConfigFile, uploadPdfToDrive, deleteDriveFile } from "@/lib/drive"
import { PdfItem } from "../../pdfs/route"

function checkAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD
}

async function getPdfs(): Promise<PdfItem[]> {
  return readConfigFile<PdfItem[]>("pdfs.json", [])
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

    const buffer = Buffer.from(await file.arrayBuffer())
    const driveFileId = await uploadPdfToDrive(file.name, buffer)

    const pdfs = await getPdfs()
    const newItem: PdfItem = {
      id: Date.now().toString(),
      name,
      description: description || "",
      filename: driveFileId,
    }
    pdfs.push(newItem)
    await writeConfigFile("pdfs.json", pdfs)
    return NextResponse.json({ success: true, item: newItem })
  } catch (err) {
    console.error("PDF upload error:", err)
    return NextResponse.json({ error: "שגיאה בהעלאה" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  const { id } = await req.json()
  const pdfs = await getPdfs()
  const item = pdfs.find((p) => p.id === id)
  if (item) {
    try { await deleteDriveFile(item.filename) } catch {}
  }
  await writeConfigFile("pdfs.json", pdfs.filter((p) => p.id !== id))
  return NextResponse.json({ success: true })
}
