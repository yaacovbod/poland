import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        error: "missing env vars",
        clientId: !!clientId,
        clientSecret: !!clientSecret,
        refreshToken: !!refreshToken,
        folderId: !!folderId,
      })
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret)
    auth.setCredentials({ refresh_token: refreshToken })
    const drive = google.drive({ version: "v3", auth })

    const res = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name)",
      pageSize: 3,
    })

    return NextResponse.json({ ok: true, files: res.data.files?.length ?? 0 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
