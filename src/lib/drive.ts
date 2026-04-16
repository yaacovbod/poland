import { google } from "googleapis"

function getAuth() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
}

export function getDriveClient() {
  const auth = getAuth()
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return google.drive({ version: "v3", auth })
}

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!
const CONFIG_FOLDER_NAME = "_config"

// ── Config folder ─────────────────────────────────────────────────────────

async function getConfigFolderId(): Promise<string> {
  const drive = getDriveClient()
  const search = await drive.files.list({
    q: `name='${CONFIG_FOLDER_NAME}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  })
  if (search.data.files?.length) return search.data.files[0].id!

  const folder = await drive.files.create({
    requestBody: {
      name: CONFIG_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  })
  return folder.data.id!
}

async function getConfigFileId(folderId: string, filename: string): Promise<string | null> {
  const drive = getDriveClient()
  const search = await drive.files.list({
    q: `name='${filename}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id)",
  })
  return search.data.files?.[0]?.id ?? null
}

export async function readConfigFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const drive = getDriveClient()
    const configFolderId = await getConfigFolderId()
    const fileId = await getConfigFileId(configFolderId, filename)
    if (!fileId) return fallback

    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "text" }
    )
    return JSON.parse(res.data as string) as T
  } catch {
    return fallback
  }
}

export async function writeConfigFile<T>(filename: string, data: T): Promise<void> {
  const drive = getDriveClient()
  const { Readable } = await import("stream")
  const configFolderId = await getConfigFolderId()
  const existingId = await getConfigFileId(configFolderId, filename)
  const content = JSON.stringify(data, null, 2)

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: { mimeType: "application/json", body: Readable.from(content) },
    })
  } else {
    await drive.files.create({
      requestBody: { name: filename, parents: [configFolderId] },
      media: { mimeType: "application/json", body: Readable.from(content) },
    })
  }
}

// ── Student folders ────────────────────────────────────────────────────────

export async function getOrCreateStudentFolder(
  studentId: string,
  studentName: string
): Promise<string> {
  const drive = getDriveClient()
  const folderName = `${studentId} - ${studentName}`

  const search = await drive.files.list({
    q: `name='${folderName}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  })
  if (search.data.files?.length) return search.data.files[0].id!

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

export async function uploadFileToStudentFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const drive = getDriveClient()
  const { Readable } = await import("stream")

  const file = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id, webViewLink",
  })
  return file.data.webViewLink ?? file.data.id!
}

// ── PDF upload ─────────────────────────────────────────────────────────────

export async function uploadPdfToDrive(filename: string, buffer: Buffer): Promise<string> {
  const drive = getDriveClient()
  const { Readable } = await import("stream")
  const configFolderId = await getConfigFolderId()

  const file = await drive.files.create({
    requestBody: { name: filename, parents: [configFolderId] },
    media: { mimeType: "application/pdf", body: Readable.from(buffer) },
    fields: "id",
  })

  await drive.permissions.create({
    fileId: file.data.id!,
    requestBody: { role: "reader", type: "anyone" },
  })

  return file.data.id!
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const drive = getDriveClient()
  await drive.files.delete({ fileId })
}
