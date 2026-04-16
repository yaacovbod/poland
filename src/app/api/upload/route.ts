import { NextRequest, NextResponse } from "next/server"
import { getOrCreateStudentFolder, uploadFileToStudentFolder } from "@/lib/drive"
import { readFileSync } from "fs"
import path from "path"

function getStudents(): Record<string, string> {
  try {
    const filePath = path.join(process.cwd(), "data", "students.json")
    const raw = readFileSync(filePath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const studentId = formData.get("studentId") as string
    const file = formData.get("file") as File

    if (!studentId || !file) {
      return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
    }

    const students = getStudents()
    const studentName = students[studentId]

    if (!studentName) {
      return NextResponse.json(
        { error: "מספר ת.ז לא נמצא במערכת. פנה למורה." },
        { status: 404 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const folderId = await getOrCreateStudentFolder(studentId, studentName)
    const fileLink = await uploadFileToStudentFolder(
      folderId,
      file.name,
      file.type || "application/octet-stream",
      buffer
    )

    return NextResponse.json({
      success: true,
      message: `הקובץ הועלה בהצלחה לתיקיית ${studentName}`,
      link: fileLink,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "שגיאה בהעלאת הקובץ" }, { status: 500 })
  }
}
