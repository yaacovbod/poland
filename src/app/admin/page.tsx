"use client"

import { useState, useEffect } from "react"
import { ScheduleDay } from "../api/admin/schedule/route"
import { PdfItem } from "../api/pdfs/route"

type AdminTab = "students" | "pdfs" | "schedule"

const G = {
  bg: "#faf5f0",
  surface: "#ffffff",
  surfaceHover: "#f7f0eb",
  border: "rgba(181,101,118,0.2)",
  borderStrong: "rgba(181,101,118,0.4)",
  gold: "#b56576",
  goldDim: "rgba(181,101,118,0.1)",
  text: "#3d2b2b",
  muted: "#7a5c5c",
  dim: "#a08080",
  danger: "#c0392b",
  dangerBg: "rgba(192,57,43,0.08)",
  dangerBorder: "rgba(192,57,43,0.25)",
  success: "#3a7a55",
  successBg: "rgba(90,138,106,0.1)",
  successBorder: "rgba(90,138,106,0.3)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0d0d0d",
  border: `1px solid ${G.border}`,
  borderRadius: "3px",
  padding: "0.65rem 0.9rem",
  color: G.text,
  fontSize: "0.88rem",
  textAlign: "right",
  outline: "none",
  fontFamily: "inherit",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  color: G.gold,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: "0.4rem",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function GoldButton({ children, type = "button", onClick, danger, small }: {
  children: React.ReactNode
  type?: "button" | "submit"
  onClick?: () => void
  danger?: boolean
  small?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: danger
          ? (hover ? G.danger : "transparent")
          : (hover ? G.gold : "transparent"),
        border: `1px solid ${danger ? G.danger : G.gold}`,
        color: danger
          ? (hover ? "#111" : G.danger)
          : (hover ? "#111" : G.gold),
        padding: small ? "0.35rem 0.75rem" : "0.6rem 1.25rem",
        borderRadius: "3px",
        fontSize: small ? "0.72rem" : "0.82rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontFamily: "inherit",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </button>
  )
}

function StatusMsg({ msg, isError }: { msg: string; isError?: boolean }) {
  if (!msg) return null
  return (
    <div style={{
      padding: "0.6rem 0.9rem",
      borderRadius: "3px",
      fontSize: "0.82rem",
      border: `1px solid ${isError ? G.dangerBorder : G.successBorder}`,
      background: isError ? G.dangerBg : G.successBg,
      color: isError ? G.danger : G.success,
      marginTop: "0.75rem",
    }}>
      {msg}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: G.surface,
      border: `1px solid ${G.border}`,
      borderRadius: "4px",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "0.75rem 1.25rem",
        borderBottom: `1px solid ${G.border}`,
        background: G.goldDim,
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
      }}>
        <div style={{ width: "3px", height: "14px", background: G.gold, borderRadius: "2px", flexShrink: 0 }} />
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: G.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "1.25rem" }}>
        {children}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [activeTab, setActiveTab] = useState<AdminTab>("students")

  const [students, setStudents] = useState<Record<string, string>>({})
  const [newStudentId, setNewStudentId] = useState("")
  const [newStudentName, setNewStudentName] = useState("")
  const [studentMsg, setStudentMsg] = useState("")

  const [pdfs, setPdfs] = useState<PdfItem[]>([])
  const [pdfName, setPdfName] = useState("")
  const [pdfDesc, setPdfDesc] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfMsg, setPdfMsg] = useState("")

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
      setStudentMsg("התלמיד נוסף בהצלחה")
      setNewStudentId("")
      setNewStudentName("")
      loadAll()
    } else {
      setStudentMsg("שגיאה בהוספה")
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
      setPdfMsg("הקובץ הועלה בהצלחה")
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
      setScheduleMsg("היום נוסף בהצלחה")
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

  /* ── Login Screen ── */
  if (!authenticated) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh",
        background: G.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "360px",
          background: G.surface,
          border: `1px solid ${G.border}`,
          borderRadius: "4px",
          overflow: "hidden",
        }}>
          {/* Login header */}
          <div style={{
            padding: "1.5rem",
            borderBottom: `1px solid ${G.border}`,
            background: G.goldDim,
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: G.gold, marginBottom: "0.4rem", textTransform: "uppercase" }}>
              מסע לפולין
            </div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: G.text, margin: 0 }}>
              ממשק ניהול
            </h1>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Field label="סיסמת מנהל">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  required
                />
              </Field>
              {authError && (
                <StatusMsg msg={authError} isError />
              )}
              <GoldButton type="submit">כניסה למערכת</GoldButton>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: "students", label: "תלמידים", count: Object.keys(students).length },
    { id: "pdfs", label: "טפסים", count: pdfs.length },
    { id: "schedule", label: 'לו"ז', count: schedule.length },
  ]

  /* ── Main Admin ── */
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: G.bg, color: G.text }}>

      {/* Header */}
      <header style={{
        background: "#ede3d8",
        borderBottom: `1px solid ${G.border}`,
        padding: "0.9rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: G.gold,
          }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: G.text, letterSpacing: "0.05em" }}>
            ממשק ניהול
          </span>
          <span style={{ fontSize: "0.72rem", color: G.dim }}>מסע לפולין</span>
        </div>
        <a href="/" style={{
          fontSize: "0.75rem",
          color: G.muted,
          textDecoration: "none",
          letterSpacing: "0.05em",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          ← לדשבורד התלמידים
        </a>
      </header>

      {/* Tabs */}
      <nav style={{
        background: "#ede3d8",
        borderBottom: `1px solid ${G.border}`,
        display: "flex",
        padding: "0 1.5rem",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.85rem 1.25rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: activeTab === tab.id ? G.gold : G.dim,
              borderBottom: activeTab === tab.id ? `2px solid ${G.gold}` : "2px solid transparent",
              transition: "all 0.15s",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                background: activeTab === tab.id ? G.goldDim : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeTab === tab.id ? G.border : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                padding: "0 0.45rem",
                fontSize: "0.65rem",
                color: activeTab === tab.id ? G.gold : G.dim,
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* ── תלמידים ── */}
        {activeTab === "students" && (
          <>
            <SectionCard title="הוספת תלמיד">
              <form onSubmit={addStudent} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{ flex: "0 0 160px" }}>
                    <Field label="מספר ת.ז">
                      <input
                        type="text"
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value)}
                        placeholder="123456789"
                        maxLength={9}
                        style={inputStyle}
                        required
                      />
                    </Field>
                  </div>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <Field label="שם מלא">
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="ישראל ישראלי"
                        style={inputStyle}
                        required
                      />
                    </Field>
                  </div>
                </div>
                <div>
                  <GoldButton type="submit">הוסף תלמיד</GoldButton>
                </div>
                <StatusMsg msg={studentMsg} isError={studentMsg === "שגיאה בהוספה"} />
              </form>
            </SectionCard>

            <SectionCard title={`רשימת תלמידים (${Object.keys(students).length})`}>
              {Object.keys(students).length === 0 ? (
                <p style={{ color: G.dim, fontSize: "0.85rem" }}>אין תלמידים רשומים</p>
              ) : (
                <div>
                  {/* Table header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr auto",
                    gap: "0.75rem",
                    padding: "0.4rem 0.75rem",
                    borderBottom: `1px solid ${G.border}`,
                    marginBottom: "0.25rem",
                  }}>
                    {["ת.ז", "שם", ""].map((h, i) => (
                      <span key={i} style={{ fontSize: "0.65rem", fontWeight: 700, color: G.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {h}
                      </span>
                    ))}
                  </div>
                  {Object.entries(students).map(([id, name]) => (
                    <div
                      key={id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr auto",
                        gap: "0.75rem",
                        alignItems: "center",
                        padding: "0.6rem 0.75rem",
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      }}
                    >
                      <span style={{ fontSize: "0.82rem", color: G.muted, fontFamily: "monospace" }}>{id}</span>
                      <span style={{ fontSize: "0.88rem", color: G.text, fontWeight: 500 }}>{name}</span>
                      <GoldButton small danger onClick={() => deleteStudent(id)}>מחק</GoldButton>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}

        {/* ── טפסים ── */}
        {activeTab === "pdfs" && (
          <>
            <SectionCard title="העלאת טופס חדש">
              <form onSubmit={uploadPdf} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <Field label="שם הטופס">
                  <input
                    type="text"
                    value={pdfName}
                    onChange={(e) => setPdfName(e.target.value)}
                    placeholder="טופס הצהרת בריאות"
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label="תיאור (אופציונלי)">
                  <input
                    type="text"
                    value={pdfDesc}
                    onChange={(e) => setPdfDesc(e.target.value)}
                    placeholder="הסבר קצר על הטופס"
                    style={inputStyle}
                  />
                </Field>
                <Field label="קובץ PDF">
                  <input
                    id="admin-pdf-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                    style={{ ...inputStyle, color: G.muted }}
                    required
                  />
                </Field>
                <div>
                  <GoldButton type="submit">העלה טופס</GoldButton>
                </div>
                <StatusMsg msg={pdfMsg} isError={pdfMsg.includes("שגיאה")} />
              </form>
            </SectionCard>

            <SectionCard title={`טפסים קיימים (${pdfs.length})`}>
              {pdfs.length === 0 ? (
                <p style={{ color: G.dim, fontSize: "0.85rem" }}>אין טפסים</p>
              ) : (
                <div>
                  {pdfs.map((pdf, i) => (
                    <div
                      key={pdf.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.65rem 0.75rem",
                        borderBottom: i < pdfs.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                        gap: "0.75rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: G.gold, fontSize: "0.7rem" }}>◎</span>
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 500, color: G.text }}>{pdf.name}</div>
                          {pdf.description && (
                            <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "0.1rem" }}>{pdf.description}</div>
                          )}
                        </div>
                      </div>
                      <GoldButton small danger onClick={() => deletePdf(pdf.id)}>מחק</GoldButton>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}

        {/* ── לו"ז ── */}
        {activeTab === "schedule" && (
          <>
            <SectionCard title="הוספת יום למסע">
              <form onSubmit={addScheduleDay} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{ flex: "0 0 160px" }}>
                    <Field label="תאריך">
                      <input
                        type="date"
                        value={newDay.date}
                        onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                        style={{ ...inputStyle, textAlign: "left" }}
                        required
                      />
                    </Field>
                  </div>
                  <div style={{ flex: 1, minWidth: "160px" }}>
                    <Field label="מיקום">
                      <input
                        type="text"
                        value={newDay.location}
                        onChange={(e) => setNewDay({ ...newDay, location: e.target.value })}
                        placeholder="ורשה, קרקוב..."
                        style={inputStyle}
                      />
                    </Field>
                  </div>
                </div>

                <Field label="כותרת היום">
                  <input
                    type="text"
                    value={newDay.title}
                    onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                    placeholder="יום א׳ — הגעה לורשה"
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="פעילויות (שורה לכל פעילות)">
                  <textarea
                    value={newDay.activities}
                    onChange={(e) => setNewDay({ ...newDay, activities: e.target.value })}
                    placeholder={"ביקור באושוויץ\nארוחת צהריים\nסיור בעיר העתיקה"}
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                </Field>

                <div>
                  <GoldButton type="submit">הוסף יום</GoldButton>
                </div>
                <StatusMsg msg={scheduleMsg} isError={scheduleMsg === "שגיאה"} />
              </form>
            </SectionCard>

            <SectionCard title={`לו"ז קיים (${schedule.length} ימים)`}>
              {schedule.length === 0 ? (
                <p style={{ color: G.dim, fontSize: "0.85rem" }}>אין ימים בלו&quot;ז</p>
              ) : (
                <div>
                  {schedule.map((day, i) => (
                    <div
                      key={day.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "0.75rem",
                        borderBottom: i < schedule.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flex: 1 }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: `1px solid ${G.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          color: G.gold,
                          flexShrink: 0,
                          marginTop: "0.1rem",
                        }}>
                          {i + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: G.text }}>{day.title}</div>
                          <div style={{ fontSize: "0.75rem", color: G.muted, marginTop: "0.15rem" }}>
                            {new Date(day.date).toLocaleDateString("he-IL")}
                            {day.location && <span style={{ color: G.gold, marginRight: "0.4rem" }}>· {day.location}</span>}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: G.dim, marginTop: "0.25rem" }}>
                            {day.activities.slice(0, 3).join(" · ")}
                            {day.activities.length > 3 && ` +${day.activities.length - 3}`}
                          </div>
                        </div>
                      </div>
                      <GoldButton small danger onClick={() => deleteScheduleDay(day.id)}>מחק</GoldButton>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}

      </main>
    </div>
  )
}
