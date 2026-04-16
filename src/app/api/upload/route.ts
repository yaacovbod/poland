import { NextRequest, NextResponse } from "next/server"
import { readConfigFile, getOrCreateStudentFolder, uploadFileToStudentFolder } from "@/lib/drive"
import studentsJson from "../../../../data/students.json"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const studentId = formData.get("studentId") as string
    const file = formData.get("file") as File

    if (!studentId || !file) {
      return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
    }

    const students = await readConfigFile<Record<string, string>>("students.json", studentsJson)
    const studentName = students[studentId]

    if (!studentName) {
      return NextResponse.json(
        { error: "מספר ת.ז לא נמצא במערכת. פנה למורה." },
        { status: 404 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const folderId = await getOrCreateStudentFolder(studentId, studentName)
    if (!folderId) {
      return NextResponse.json({ error: "שגיאה ביצירת תיקייה בדרייב" }, { status: 500 })
    }
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
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
