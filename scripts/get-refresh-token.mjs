import { createServer } from "http"
import { google } from "googleapis"
import { exec } from "child_process"

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = "http://localhost:3000/oauth/callback"

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive"],
  prompt: "consent",
})

console.log("\nקישור לאישור (פתח בדפדפן):\n")
console.log(authUrl)
console.log("")

// פתח דפדפן
exec(`start "" "${authUrl}"`)

// שרת זמני לתפוס את ה-callback
const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/oauth/callback")) return

  const url = new URL(req.url, "http://localhost:3000")
  const code = url.searchParams.get("code")

  if (!code) {
    res.end("שגיאה - לא התקבל קוד")
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)

    res.end(`
      <html><body dir="rtl" style="font-family:Arial;text-align:center;padding:40px">
        <h2>האישור הצליח!</h2>
        <p>חזור לטרמינל לראות את ה-Refresh Token</p>
      </body></html>
    `)

    console.log("\n✅ הצלחה! הנה ה-Refresh Token:\n")
    console.log("GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token)
    console.log("\nהעתק את השורה הזו ושלח אותה בצ'אט\n")

    server.close()
  } catch (err) {
    res.end("שגיאה: " + err.message)
    server.close()
  }
})

server.listen(3000, () => {
  console.log("ממתין לאישור בדפדפן...")
})
