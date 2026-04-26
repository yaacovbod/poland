import { NextRequest, NextResponse } from "next/server"
import { readConfigFile, writeConfigFile } from "@/lib/drive"
import scheduleJson from "../../../../../data/schedule.json"

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

async function getSchedule(): Promise<ScheduleDay[]> {
  return readConfigFile<ScheduleDay[]>("schedule.json", scheduleJson)
}

export async function GET() {
  return NextResponse.json(await getSchedule())
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  const day: ScheduleDay = await req.json()
  if (!day.date || !day.title) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 })
  }
  const schedule = await getSchedule()
  const newDay = { ...day, id: Date.now().toString() }
  schedule.push(newDay)
  schedule.sort((a, b) => a.date.localeCompare(b.date))
  await writeConfigFile("schedule.json", schedule)
  return NextResponse.json({ success: true, day: newDay })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 401 })
  }
  const { id } = await req.json()
  const schedule = (await getSchedule()).filter((d) => d.id !== id)
  await writeConfigFile("schedule.json", schedule)
  return NextResponse.json({ success: true })
}
