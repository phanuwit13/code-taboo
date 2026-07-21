# Project Memory — Code Taboo

## 2026-07-22 · Next 16 dev server lock ค้าง
- **เกิดอะไร:** สั่ง `npm run dev` แล้วเจอ "Another next dev server is already running" ทั้งที่ process เดิมตายไปแล้ว (เกิดซ้ำ 3 รอบใน session เดียว หลัง dev server โดน kill แบบไม่ graceful)
- **ทำไม:** Next.js 16 เก็บ lock/PID ไว้ใน `.next/dev/` — ถ้า process โดน SIGTERM/SIGKILL จะไม่เคลียร์ lock และ PID ที่ตายแล้วอาจถูก OS reuse ทำให้เช็ค `ps -p` หลอกว่ายัง alive
- **ครั้งหน้าทำยังไง:** ถ้าเจอ error นี้ ให้เช็คว่า PID ใน error message ยังรันจริงด้วย `ps -p <PID> -o command=` (ดู command ไม่ใช่แค่ exit code) — ถ้าไม่ใช่ next dev ของโปรเจกต์นี้ ให้ `rm -rf .next/dev` แล้ว start ใหม่

## 2026-07-21 · Font mono กับข้อความไทย
- **เกิดอะไร:** label ภาษาไทยที่ใส่ `font-mono tracking-[0.3em]` render เพี้ยน (ตัวอักษรห่างผิดปกติ)
- **ทำไม:** Geist Mono ไม่มี glyph ไทย browser จึง fallback ไป font อื่น + letter-spacing กว้างไม่เหมาะกับสระ/วรรณยุกต์ไทย
- **ครั้งหน้าทำยังไง:** ข้อความไทยใช้ `text-xs font-semibold` (Noto Sans Thai) เสมอ — font-mono + tracking ใช้เฉพาะ label ภาษาอังกฤษ/ตัวเลข
