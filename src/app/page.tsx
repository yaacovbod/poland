"use client"

import { useState, useEffect } from "react"
import { ScheduleDay } from "./api/admin/schedule/route"
import { PdfItem } from "./api/pdfs/route"

type Tab = "schedule" | "download" | "upload" | "payment"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule")
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [pdfs, setPdfs] = useState<PdfItem[]>([])

  // Upload state
  const [studentId, setStudentId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "idle" | "loading" | "success" | "error"
    message: string
  }>({ type: "idle", message: "" })

  useEffect(() => {
    fetch("/api/admin/schedule").then((r) => r.json()).then(setSchedule).catch(() => {})
    fetch("/api/pdfs").then((r) => r.json()).then(setPdfs).catch(() => {})
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId.trim() || !file) return

    setUploadStatus({ type: "loading", message: "מעלה קובץ..." })

    const formData = new FormData()
    formData.append("studentId", studentId.trim())
    formData.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()

    if (res.ok) {
      setUploadStatus({ type: "success", message: data.message })
      setStudentId("")
      setFile(null)
      const input = document.getElementById("file-input") as HTMLInputElement
      if (input) input.value = ""
    } else {
      setUploadStatus({ type: "error", message: data.error })
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "schedule", label: 'לו"ז המסע', icon: "📅" },
    { id: "download", label: "הורדת טפסים", icon: "📄" },
    { id: "upload", label: "העלאת טפסים", icon: "📤" },
    { id: "payment", label: "תשלום", icon: "💳" },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-2">🇵🇱</div>
          <h1 className="text-3xl font-bold mb-1">מסע לפולין</h1>
          <p className="text-blue-200 text-sm">פורטל מידע לתלמידים והורים</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-700 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-blue-700 hover:bg-gray-50"
              }`}
            >
              <span className="ml-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* לו"ז */}
        {activeTab === "schedule" && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-6">לוח זמנים - מסע לפולין</h2>
            {schedule.length === 0 ? (
              <p className="text-gray-500 text-center py-12">הלו&quot;ז יתפרסם בקרוב</p>
            ) : (
              <div className="space-y-4">
                {schedule.map((day, index) => (
                  <div key={day.id} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                    <div className="bg-blue-800 text-white px-5 py-3 flex items-center gap-3">
                      <span className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold">{day.title}</div>
                        <div className="text-blue-200 text-xs">
                          {new Date(day.date).toLocaleDateString("he-IL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {day.location && ` | ${day.location}`}
                        </div>
                      </div>
                    </div>
                    <ul className="px-5 py-3 space-y-1">
                      {day.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 text-sm py-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* הורדת טפסים */}
        {activeTab === "download" && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-6">טפסים להורדה</h2>
            {pdfs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-500">הטפסים יועלו בקרוב</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pdfs.map((pdf) => (
                  <div key={pdf.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">📄</span>
                      <div>
                        <div className="font-semibold text-gray-800">{pdf.name}</div>
                        {pdf.description && (
                          <div className="text-sm text-gray-500">{pdf.description}</div>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/pdfs/${pdf.filename}`}
                      download
                      className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      הורדה
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* העלאת טפסים */}
        {activeTab === "upload" && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">העלאת טפסים</h2>
            <p className="text-gray-500 mb-6 text-sm">הכנס את מספר הת.ז שלך ובחר את הקובץ להעלאה. הקובץ יישמר בתיקייה האישית שלך.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מספר תעודת זהות
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="הכנס ת.ז"
                    maxLength={9}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    בחר קובץ להעלאה
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">קבצים מותרים: PDF, תמונות, Word</p>
                </div>

                {uploadStatus.type !== "idle" && (
                  <div
                    className={`rounded-lg px-4 py-3 text-sm ${
                      uploadStatus.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : uploadStatus.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {uploadStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadStatus.type === "loading"}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {uploadStatus.type === "loading" ? "מעלה..." : "העלה קובץ"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* תשלום */}
        {activeTab === "payment" && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-6">תשלום</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">מערכת התשלום</h3>
              <p className="text-gray-400">קישור לתשלום יפורסם בקרוב</p>
            </div>
          </div>
        )}

      </main>

      <footer className="text-center text-xs text-gray-400 py-6 mt-8">
        מסע לפולין | לפרטים פנה למורה המלווה
      </footer>
    </div>
  )
}
