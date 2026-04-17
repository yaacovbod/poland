import { NextRequest, NextResponse } from "next/server"
import { readConfigFile, getOrCreateStudentFolder, uploadFileToStudentFolder } from "@/lib/drive"
import studentsJson from "../../../../data/students.json"
import nodemailer from "nodemailer"

const NOTIFY_EMAILS = [
  "1002823504@edu-haifa.org.il",
  "1003756071@edu-haifa.org.il",
]

async function sendUploadNotification(studentName: string, fileName: string, driveLink: string) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: `"מסע לפולין" <${user}>`,
    to: NOTIFY_EMAILS.join(", "),
    subject: `העלאת קובץ חדשה — ${studentName}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #0d2d3d;">
        <h2 style="color: #1a6b8a; margin-bottom: 16px;">הועלה קובץ חדש</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px; background: #e3edf5; font-weight: bold;">תלמיד</td>
            <td style="padding: 8px 12px; background: #f0f5f9;">${studentName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #e3edf5; font-weight: bold;">שם קובץ</td>
            <td style="padding: 8px 12px; background: #f0f5f9;">${fileName}</td>
          </tr>
        </table>
        <div style="margin-top: 20px;">
          <a href="${driveLink}" style="display: inline-block; background: #1a6b8a; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            פתח בדרייב
          </a>
        </div>
        <p style="margin-top: 24px; font-size: 0.8rem; color: #7aaabb;">מסע לפולין — פורטל נעימת הלב</p>
      </div>
    `,
  })
}

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

    sendUploadNotification(studentName, file.name, fileLink ?? "").catch((err) => {
      console.error("Email notification failed:", err)
    })

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
