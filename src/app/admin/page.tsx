"use client"

import { useState, useEffect } from "react"
import { ScheduleDay } from "../api/admin/schedule/route"
import { PdfItem } from "../api/pdfs/route"

type AdminTab = "students" | "pdfs" | "schedule"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [activeTab, setActiveTab] = useState<AdminTab>("students")

  // Students
  const [students, setStudents] = useState<Record<string, string>>({})
  const [newStudentId, setNewStudentId] = useState("")
  const [newStudentName, setNewStudentName] = useState("")
  const [studentMsg, setStudentMsg] = useState("")

  // PDFs
  const [pdfs, setPdfs] = useState<PdfItem[]>([])
  const [pdfName, setPdfName] = useState("")
  const [pdfDesc, setPdfDesc] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfMsg, setPdfMsg] = useState("")

  // Schedule
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [newDay, setNewDay] = useState({ date: "", title: "", location: "", activities: "" })
  const [scheduleMsg, setScheduleMsg] = useState("")

  function headers() {
    return { "x-admin-password": password }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/students", { headers: headers() })
    if (res.ok) {
      const data = await res.json()
      setStudents(data)
      setAuthenticated(true)
      loadAll()
    } else {
      setAuthError("סיסמה שגויה")
    }
  }

  async function loadAll() {
    const [studRes, pdfRes, schRes] = await Promise.all([
      fetch("/api/admin/students", { headers: headers() }),
      fetch("/api/pdfs"),
      fetch("/api/admin/schedule"),
    ])
    if (studRes.ok) setStudents(await studRes.json())
    if (pdfRes.ok) setPdfs(await pdfRes.json())
    if (schRes.ok) setSchedule(await schRes.json())
  }

  useEffect(() => {
    if (authenticated) loadAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated])

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ id: newStudentId, name: newStudentName }),
    })
    if (res.ok) {
      setStudentMsg("התלמיד נוסף")
      setNewStudentId("")
      setNewStudentName("")
      loadAll()
    } else {
      setStudentMsg("שגיאה")
    }
  }

  async function deleteStudent(id: string) {
    await fetch("/api/admin/students", {
      method: "DELETE",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadAll()
  }

  async function uploadPdf(e: React.FormEvent) {
    e.preventDefault()
    if (!pdfFile) return
    const formData = new FormData()
    formData.append("name", pdfName)
    formData.append("description", pdfDesc)
    formData.append("file", pdfFile)
    const res = await fetch("/api/admin/pdfs", {
      method: "POST",
      headers: headers(),
      body: formData,
    })
    if (res.ok) {
      setPdfMsg("הקובץ הועלה")
      setPdfName("")
      setPdfDesc("")
      setPdfFile(null)
      const input = document.getElementById("admin-pdf-input") as HTMLInputElement
      if (input) input.value = ""
      loadAll()
    } else {
      setPdfMsg("שגיאה בהעלאה")
    }
  }

  async function deletePdf(id: string) {
    await fetch("/api/admin/pdfs", {
      method: "DELETE",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadAll()
  }

  async function addScheduleDay(e: React.FormEvent) {
    e.preventDefault()
    const activities = newDay.activities
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean)
    const res = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ ...newDay, activities }),
    })
    if (res.ok) {
      setScheduleMsg("היום נוסף")
      setNewDay({ date: "", title: "", location: "", activities: "" })
      loadAll()
    } else {
      setScheduleMsg("שגיאה")
    }
  }

  async function deleteScheduleDay(id: string) {
    await fetch("/api/admin/schedule", {
      method: "DELETE",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    loadAll()
  }

  if (!authenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">ממשק ניהול</h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמת מנהל"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg"
            >
              כניסה
            </button>
          </form>
        </div>
      </div>
    )
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "students", label: "תלמידים" },
    { id: "pdfs", label: "טפסים" },
    { id: "schedule", label: 'לו"ז' },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ממשק ניהול - מסע לפולין</h1>
        <a href="/" className="text-blue-200 hover:text-white text-sm">
          לדשבורד התלמידים
        </a>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-blue-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* תלמידים */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">הוספת תלמיד</h2>
              <form onSubmit={addStudent} className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="מספר ת.ז"
                  maxLength={9}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-right flex-1 min-w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="שם מלא"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-right flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium"
                >
                  הוסף
                </button>
              </form>
              {studentMsg && <p className="text-green-600 text-sm mt-2">{studentMsg}</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                רשימת תלמידים ({Object.keys(students).length})
              </h2>
              {Object.keys(students).length === 0 ? (
                <p className="text-gray-400 text-sm">אין תלמידים</p>
              ) : (
                <div className="divide-y">
                  {Object.entries(students).map(([id, name]) => (
                    <div key={id} className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium">{name}</span>
                        <span className="text-gray-400 text-sm mr-3">{id}</span>
                      </div>
                      <button
                        onClick={() => deleteStudent(id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        מחק
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* טפסים */}
        {activeTab === "pdfs" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">העלאת טופס חדש</h2>
              <form onSubmit={uploadPdf} className="space-y-3">
                <input
                  type="text"
                  value={pdfName}
                  onChange={(e) => setPdfName(e.target.value)}
                  placeholder="שם הטופס"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  value={pdfDesc}
                  onChange={(e) => setPdfDesc(e.target.value)}
                  placeholder="תיאור קצר (אופציונלי)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  id="admin-pdf-input"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium"
                >
                  העלה טופס
                </button>
              </form>
              {pdfMsg && <p className="text-green-600 text-sm mt-2">{pdfMsg}</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">טפסים קיימים</h2>
              {pdfs.length === 0 ? (
                <p className="text-gray-400 text-sm">אין טפסים</p>
              ) : (
                <div className="divide-y">
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between py-3">
                      <div>
                        <span className="font-medium">{pdf.name}</span>
                        {pdf.description && (
                          <span className="text-gray-400 text-sm mr-3">{pdf.description}</span>
                        )}
                      </div>
                      <button
                        onClick={() => deletePdf(pdf.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        מחק
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* לו"ז */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">הוספת יום למסע</h2>
              <form onSubmit={addScheduleDay} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={newDay.date}
                    onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={newDay.location}
                    onChange={(e) => setNewDay({ ...newDay, location: e.target.value })}
                    placeholder="מיקום (ורשה, קרקוב...)"
                    className="border border-gray-300 rounded-lg px-4 py-2 text-right flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={newDay.title}
                  onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                  placeholder="כותרת היום"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  value={newDay.activities}
                  onChange={(e) => setNewDay({ ...newDay, activities: e.target.value })}
                  placeholder={'פעילויות - שורה לכל פעילות\nלמשל:\nביקור באושוויץ\nארוחת צהריים\nסיור בעיר'}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium"
                >
                  הוסף יום
                </button>
              </form>
              {scheduleMsg && <p className="text-green-600 text-sm mt-2">{scheduleMsg}</p>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">לו&quot;ז קיים</h2>
              {schedule.length === 0 ? (
                <p className="text-gray-400 text-sm">אין ימים</p>
              ) : (
                <div className="divide-y">
                  {schedule.map((day) => (
                    <div key={day.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{day.title}</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(day.date).toLocaleDateString("he-IL")}
                          {day.location && ` | ${day.location}`}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {day.activities.join(" · ")}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteScheduleDay(day.id)}
                        className="text-red-500 hover:text-red-700 text-sm shrink-0"
                      >
                        מחק
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
