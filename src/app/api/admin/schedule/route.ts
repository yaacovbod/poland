import { NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const SCHEDULE_FILE = path.join(DATA_DIR, "schedule.json")

function checkAdmin(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD
}

export interface ScheduleDay {
  id: string
  date: string
  title: string
  location: string
  activities: string[]
}

function getSchedule(): ScheduleDay[] {
  try {
    return JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"))
  } catch {
    return []
  }
}

function saveSchedule(schedule: ScheduleDay[]) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2), "utf-8")
}

export async function GET() {
  return NextResponse.json(getSchedule())
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }

  const day: ScheduleDay = await req.json()
  if (!day.date || !day.title) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
  }

  const schedule = getSchedule()
  const newDay = { ...day, id: Date.now().toString() }
  schedule.push(newDay)
  schedule.sort((a, b) => a.date.localeCompare(b.date))
  saveSchedule(schedule)
  return NextResponse.json({ success: true, day: newDay })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }

  const { id } = await req.json()
  const schedule = getSchedule().filter((d) => d.id !== id)
  saveSchedule(schedule)
  return NextResponse.json({ success: true })
}
