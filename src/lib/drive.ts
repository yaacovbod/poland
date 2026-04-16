import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/drive"]

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  })
}

export function getDriveClient() {
  const auth = getAuth()
  return google.drive({ version: "v3", auth })
}

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!

/**
 * מחזיר את ID של תיקיית התלמיד. אם לא קיימת - יוצר אותה.
 */
export async function getOrCreateStudentFolder(
  studentId: string,
  studentName: string
): Promise<string> {
  const drive = getDriveClient()
  const folderName = `${studentId} - ${studentName}`

  // חיפוש תיקייה קיימת
  const search = await drive.files.list({
    q: `name='${folderName}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  })

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!
  }

  // יצירת תיקייה חדשה
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  })

  return folder.data.id!
}

/**
 * מעלה קובץ לתיקיית התלמיד
 */
export async function uploadFileToStudentFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const drive = getDriveClient()
  const { Readable } = await import("stream")

  const file = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
  })

  return file.data.webViewLink ?? file.data.id!
}
