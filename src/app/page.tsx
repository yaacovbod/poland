"use client"

import { useState, useEffect } from "react"
import { ScheduleDay } from "./api/admin/schedule/route"
import { PdfItem } from "./api/pdfs/route"

/* ─── Ocean Depths Theme ─── */
const T = {
  bg: "#f0f5f9",
  bgDeep: "#e3edf5",
  bgNav: "#d6e6f0",
  surface: "#ffffff",
  surfaceTint: "rgba(14,77,110,0.05)",
  rose: "#1a6b8a",
  roseMid: "#4a9ab5",
  rosePale: "rgba(14,77,110,0.1)",
  border: "rgba(14,77,110,0.18)",
  borderSub: "rgba(14,77,110,0.1)",
  text: "#0d2d3d",
  muted: "#3d6b80",
  dim: "#7aaabb",
  veryDim: "#b0ccd8",
}

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
  const [activeTab, setActiveTab] = useState<Tab>("prep")
  const [pdfs, setPdfs] = useState<PdfItem[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_schedule, _setSchedule] = useState<ScheduleDay[]>([])

  const [studentId, setStudentId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [customFileName, setCustomFileName] = useState("")
  const [uploadStatus, setUploadStatus] = useState<{
    type: "idle" | "loading" | "success" | "error"
    message: string
  }>({ type: "idle", message: "" })

  useEffect(() => {
    fetch("/api/pdfs").then((r) => r.json()).then(setPdfs).catch(() => {})
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId.trim() || !file) return
    setUploadStatus({ type: "loading", message: "מעלה קובץ..." })
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ""
    const baseName = customFileName.trim() || file.name.replace(/\.[^.]+$/, "")
    const finalName = baseName.endsWith(ext) ? baseName : baseName + ext
    const renamedFile = new File([file], finalName, { type: file.type })
    const formData = new FormData()
    formData.append("studentId", studentId.trim())
    formData.append("file", renamedFile)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()
    if (res.ok) {
      setUploadStatus({ type: "success", message: data.message })
      setStudentId("")
      setFile(null)
      setCustomFileName("")
      const input = document.getElementById("file-input") as HTMLInputElement
      if (input) input.value = ""
    } else {
      setUploadStatus({ type: "error", message: data.error })
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "prep", label: "הכנה למסע", icon: "◐" },
    { id: "schedule", label: 'לו"ז המסע', icon: "◈" },
    { id: "download", label: "הורדת טפסים", icon: "◎" },
    { id: "upload", label: "העלאת טפסים", icon: "◉" },
    { id: "payment", label: "תשלום", icon: "◇" },
  ]

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: T.bg, color: T.text }}>

      {/* Hero Header */}
      <header style={{
        background: `linear-gradient(180deg, ${T.bgDeep} 0%, ${T.bgNav} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        paddingTop: "3rem",
        paddingBottom: "2.5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center", position: "relative" }}>

          {/* ציטוט במקום "מסע זיכרון" */}
          <p style={{
            fontFamily: "var(--font-rubik), sans-serif",
            fontSize: "0.9rem",
            color: T.rose,
            letterSpacing: "0.08em",
            marginBottom: "1.25rem",
            marginTop: 0,
          }}>
            את אחיי אנוכי מבקש
          </p>

          {/* כותרת עם לוגו מאחורה */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src="/logo.webp"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                height: "160%",
                width: "auto",
                opacity: 0.07,
                objectFit: "contain",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
            <h1 style={{
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: 0,
              color: T.text,
              fontFamily: "var(--font-rubik-dirt), sans-serif",
              letterSpacing: "0.01em",
              position: "relative",
            }}>
              המסע לפולין
            </h1>
          </div>

          <div style={{
            width: "60px",
            height: "2px",
            background: `linear-gradient(to right, transparent, ${T.rose}, transparent)`,
            margin: "1rem auto",
          }} />

          <p style={{ color: T.muted, fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            פורטל לתלמידי נעימת הלב
          </p>

        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: T.bgNav,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "1rem 0.5rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.03em",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: "transparent",
                color: activeTab === tab.id ? T.rose : T.dim,
                borderBottom: activeTab === tab.id ? `2px solid ${T.rose}` : "2px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "2.5rem 1.5rem" }} className="tab-content">

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
                      border: `1px solid ${T.border}`,
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: T.surface,
                      boxShadow: "0 1px 4px rgba(181,101,118,0.08)",
                    }}>
                      <div style={{
                        background: T.rosePale,
                        borderBottom: `1px solid ${T.border}`,
                        padding: "0.65rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}>
                        <span style={{ fontSize: "0.92rem", fontWeight: 800, color: T.rose }}>{block.groupTitle}</span>
                        <span style={{ fontSize: "0.75rem", color: T.muted }}>{block.dayOfWeek} · {block.date}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {block.sessions.map((s, si) => (
                          <div key={si} style={{ borderBottom: si < block.sessions.length - 1 ? `1px solid ${T.borderSub}` : "none" }}>
                            <PrepSessionCard session={s} nested />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={bi} className="memory-card" style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(181,101,118,0.06)",
                  }}>
                    <div style={{
                      padding: "0.75rem 1.25rem",
                      borderBottom: `1px solid ${T.borderSub}`,
                      background: T.surfaceTint,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "0.5rem 1rem",
                    }}>
                      <span style={{ fontWeight: 700, fontSize: "0.92rem", color: T.text }}>{block.title}</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 0.65rem", fontSize: "0.72rem", color: T.muted }}>
                        {block.dayOfWeek && <span>{block.dayOfWeek}</span>}
                        <span style={{ color: T.rose }}>· {block.dateLabel}</span>
                        {block.time && <span>· {block.time}</span>}
                        {block.leader && <span>· הובלה: {block.leader}</span>}
                        {block.duration && <span>· {block.duration}</span>}
                      </div>
                      <CalendarButtons title={block.title} date={parseSpecialDate(block.dateLabel)} time={block.time} topics={block.topics} />
                    </div>
                    <ul style={{ padding: "0.75rem 1.25rem", margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      {block.topics.map((t, ti) => (
                        <li key={ti} style={{ display: "flex", gap: "0.6rem", fontSize: "0.84rem", color: T.muted, alignItems: "flex-start" }}>
                          <span style={{ color: T.roseMid, fontSize: "0.45rem", marginTop: "0.45rem", flexShrink: 0 }}>◆</span>
                          <span><strong style={{ color: T.rose, fontWeight: 600 }}>{t.title}:</strong> {t.desc}</span>
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
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: "16px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 4px rgba(181,101,118,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        border: `1px solid ${T.border}`,
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: T.rose,
                        fontSize: "1rem",
                        flexShrink: 0,
                        background: T.surfaceTint,
                      }}>◎</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: T.text }}>{pdf.name}</div>
                        {pdf.description && (
                          <div style={{ fontSize: "0.78rem", color: T.dim, marginTop: "0.1rem" }}>{pdf.description}</div>
                        )}
                      </div>
                    </div>
                    <a
                      href={pdf.type === "local"
                        ? `/api/files/${encodeURIComponent(pdf.filename)}`
                        : `https://drive.google.com/uc?export=download&id=${pdf.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "transparent",
                        border: `1px solid ${T.rose}`,
                        color: T.rose,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        padding: "0.45rem 1rem",
                        borderRadius: "10px",
                        textDecoration: "none",
                        letterSpacing: "0.05em",
                        transition: "all 0.2s",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLElement).style.background = T.rose
                        ;(e.target as HTMLElement).style.color = "#fff"
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLElement).style.background = "transparent"
                        ;(e.target as HTMLElement).style.color = T.rose
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
            <p style={{ color: T.muted, fontSize: "0.85rem", marginBottom: "2rem", lineHeight: 1.7 }}>
              הכנס את מספר תעודת הזהות שלך ובחר את הקובץ להעלאה. הקובץ יישמר בתיקייה האישית שלך.
            </p>
            <div style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "480px",
              boxShadow: "0 1px 4px rgba(181,101,118,0.06)",
            }}>
              <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: T.rose,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}>מספר תעודת זהות</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="הכנס ת.ז"
                    maxLength={9}
                    style={{
                      width: "100%",
                      background: T.bgDeep,
                      border: `1px solid ${T.border}`,
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: T.text,
                      fontSize: "0.9rem",
                      textAlign: "right",
                      outline: "none",
                      transition: "border-color 0.2s",
                      fontFamily: "inherit",
                    }}
                    onFocus={e => (e.target.style.borderColor = T.rose)}
                    onBlur={e => (e.target.style.borderColor = T.border)}
                    required
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: T.rose,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}>קובץ להעלאה</label>
                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setFile(f)
                      if (f) setCustomFileName(f.name.replace(/\.[^.]+$/, ""))
                    }}
                    style={{
                      width: "100%",
                      background: T.bgDeep,
                      border: `1px solid ${T.border}`,
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: T.muted,
                      fontSize: "0.85rem",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <p style={{ fontSize: "0.72rem", color: T.veryDim, marginTop: "0.4rem" }}>
                    קבצים מותרים: PDF, תמונות, Word
                  </p>
                </div>

                {file && (
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: T.rose,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                    }}>שם הקובץ בדרייב</label>
                    <input
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      style={{
                        width: "100%",
                        background: T.bgDeep,
                        border: `1px solid ${T.border}`,
                        borderRadius: "10px",
                        padding: "0.75rem 1rem",
                        color: T.text,
                        fontSize: "0.9rem",
                        textAlign: "right",
                        outline: "none",
                        transition: "border-color 0.2s",
                        fontFamily: "inherit",
                      }}
                      onFocus={e => (e.target.style.borderColor = T.rose)}
                      onBlur={e => (e.target.style.borderColor = T.border)}
                      placeholder="שם הקובץ"
                    />
                    <p style={{ fontSize: "0.72rem", color: T.veryDim, marginTop: "0.4rem" }}>
                      סיומת הקובץ תישמר אוטומטית
                    </p>
                  </div>
                )}

                {uploadStatus.type !== "idle" && (
                  <div style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    border: "1px solid",
                    ...(uploadStatus.type === "success"
                      ? { background: "rgba(90,138,106,0.1)", color: "#3a7a55", borderColor: "rgba(90,138,106,0.3)" }
                      : uploadStatus.type === "error"
                      ? { background: "rgba(192,57,43,0.08)", color: "#c0392b", borderColor: "rgba(192,57,43,0.25)" }
                      : { background: T.rosePale, color: T.rose, borderColor: T.border }),
                  }}>
                    {uploadStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadStatus.type === "loading"}
                  style={{
                    background: uploadStatus.type === "loading" ? T.veryDim : T.rose,
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.85rem",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: uploadStatus.type === "loading" ? "not-allowed" : "pointer",
                    letterSpacing: "0.05em",
                    transition: "background 0.2s",
                    fontFamily: "inherit",
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
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "16px",
              padding: "4rem 2rem",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(181,101,118,0.06)",
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                border: `1px solid ${T.border}`,
                background: T.surfaceTint,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
                color: T.rose,
              }}>◇</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: T.text, marginBottom: "0.5rem" }}>
                מערכת התשלום
              </h3>
              <p style={{ color: T.dim, fontSize: "0.85rem" }}>קישור לתשלום יפורסם בקרוב</p>
            </div>
          </div>
        )}

      </main>

      <footer style={{
        borderTop: `1px solid ${T.border}`,
        padding: "1.5rem",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "0.7rem",
          color: T.veryDim,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          מסע לפולין
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
        fontWeight: 700,
        letterSpacing: "0.2em",
        color: T.roseMid,
        textTransform: "uppercase",
        marginBottom: "0.4rem",
      }}>
        מסע לפולין
      </div>
      <h2 style={{
        fontSize: "1.6rem",
        fontWeight: 900,
        color: T.text,
        lineHeight: 1.2,
        margin: 0,
      }}>
        {children}
      </h2>
      <div style={{
        width: "40px",
        height: "2px",
        background: T.rose,
        marginTop: "0.75rem",
        borderRadius: "2px",
      }} />
    </div>
  )
}

function PrepSessionCard({ session, nested }: { session: PrepSession; nested?: boolean }) {
  return (
    <div className={nested ? "" : "memory-card"} style={{
      background: nested ? "transparent" : T.surface,
      border: nested ? "none" : `1px solid ${T.border}`,
      borderRadius: nested ? 0 : "16px",
      overflow: "hidden",
      boxShadow: nested ? "none" : "0 1px 4px rgba(181,101,118,0.06)",
    }}>
      <div style={{
        padding: "0.75rem 1.25rem",
        borderBottom: `1px solid ${T.borderSub}`,
        background: nested ? T.surfaceTint : T.rosePale,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.5rem 0.9rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{
            background: T.rosePale,
            border: `1px solid ${T.border}`,
            borderRadius: "8px",
            padding: "0.1rem 0.45rem",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: T.rose,
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}>
            {session.num}
          </span>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: T.text }}>{session.title}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 0.6rem", fontSize: "0.72rem", color: T.muted }}>
          <span>{session.dayOfWeek}</span>
          <span style={{ color: T.veryDim }}>·</span>
          <span>{session.date}</span>
          {session.time && <><span style={{ color: T.veryDim }}>·</span><span style={{ color: T.rose }}>{session.time}</span></>}
          {session.leader && <><span style={{ color: T.veryDim }}>·</span><span>הובלה: {session.leader}</span></>}
        </div>
        <CalendarButtons title={session.title} date={session.date} time={session.time} topics={session.topics} />
      </div>
      <ul style={{ padding: "0.7rem 1.25rem", margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {session.topics.map((t, i) => (
          <li key={i} style={{ display: "flex", gap: "0.6rem", fontSize: "0.84rem", color: T.muted, alignItems: "flex-start" }}>
            <span style={{ color: T.roseMid, fontSize: "0.45rem", marginTop: "0.45rem", flexShrink: 0 }}>◆</span>
            <span><strong style={{ color: T.rose, fontWeight: 600 }}>{t.title}:</strong> {t.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Calendar Helpers ─── */

function parseSpecialDate(dateLabel: string): string {
  if (!dateLabel.includes("-")) return dateLabel
  const slashIdx = dateLabel.indexOf("/")
  if (slashIdx === -1) return dateLabel
  const firstDay = dateLabel.substring(0, slashIdx).split("-")[0]
  return `${firstDay}/${dateLabel.substring(slashIdx + 1)}`
}

function buildDateTime(date: string, time?: string): { start: string; end: string; allDay: boolean } | null {
  const parts = date.split("/")
  if (parts.length !== 3) return null
  const [d, m, y] = parts.map(p => p.padStart(2, "0"))
  if (time && /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(time)) {
    const [startT, endT] = time.split("-")
    const [sh, sm] = startT.split(":").map(n => n.padStart(2, "0"))
    const [eh, em] = endT.split(":").map(n => n.padStart(2, "0"))
    return { start: `${y}${m}${d}T${sh}${sm}00`, end: `${y}${m}${d}T${eh}${em}00`, allDay: false }
  }
  return { start: `${y}${m}${d}`, end: `${y}${m}${d}`, allDay: true }
}

function googleCalUrl(title: string, date: string, time?: string, desc?: string): string {
  const dt = buildDateTime(date, time)
  if (!dt) return ""
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${dt.start}/${dt.end}` })
  if (desc) params.set("details", desc)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function downloadIcs(title: string, date: string, time?: string, desc?: string) {
  const dt = buildDateTime(date, time)
  if (!dt) return
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Poland Trip//HE", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    dt.allDay ? `DTSTART;VALUE=DATE:${dt.start}` : `DTSTART:${dt.start}`,
    dt.allDay ? `DTEND;VALUE=DATE:${dt.end}` : `DTEND:${dt.end}`,
    `SUMMARY:${title}`,
    ...(desc ? [`DESCRIPTION:${desc.replace(/\n/g, "\\n")}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ]
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function CalendarButtons({ title, date, time, topics }: { title: string; date: string; time?: string; topics: Topic[] }) {
  const desc = topics.map(t => `${t.title}: ${t.desc}`).join("\n")
  const gcUrl = googleCalUrl(title, date, time, desc)
  if (!gcUrl) return null
  return (
    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginLeft: "auto" }}>
      <a
        href={gcUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="הוסף ל-Google Calendar"
        style={{ display: "flex", alignItems: "center", opacity: 0.7, transition: "opacity 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
      >
        {/* Google Calendar icon */}
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="white"/>
          <rect x="6" y="14" width="36" height="28" rx="3" fill="white" stroke="#dadce0" strokeWidth="1.5"/>
          <rect x="6" y="14" width="36" height="10" rx="3" fill="#1a73e8"/>
          <rect x="6" y="20" width="36" height="4" fill="#1a73e8"/>
          <rect x="15" y="9" width="3" height="10" rx="1.5" fill="#1a73e8"/>
          <rect x="30" y="9" width="3" height="10" rx="1.5" fill="#1a73e8"/>
          <text x="24" y="37" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a73e8" fontFamily="Arial,sans-serif">31</text>
        </svg>
      </a>
      <button
        onClick={() => downloadIcs(title, date, time, desc)}
        title="הוסף ל-Apple Calendar / iCal"
        style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.7, transition: "opacity 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
      >
        {/* Apple Calendar icon */}
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="white"/>
          <rect x="6" y="14" width="36" height="28" rx="3" fill="white" stroke="#e8e8e8" strokeWidth="1.5"/>
          <rect x="6" y="14" width="36" height="10" rx="3" fill="#FF3B30"/>
          <rect x="6" y="20" width="36" height="4" fill="#FF3B30"/>
          <rect x="15" y="9" width="3" height="10" rx="1.5" fill="#FF3B30"/>
          <rect x="30" y="9" width="3" height="10" rx="1.5" fill="#FF3B30"/>
          <text x="24" y="33" textAnchor="middle" fontSize="8" fontWeight="600" fill="#555" fontFamily="Arial,sans-serif">SUN</text>
          <text x="24" y="41" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1a1a" fontFamily="Arial,sans-serif">31</text>
        </svg>
      </button>
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "16px",
      padding: "4rem 2rem",
      textAlign: "center",
      boxShadow: "0 1px 4px rgba(181,101,118,0.06)",
    }}>
      <div style={{ fontSize: "2rem", color: T.roseMid, opacity: 0.4, marginBottom: "1rem" }}>{icon}</div>
      <p style={{ color: T.dim, fontSize: "0.9rem" }}>{text}</p>
    </div>
  )
}
