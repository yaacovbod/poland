import { NextRequest, NextResponse } from "next/server"
import { readConfigFile, writeConfigFile } from "@/lib/drive"
import studentsJson from "../../../../../data/students.json"

function checkAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD
}

async function getStudents(): Promise<Record<string, string>> {
  return readConfigFile<Record<string, string>>("students.json", studentsJson)
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  return NextResponse.json(await getStudents())
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  const { id, name } = await req.json()
  if (!id || !name) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
  }
  try {
    const students = await getStudents()
    students[id] = name
    await writeConfigFile("students.json", students)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("students POST error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  const { id } = await req.json()
  const students = await getStudents()
  delete students[id]
  await writeConfigFile("students.json", students)
  return NextResponse.json({ success: true })
}
