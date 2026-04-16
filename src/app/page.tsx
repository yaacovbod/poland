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
    { id: "schedule", label: 'לו"ז המסע', icon: "◈" },
    { id: "download", label: "הורדת טפסים", icon: "◎" },
    { id: "upload", label: "העלאת טפסים", icon: "◉" },
    { id: "payment", label: "תשלום", icon: "◇" },
  ]

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#111111", color: "#f5f0e8", position: "relative" }}>

      {/* Hero Header */}
      <header style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1612 100%)",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
        paddingTop: "3rem",
        paddingBottom: "2.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background text watermark */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12rem",
          fontWeight: 900,
          color: "rgba(201,168,76,0.04)",
          letterSpacing: "-0.05em",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
        }}>
          POLAND
        </div>

        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center", position: "relative" }}>
          {/* Top ornament */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              color: "#c9a84c",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              <span style={{ display: "block", width: "40px", height: "1px", background: "linear-gradient(to right, transparent, #c9a84c)" }} />
              מסע זיכרון
              <span style={{ display: "block", width: "40px", height: "1px", background: "linear-gradient(to left, transparent, #c9a84c)" }} />
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem, 6vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "0.75rem",
            color: "#f5f0e8",
            letterSpacing: "-0.02em",
          }}>
            מסע לפולין
          </h1>

          <div style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(to right, transparent, #c9a84c, transparent)",
            margin: "1rem auto",
          }} />

          <p style={{
            color: "#9a8f7a",
            fontSize: "0.9rem",
            letterSpacing: "0.05em",
            marginBottom: "0",
          }}>
            פורטל מידע לתלמידים והורים
          </p>

          {/* Flag decoration */}
          <div style={{ marginTop: "1.5rem", fontSize: "2rem", opacity: 0.8 }}>🇵🇱</div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: "#0d0d0d",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "1rem 0.5rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: "transparent",
                color: activeTab === tab.id ? "#c9a84c" : "#6b6355",
                borderBottom: activeTab === tab.id ? "2px solid #c9a84c" : "2px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 1.5rem" }} className="tab-content">

        {/* לו"ז */}
        {activeTab === "schedule" && (
          <div>
            <SectionTitle>לוח זמנים</SectionTitle>
            {schedule.length === 0 ? (
              <EmptyState icon="◈" text='הלו"ז יתפרסם בקרוב' />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {schedule.map((day, index) => (
                  <div
                    key={day.id}
                    className="memory-card"
                    style={{
                      background: "#1a1710",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Day header */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.9rem 1.25rem",
                      background: "rgba(201,168,76,0.07)",
                      borderBottom: "1px solid rgba(201,168,76,0.15)",
                    }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: "1px solid #c9a84c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#c9a84c",
                        flexShrink: 0,
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f5f0e8" }}>{day.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9a8f7a", marginTop: "0.1rem" }}>
                          {new Date(day.date).toLocaleDateString("he-IL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {day.location && (
                            <span style={{ color: "#c9a84c", marginRight: "0.5rem" }}>· {day.location}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    <ul style={{ padding: "0.9rem 1.25rem", margin: 0, listStyle: "none" }}>
                      {day.activities.map((act, i) => (
                        <li key={i} style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          padding: "0.35rem 0",
                          fontSize: "0.88rem",
                          color: "#c8bfad",
                          borderBottom: i < day.activities.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}>
                          <span style={{ color: "#c9a84c", fontSize: "0.5rem", marginTop: "0.45rem", flexShrink: 0 }}>◆</span>
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
            <SectionTitle>טפסים להורדה</SectionTitle>
            {pdfs.length === 0 ? (
              <EmptyState icon="◎" text="הטפסים יועלו בקרוב" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="memory-card"
                    style={{
                      background: "#1a1710",
                      border: "1px solid rgba(201,168,76,0.2)",
                      borderRadius: "4px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        border: "1px solid rgba(201,168,76,0.3)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#c9a84c",
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}>
                        ◎
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f5f0e8" }}>{pdf.name}</div>
                        {pdf.description && (
                          <div style={{ fontSize: "0.78rem", color: "#6b6355", marginTop: "0.1rem" }}>{pdf.description}</div>
                        )}
                      </div>
                    </div>
                    <a
                      href={`https://drive.google.com/uc?export=download&id=${pdf.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "transparent",
                        border: "1px solid #c9a84c",
                        color: "#c9a84c",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        padding: "0.45rem 1rem",
                        borderRadius: "3px",
                        textDecoration: "none",
                        letterSpacing: "0.05em",
                        transition: "all 0.2s",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.background = "#c9a84c"
                        ;(e.target as HTMLElement).style.color = "#111"
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.background = "transparent"
                        ;(e.target as HTMLElement).style.color = "#c9a84c"
                      }}
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
            <SectionTitle>העלאת טפסים</SectionTitle>
            <p style={{ color: "#6b6355", fontSize: "0.85rem", marginBottom: "2rem", lineHeight: 1.7 }}>
              הכנס את מספר תעודת הזהות שלך ובחר את הקובץ להעלאה. הקובץ יישמר בתיקייה האישית שלך.
            </p>

            <div style={{
              background: "#1a1710",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "4px",
              padding: "2rem",
              maxWidth: "480px",
            }}>
              <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#c9a84c",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}>
                    מספר תעודת זהות
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="הכנס ת.ז"
                    maxLength={9}
                    style={{
                      width: "100%",
                      background: "#111",
                      border: "1px solid rgba(201,168,76,0.25)",
                      borderRadius: "3px",
                      padding: "0.75rem 1rem",
                      color: "#f5f0e8",
                      fontSize: "0.9rem",
                      textAlign: "right",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#c9a84c")}
                    onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#c9a84c",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}>
                    קובץ להעלאה
                  </label>
                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    style={{
                      width: "100%",
                      background: "#111",
                      border: "1px solid rgba(201,168,76,0.25)",
                      borderRadius: "3px",
                      padding: "0.75rem 1rem",
                      color: "#9a8f7a",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <p style={{ fontSize: "0.72rem", color: "#4a4440", marginTop: "0.4rem" }}>
                    קבצים מותרים: PDF, תמונות, Word
                  </p>
                </div>

                {uploadStatus.type !== "idle" && (
                  <div style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "3px",
                    fontSize: "0.85rem",
                    border: "1px solid",
                    ...(uploadStatus.type === "success"
                      ? { background: "rgba(34,197,94,0.08)", color: "#4ade80", borderColor: "rgba(34,197,94,0.25)" }
                      : uploadStatus.type === "error"
                      ? { background: "rgba(239,68,68,0.08)", color: "#f87171", borderColor: "rgba(239,68,68,0.25)" }
                      : { background: "rgba(201,168,76,0.08)", color: "#c9a84c", borderColor: "rgba(201,168,76,0.25)" }),
                  }}>
                    {uploadStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadStatus.type === "loading"}
                  style={{
                    background: uploadStatus.type === "loading" ? "rgba(201,168,76,0.3)" : "#c9a84c",
                    border: "none",
                    borderRadius: "3px",
                    padding: "0.85rem",
                    color: "#111",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: uploadStatus.type === "loading" ? "not-allowed" : "pointer",
                    letterSpacing: "0.05em",
                    transition: "background 0.2s",
                  }}
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
            <SectionTitle>תשלום</SectionTitle>
            <div style={{
              background: "#1a1710",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "4px",
              padding: "4rem 2rem",
              textAlign: "center",
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                border: "1px solid rgba(201,168,76,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: "#c9a84c",
              }}>
                ◇
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5rem" }}>
                מערכת התשלום
              </h3>
              <p style={{ color: "#4a4440", fontSize: "0.85rem" }}>קישור לתשלום יפורסם בקרוב</p>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "1.5rem",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "0.7rem",
          color: "#3a3530",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          מסע לפולין &nbsp;·&nbsp; לפרטים פנה למורה המלווה
        </div>
      </footer>
    </div>
  )
}

/* ─── Helpers ─── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.2em",
        color: "#c9a84c",
        textTransform: "uppercase",
        marginBottom: "0.4rem",
      }}>
        מסע לפולין
      </div>
      <h2 style={{
        fontSize: "1.6rem",
        fontWeight: 900,
        color: "#f5f0e8",
        lineHeight: 1.2,
        margin: 0,
      }}>
        {children}
      </h2>
      <div style={{
        width: "40px",
        height: "2px",
        background: "#c9a84c",
        marginTop: "0.75rem",
        borderRadius: "1px",
      }} />
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      background: "#1a1710",
      border: "1px solid rgba(201,168,76,0.15)",
      borderRadius: "4px",
      padding: "4rem 2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", color: "rgba(201,168,76,0.3)", marginBottom: "1rem" }}>{icon}</div>
      <p style={{ color: "#4a4440", fontSize: "0.9rem" }}>{text}</p>
    </div>
  )
}
