import { google } from "googleapis"
import { readFileSync } from "fs"

const students = JSON.parse(
  readFileSync("./data/students.json", "utf-8")
)

const ROOT_FOLDER_ID = "1WYIAGpYDP1R7Y3dXzznH8O5dJ7D5Sw0z"

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHmX2Ngv07Qc6m
zLn25PsEC+W7zhWtwS1bBcje9GvrGb5ldJbVqaj9IIonrHSYAvsl+aOcwe4I/oPE
pqkhesRrpKGoNrrFKrPBy8JQ8CcapsJoYUv0Dl3shmRAvi3GPvhdzvu1vdG/0oxT
777Am4kkZi4hG5yjnimJKntNO2r0Ylv0MP1exN/LkKTOjg04XY1OT71VRlzNdZKK
shm9wFeT7eH+IK+Rm0ft4RvGXJqrZxFpAT13X86m6XJJFBVKOF5qej/hewOU/FlF
FVmhh/WaqWn8dwLYQiQJSPPII3Gml318FSYjPj5982A5/sT7oFBPg4HREVR2bkJj
juM7eLMFAgMBAAECggEAFKuln/kXxoI7J3T+MT5nbHTa9scR4aumyc1gjw5a+r7w
w8r+L+RhFs2+4PrwHCn63mTq97nxr8bD2KK10zzGiKtE/omkb/TLJt+2IPGt6wmo
Cm1BE2ZFfdAxI69OSECPMg/Ua27cAPSKCctDQukYm8dlMZKNdzhS7tySZl4n5mT2
P3p6xzPNVBpzTUJOwcxK4So4nDZG3jmVR5E6eaa4uc1h3ryXrHOHk8Kv83lFDcub
fd58x0II/x64tMCImwwzwsoKbGc1ADC2WIKzJU0rqpIzfEbj4TAZRgE8I4FEgppU
YkfeGvgPNLqrescyl0ZVoGE7JV4xDIe3xLNU95hcIQKBgQD4daKwl6NY7uiJsRjg
/qMcQ10TJQpN8HsSXk2HxkTcg4B6gpQcJXz3FrA9iUoPxnSza5w91s42wYzH4DQh
r3svlQl4g2zFNQxGP4T/qZNqd4LQ6b9pdO38pRwpHx48MKtlsIDiPJSAK1dqRAlO
lqVWQfWOHv6hrSieBu6NKzxRqQKBgQDNqD7t2ceyi1esYe7HXEb1J9/tRkRQxwJK
Hb0YcKqnNqunOTisRxIOVKwu1p5sTTceTUjV6190eMd0h2FtkPobS6jvQe5bEGYd
didkV19w21amaFz96BncQDWczbStho/7tYqrhZFVIcSAQpQiEwT54Ahn/7ldGUh/
V/ICvpln/QKBgQC6T7wHoC4lakGFvv9g+JFniDwrNwNbHpGrXHvW7J6GnTWiqHhY
AuSKhMDz5BddbPvl7zPiS0mnVcwztbRh7iz5qVDIxgSyfO0PYGJjNM4OcD/wWNfo
RH6RjV5ol6UcjYJ5Zrm+7J6O3fFXBl3USLMC08NHJ4bZxfdHSPtpcJpywQKBgEMR
tHwjQvIiaVRJl/KiUG3RNEEQYmUpkcCUFEAtNipUNQTTL31XrDbKPGEGEyJkyC30
rGU/XqEAZqPFJuvxlO9j7FMi4FYIchT3nH8n03NdxNN+Q512nUBsHE/n8h2JPdmr
6e5oH+5wlcHydJbsNvo6quMnzc7j2PXWu5FTkXoNAoGBAJzyETWV2AFlJaHuN4of
uZWQXZkIAVHgAGBBYPZcYiEEF1oE2UxYkN+DyFvyZQXM0qBXQVZJTnlHyDXoy6c2
37UQg0WdoW1DAQERij3hnh2l/rc0jjk9OdYekS+X3Gf0jrDvfpucuRHWeHiiDvcc
cTiGW6Q0kdeJbxb/ThatOFr7
-----END PRIVATE KEY-----`

const auth = new google.auth.JWT({
  email: "poland-trip-drive@silent-album-493520-v7.iam.gserviceaccount.com",
  key: PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/drive"],
})

const drive = google.drive({ version: "v3", auth })

async function folderExists(name) {
  const res = await drive.files.list({
    q: `name='${name}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  })
  return res.data.files?.length > 0
}

async function createFolder(name) {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  })
  return res.data.id
}

async function main() {
  const entries = Object.entries(students)
  console.log(`יוצר ${entries.length} תיקיות...`)

  for (const [id, name] of entries) {
    const folderName = `${id} - ${name}`
    const exists = await folderExists(folderName)
    if (exists) {
      console.log(`קיים    ${folderName}`)
    } else {
      await createFolder(folderName)
      console.log(`נוצר    ${folderName}`)
    }
  }

  console.log("\nסיום!")
}

main().catch(console.error)
