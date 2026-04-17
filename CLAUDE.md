# poland-trip

## מטרת הפרויקט
דשבורד מסע לפולין לתלמידים והורים. מאפשר צפייה בלו"ז, הורדת טפסים, והעלאת מסמכים לתיקייה אישית בגוגל דרייב.

## טכנולוגיות
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Google Drive REST API (OAuth 2.0 עם Refresh Token - ללא googleapis)
- Vercel (פריסה)

## מבנה קבצים מרכזי
- `src/app/page.tsx` - דשבורד תלמיד (לו"ז, הורדה, העלאה)
- `src/app/admin/page.tsx` - ממשק ניהול מוגן בסיסמה
- `src/app/api/upload/route.ts` - קבלת קובץ מתלמיד ושמירה בדרייב
- `src/app/api/pdfs/route.ts` - החזרת רשימת PDF להורדה
- `src/app/api/files/[filename]/route.ts` - הגשת קבצים מקומיים מתיקיית `files/`
- `src/app/api/admin/` - API לממשק הניהול (students, pdfs, schedule)
- `src/lib/drive.ts` - כל קריאות Google Drive API (fetch בלבד, ללא googleapis)
- `data/students.json` - רשימת תלמידים ברירת מחדל (fallback)
- `data/schedule.json` - לו"ז ברירת מחדל (fallback)
- `files/` - קבצים סטטיים להורדה (PDF וכד'). מוגשים דרך `/api/files/[filename]`

## אחסון נתונים
כל הנתונים הדינמיים (תלמידים, לו"ז, רשימת PDFs) נשמרים כקבצי JSON בתיקיית `_config` בגוגל דרייב. הקבצים ב-`data/` משמשים כ-fallback בלבד.

## Google Drive
- אימות: OAuth 2.0 עם Refresh Token (לא Service Account)
- החשבון המאומת: `1002823504@edu-haifa.org.il`
- תיקיית שורש: `GOOGLE_DRIVE_FOLDER_ID` (חייבת להיות משותפת עם החשבון המאומת)
- תיקיות תלמידים נוצרות אוטומטית בפורמט: `[ת.ז] - [שם]`
- **חשוב:** לא להשתמש בספריית googleapis - היא לא עובדת ב-Vercel Serverless

## Vercel - כללי env vars
תמיד להשתמש ב-`printf` ולא ב-`echo` כדי למנוע newline בסוף הערך:
```bash
printf 'VALUE' | vercel env add VAR_NAME production --force
```

## משתני סביבה נדרשים
- `GOOGLE_DRIVE_FOLDER_ID` - ID של תיקיית השורש בדרייב
- `GOOGLE_CLIENT_ID` - מ-Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - מ-Google Cloud Console
- `GOOGLE_REFRESH_TOKEN` - מסקריפט `scripts/get-refresh-token.mjs`
- `ADMIN_PASSWORD` - סיסמת ממשק הניהול

## קהל יעד
תלמידים והורים. ללא אימות - מזדהים עם ת.ז בלבד.
ממשק הניהול מוגן בסיסמה בלבד (header: `x-admin-password`).
