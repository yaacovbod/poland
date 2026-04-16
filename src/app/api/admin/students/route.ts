import { NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const STUDENTS_FILE = path.join(DATA_DIR, "students.json")

function checkAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD
}

function getStudents(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(STUDENTS_FILE, "utf-8"))
  } catch {
    return {}
  }
}

function saveStudents(students: Record<string, string>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), "utf-8")
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  return NextResponse.json(getStudents())
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }

  const { id, name } = await req.json()
  if (!id || !name) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
  }

  const students = getStudents()
  students[id] = name
  saveStudents(students)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }

  const { id } = await req.json()
  const students = getStudents()
  delete students[id]
  saveStudents(students)
  return NextResponse.json({ success: true })
}
