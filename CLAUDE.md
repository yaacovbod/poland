# poland-trip

## מטרת הפרויקט
דשבורד מסע לפולין לתלמידים והורים. מאפשר צפייה בלו"ז, הורדת טפסים, והעלאת מסמכים לתיקייה אישית בגוגל דרייב.

## טכנולוגיות
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Google Drive API (Service Account)

## מבנה קבצים מרכזי
- `src/app/page.tsx` - דשבורד תלמיד (לו"ז, הורדה, העלאה)
- `src/app/admin/page.tsx` - ממשק ניהול (העלאת PDF, ניהול לו"ז, ניהול תלמידים)
- `src/app/api/upload/route.ts` - קבלת קובץ מתלמיד ושמירה בדרייב
- `src/app/api/pdfs/route.ts` - החזרת רשימת PDF להורדה
- `src/app/api/admin/` - API לממשק הניהול
- `src/lib/drive.ts` - חיבור Google Drive API
- `data/schedule.json` - לו"ז המסע
- `data/students.json` - רשימת תלמידים עם ת.ז ומיפוי לתיקיות

## קהל יעד
תלמידים והורים. ללא אימות - מזדהים עם ת.ז בלבד.

## הגדרות סביבה
ראה `.env.local.example`
