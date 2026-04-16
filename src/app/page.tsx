"use client"

import { useState, useEffect } from "react"
import { ScheduleDay } from "./api/admin/schedule/route"
import { PdfItem } from "./api/pdfs/route"

type Tab = "schedule" | "download" | "upload" | "payment" | "prep"

/* ─── נתוני הכנה למסע ─── */
type Topic = { title: string; desc: string }
type PrepSession = {
  num: number
  title: string
  date: string
  dayOfWeek: string
  time?: string
  leader?: string
  topics: Topic[]
}
type PrepDayGroup = {
  kind: "day"
  groupTitle: string
  date: string
  dayOfWeek: string
  sessions: PrepSession[]
}
type PrepSingle = { kind: "single"; session: PrepSession }
type PrepSpecial = {
  kind: "special"
  title: string
  dateLabel: string
  dayOfWeek?: string
  time?: string
  leader?: string
  duration?: string
  topics: Topic[]
}
type PrepBlock = PrepSingle | PrepDayGroup | PrepSpecial

const PREP: PrepBlock[] = [
  {
    kind: "single",
    session: {
      num: 1,
      title: "פתיחה וגיבוש המשלחת",
      date: "03/06/2026",
      dayOfWeek: "יום רביעי",
      time: "15:00-16:30",
      leader: "אדר",
      topics: [
        { title: "תיאום ציפיות", desc: "בירור הפחדים, התקוות והשאיפות האישיות של כל חבר במשלחת." },
        { title: "זהות יהודית", desc: "דיון עומק בשאלת השייכות והקשר האישי להיסטוריה היהודית." },
        { title: "אמנת משלחת", desc: "יצירת מסמך הסכמות משותף לגבי אופי ההתנהלות במסע." },
        { title: "גבולות", desc: "הגדרת חוקים ברורים ונהלי התנהגות מצופים." },
      ],
    },
  },
  {
    kind: "single",
    session: {
      num: 2,
      title: "החיים היהודיים בפולין — חלק א",
      date: "07/06/2026",
      dayOfWeek: "יום ראשון",
      time: "13:00-14:30",
      leader: "יעקב",
      topics: [
        { title: "שורשים", desc: "סקירה של ההיסטוריה המוקדמת וההתיישבות הראשונית." },
        { title: "מרכז עולם", desc: "ניתוח הגורמים שהפכו את פולין למוקד היהדות העולמי." },
        { title: "עושר רוחני", desc: "דגש מיוחד על עולם הישיבות, פסיקת ההלכה והפריחה התורנית." },
      ],
    },
  },
  {
    kind: "single",
    session: {
      num: 3,
      title: "החיים היהודיים בפולין — חלק ב",
      date: "10/06/2026",
      dayOfWeek: "יום רביעי",
      time: "15:00-17:30",
      leader: "יעקב",
      topics: [
        { title: "חברה בתמורות", desc: "בחינת הקהילה היהודית במאות ה-19 וה-20." },
        { title: "זרמים וקונפליקטים", desc: "המתח והשילוב בין עולם החסידות לתנועת ההשכלה." },
        { title: "פוליטיקה יהודית", desc: "היכרות עם התנועה הציונית, תנועת הבונד והתארגנויות פוליטיות אחרות." },
      ],
    },
  },
  {
    kind: "single",
    session: {
      num: 4,
      title: "רקע היסטורי — מלחמת העולם השנייה",
      date: "23/06/2026",
      dayOfWeek: "יום שלישי",
      time: "15:00-17:30",
      topics: [
        { title: "אירופה המשתנה", desc: "סקירת המצב הפוליטי והחברתי בין שתי מלחמות העולם." },
        { title: "עליית הנאציזם", desc: "ניתוח הדרכים שבהן היטלר והמפלגה הנאצית תפסו את השלטון." },
        { title: "אידאולוגיה", desc: "הבנת עקרונות תורת הגזע והשקפת העולם הגרמנית באותה תקופה." },
        { title: "אנטישמיות מודרנית", desc: "בחינת השוני בין שנאת ישראל המסורתית לאנטישמיות הגזענית." },
      ],
    },
  },
  {
    kind: "day",
    groupTitle: "בוקר עיון 1",
    date: "28/06/2026",
    dayOfWeek: "יום ראשון",
    sessions: [
      {
        num: 5,
        title: "דילמות ערכיות בשואה — חלק א",
        date: "28/06/2026",
        dayOfWeek: "יום ראשון",
        time: "09:00-10:30",
        leader: "אדר",
        topics: [
          { title: "מוסר בקצה", desc: "דיון בנושא \"בחירה מול הישרדות\" וההבדל ביניהם בתנאי גטו ומחנה." },
          { title: "חסידי אומות עולם", desc: "היכרות עם דמויות שבחרו לפעול למען הזולת תוך סיכון חיים." },
          { title: "הספקטרום המוסרי", desc: "דיון על אדישות חברתית לעומת מעורבות פעילה." },
        ],
      },
      {
        num: 6,
        title: "דילמות ערכיות בשואה — חלק ב",
        date: "28/06/2026",
        dayOfWeek: "יום ראשון",
        time: "10:45-12:15",
        leader: "אדר",
        topics: [
          { title: "המשך העמקה", desc: "ניתוח מקרי בוחן נוספים של התמודדות אנושית במצבי קיצון." },
          { title: "היבטים קבוצתיים", desc: "כיצד הדילמות הללו רלוונטיות לערכים שאנו לוקחים איתנו למסע." },
        ],
      },
    ],
  },
  {
    kind: "day",
    groupTitle: "בוקר עיון 2",
    date: "29/06/2026",
    dayOfWeek: "יום שני",
    sessions: [
      {
        num: 7,
        title: "מהלכי המלחמה (סקירה תמציתית)",
        date: "29/06/2026",
        dayOfWeek: "יום שני",
        time: "09:00-10:30",
        leader: "יעקב",
        topics: [
          { title: "פרוץ המלחמה", desc: "הנסיבות המדיניות והצבאיות שהובילו לתחילת הקרבות." },
          { title: "כיבושים", desc: "שלבי ההשתלטות של גרמניה על אירופה." },
          { title: "נקודות מפנה", desc: "האירועים המכריעים ששינו את מאזן הכוחות." },
          { title: "שחרור וסיום", desc: "המהלכים האחרונים שהובילו לסיום המלחמה ב-1945." },
        ],
      },
      {
        num: 8,
        title: "השואה בתוך המלחמה (סקירה תמציתית)",
        date: "29/06/2026",
        dayOfWeek: "יום שני",
        time: "10:45-12:15",
        leader: "יעקב",
        topics: [
          { title: "חקיקה ובידוד", desc: "מהחוקים האנטי-יהודיים ועד הנישול הכלכלי והחברתי." },
          { title: "הגטאות", desc: "הקמת הגטאות והחיים בתוכם כשלב מעבר." },
          { title: "הפתרון הסופי", desc: "תחילת ההשמדה ההמונית והקמת מחנות המוות." },
          { title: "התנגדות ושחרור", desc: "מרד הגטאות, לחימת פרטיזנים והמפגש עם כוחות השחרור." },
        ],
      },
    ],
  },
  {
    kind: "special",
    title: 'סמינר במכון "משואה"',
    dateLabel: "06-07/09/2026",
    dayOfWeek: "יום ראשון-שני",
    duration: "15 שעות",
    topics: [
      { title: "יום עיון אינטנסיבי", desc: "הכולל היבטים רגשיים, חברתיים והיסטוריים." },
      { title: "פעילות חווייתית", desc: "המכינה את הקבוצה לקראת היציאה הפיזית." },
    ],
  },
  {
    kind: "special",
    title: "מפגש הכנה רגשית",
    dateLabel: "16/09/2026",
    dayOfWeek: "יום רביעי",
    time: "אחרי הצהריים",
    leader: "נטלי",
    duration: "3 שעות",
    topics: [
      { title: "כלים רגשיים", desc: "מתן כלים להתמודדות עם העומס הרגשי הצפוי במהלך הביקורים באתרים." },
      { title: "מעגלי תמיכה", desc: "יצירת מעגלי תמיכה פנים קבוצתיים." },
    ],
  },
  {
    kind: "special",
    title: "מפגש הכנת טקסים",
    dateLabel: "16/09/2026",
    dayOfWeek: "יום רביעי",
    leader: "אדר",
    duration: "3 שעות",
    topics: [
      { title: "תכנון הטקסים", desc: "תכנון הטקסים שייערכו באתרים השונים בפולין." },
      { title: "חלוקת תפקידים", desc: "בחירת שירים וקטעי קריאה המייצגים את הקבוצה." },
    ],
  },
  {
    kind: "special",
    title: 'שיחת ביטחון ונהלים (קב"ט)',
    dateLabel: "04/10/2026",
    dayOfWeek: "יום ראשון",
    duration: "שעתיים",
    topics: [
      { title: "נהלי ביטחון", desc: "מתן הנחיות ביטחון קפדניות להתנהלות בחו\"ל." },
      { title: "סגירת קצוות לוגיסטיים", desc: "סגירת קצוות לוגיסטיים אחרונים לפני היציאה לנמל התעופה." },
    ],
  },
  {
    kind: "special",
    title: "מפגש הורים לקראת היציאה למסע",
    dateLabel: "08/10/2026",
    dayOfWeek: "יום חמישי",
    duration: "שעתיים",
    topics: [
      { title: "שותפות ההורים", desc: "הצגת מטרות המסע והתהליך החינוכי שהתלמידים עברו." },
      { title: "עדכונים לוגיסטיים", desc: "פירוט מסלול הטיסה, רשימת ציוד וסדרי תקשורת." },
      { title: "ביטחון ובטיחות", desc: "סקירת נהלי הביטחון והנחיות הקב\"ט להורים." },
      { title: "מענה רגשי", desc: "כיצד ההורים יכולים לתמוך בילדיהם לפני ובמהלך המסע." },
    ],
  },
]

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
    { id: "prep", label: "הכנה למסע", icon: "◐" },
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
            <EmptyState icon="◈" text='לו"ז המסע יתפרסם בקרוב' />
          </div>
        )}

        {/* הכנה למסע */}
        {activeTab === "prep" && (
          <div>
            <SectionTitle>הכנה למסע — מחזור ג</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {PREP.map((block, bi) => {
                if (block.kind === "single") {
                  return <PrepSessionCard key={bi} session={block.session} />
                }
                if (block.kind === "day") {
                  return (
                    <div key={bi} style={{
                      border: "1px solid rgba(201,168,76,0.3)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      background: "#1a1710",
                    }}>
                      {/* Day group header */}
                      <div style={{
                        background: "rgba(201,168,76,0.12)",
                        borderBottom: "1px solid rgba(201,168,76,0.25)",
                        padding: "0.65rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#c9a84c" }}>{block.groupTitle}</span>
                        <span style={{ fontSize: "0.75rem", color: "#9a8f7a" }}>{block.dayOfWeek} · {block.date}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {block.sessions.map((s, si) => (
                          <div key={si} style={{ borderBottom: si < block.sessions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                            <PrepSessionCard session={s} nested />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                // special
                return (
                  <div key={bi} className="memory-card" style={{
                    background: "#1a1710",
                    border: "1px solid rgba(201,168,76,0.2)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      padding: "0.75rem 1.25rem",
                      borderBottom: "1px solid rgba(201,168,76,0.15)",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "0.5rem 1rem",
                    }}>
                      <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#f5f0e8" }}>{block.title}</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.75rem", fontSize: "0.72rem", color: "#9a8f7a" }}>
                        {block.dayOfWeek && <span>{block.dayOfWeek}</span>}
                        <span style={{ color: "#c9a84c" }}>· {block.dateLabel}</span>
                        {block.time && <span>· {block.time}</span>}
                        {block.leader && <span>· הובלה: {block.leader}</span>}
                        {block.duration && <span>· {block.duration}</span>}
                      </div>
                    </div>
                    <ul style={{ padding: "0.75rem 1.25rem", margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      {block.topics.map((t, ti) => (
                        <li key={ti} style={{ display: "flex", gap: "0.6rem", fontSize: "0.84rem", color: "#c8bfad", alignItems: "flex-start" }}>
                          <span style={{ color: "#c9a84c", fontSize: "0.45rem", marginTop: "0.45rem", flexShrink: 0 }}>◆</span>
                          <span><strong style={{ color: "#e8c97a", fontWeight: 600 }}>{t.title}:</strong> {t.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
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

function PrepSessionCard({ session, nested }: { session: PrepSession; nested?: boolean }) {
  return (
    <div className={nested ? "" : "memory-card"} style={{
      background: nested ? "transparent" : "#1a1710",
      border: nested ? "none" : "1px solid rgba(201,168,76,0.2)",
      borderRadius: nested ? 0 : "4px",
      overflow: "hidden",
    }}>
      {/* Session header */}
      <div style={{
        padding: nested ? "0.7rem 1.25rem" : "0.75rem 1.25rem",
        borderBottom: "1px solid rgba(201,168,76,0.12)",
        background: nested ? "rgba(255,255,255,0.02)" : "rgba(201,168,76,0.07)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.5rem 0.9rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "3px",
            padding: "0.1rem 0.45rem",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "#c9a84c",
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}>
            {session.num}
          </span>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f5f0e8" }}>{session.title}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 0.65rem", fontSize: "0.72rem", color: "#9a8f7a" }}>
          <span>{session.dayOfWeek}</span>
          <span style={{ color: "#6b6355" }}>·</span>
          <span>{session.date}</span>
          {session.time && <><span style={{ color: "#6b6355" }}>·</span><span style={{ color: "#c9a84c" }}>{session.time}</span></>}
          {session.leader && <><span style={{ color: "#6b6355" }}>·</span><span>הובלה: {session.leader}</span></>}
        </div>
      </div>
      {/* Topics */}
      <ul style={{ padding: "0.7rem 1.25rem", margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {session.topics.map((t, i) => (
          <li key={i} style={{ display: "flex", gap: "0.6rem", fontSize: "0.84rem", color: "#c8bfad", alignItems: "flex-start" }}>
            <span style={{ color: "#c9a84c", fontSize: "0.45rem", marginTop: "0.45rem", flexShrink: 0 }}>◆</span>
            <span><strong style={{ color: "#e8c97a", fontWeight: 600 }}>{t.title}:</strong> {t.desc}</span>
          </li>
        ))}
      </ul>
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
