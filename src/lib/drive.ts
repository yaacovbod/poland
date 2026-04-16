import { Readable } from "stream"

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!
const CONFIG_FOLDER_NAME = "_config"
const TOKEN_URL = "https://oauth2.googleapis.com/token"
const DRIVE_API = "https://www.googleapis.com/drive/v3"
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3"

// ── Auth ───────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data))
  return data.access_token
}

async function driveGet(path: string, token: string) {
  const res = await fetch(`${DRIVE_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function drivePost(path: string, token: string, body: unknown) {
  const res = await fetch(`${DRIVE_API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function driveMultipart(
  token: string,
  metadata: object,
  content: string | Buffer,
  mimeType: string,
  fileId?: string
) {
  const boundary = "boundary_" + Date.now()
  const metaPart = JSON.stringify(metadata)
  const contentStr = typeof content === "string" ? content : content.toString("base64")
  const encoding = typeof content === "string" ? "utf-8" : "base64"

  const body =
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metaPart}\r\n` +
    `--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: ${encoding}\r\n\r\n${contentStr}\r\n` +
    `--${boundary}--`

  const url = fileId
    ? `${DRIVE_UPLOAD}/files/${fileId}?uploadType=multipart`
    : `${DRIVE_UPLOAD}/files?uploadType=multipart`

  const res = await fetch(url, {
    method: fileId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  })
  return res.json()
}

// ── Config folder ─────────────────────────────────────────────────────────

async function getConfigFolderId(token: string): Promise<string> {
  const q = encodeURIComponent(
    `name='${CONFIG_FOLDER_NAME}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  )
  const data = await driveGet(`/files?q=${q}&fields=files(id)`, token)
  if (data.files?.length) return data.files[0].id

  const folder = await drivePost("/files", token, {
    name: CONFIG_FOLDER_NAME,
    mimeType: "application/vnd.google-apps.folder",
    parents: [ROOT_FOLDER_ID],
  })
  return folder.id
}

async function getConfigFileId(
  folderId: string,
  filename: string,
  token: string
): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${filename}' and '${folderId}' in parents and trashed=false`
  )
  const data = await driveGet(`/files?q=${q}&fields=files(id)`, token)
  return data.files?.[0]?.id ?? null
}

export async function readConfigFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const token = await getAccessToken()
    const folderId = await getConfigFolderId(token)
    const fileId = await getConfigFileId(folderId, filename, token)
    if (!fileId) return fallback

    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const text = await res.text()
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export async function writeConfigFile<T>(filename: string, data: T): Promise<void> {
  const token = await getAccessToken()
  const folderId = await getConfigFolderId(token)
  const existingId = await getConfigFileId(folderId, filename, token)
  const content = JSON.stringify(data, null, 2)

  await driveMultipart(
    token,
    existingId ? {} : { name: filename, parents: [folderId] },
    content,
    "application/json",
    existingId ?? undefined
  )
}

// ── Student folders ────────────────────────────────────────────────────────

export async function getOrCreateStudentFolder(
  studentId: string,
  studentName: string
): Promise<string> {
  const token = await getAccessToken()
  const folderName = `${studentId} - ${studentName}`
  const q = encodeURIComponent(
    `name='${folderName}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  )
  const data = await driveGet(`/files?q=${q}&fields=files(id)`, token)
  if (data.files?.length) return data.files[0].id

  const folder = await drivePost("/files", token, {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [ROOT_FOLDER_ID],
  })
  return folder.id
}

export async function uploadFileToStudentFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<string> {
  const token = await getAccessToken()
  const file = await driveMultipart(
    token,
    { name: fileName, parents: [folderId] },
    buffer,
    mimeType
  )
  return `https://drive.google.com/file/d/${file.id}/view`
}

export async function uploadPdfToDrive(filename: string, buffer: Buffer): Promise<string> {
  const token = await getAccessToken()
  const folderId = await getConfigFolderId(token)
  const file = await driveMultipart(
    token,
    { name: filename, parents: [folderId] },
    buffer,
    "application/pdf"
  )

  // הפוך לציבורי
  await fetch(`${DRIVE_API}/files/${file.id}/permissions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  })

  return file.id
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken()
  await fetch(`${DRIVE_API}/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
}

// keep Readable exported so existing code compiles
export { Readable }
