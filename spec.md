# Project Spec
_Last updated: 2026-07-22 01:35_

## Current State
เกม Code Taboo (Next.js 16 + Tailwind v4) โหมดแข่ง 2 ทีม + ระบบ user decks:
- **Auth:** Clerk (`@clerk/nextjs` v7) — keys อยู่ใน `.env` (gitignored), มี `.env.example` ให้เพื่อนทีม, `clerkMiddleware` อยู่ที่ `proxy.ts` (Next 16 convention), กันหน้า `/decks` ด้วย `auth()` ระดับ page
- **DB:** Cloudflare D1 local ผ่าน `@opennextjs/cloudflare` (`initOpenNextCloudflareForDev` ใน next.config.ts, miniflare ใช้ `.wrangler/state`) — ตาราง `topics` + `cards` ผูก `user_id` ของ Clerk (`schema.sql`)
- **Decks:** `/decks` สร้าง/ลบหัวข้อ → `/decks/[topicId]` เพิ่มการ์ดด้วยการวาง JSON (validate ใน `lib/parse-cards-json.ts`, ทดสอบแล้ว 10 เคส) + ปุ่ม Copy example JSON (`lib/example-cards.ts`) สำหรับเอาไปให้ AI generate
- **เกม:** หน้าแรกเลือกหัวข้อได้ (default 26 ใบจาก `lib/cards.ts` + หัวข้อของ user จาก D1 ผ่าน `?topic=id`), ตั้งเวลาต่อข้อ 5–120 วิ, ปุ่มทีม A/B ทายถูก
- **In-game controls:** ปุ่ม "⏸ พักเกม" (หยุดเวลา ล็อคปุ่มทีม ไม่บังคำศัพท์) + "จบเกมเลย →" (ข้ามไปหน้าคะแนนทันที) — หมดเวลาแล้ว**ไม่**เปลี่ยนข้ออัตโนมัติ: เวลาค้างที่ 0 คำศัพท์ยังเห็นเต็ม แล้วมีปุ่ม "ข้อถัดไป →" ให้กดเอง (ข้อสุดท้ายเป็น "ดูคะแนน →")
- **Verified E2E:** login (sign-in token) → สร้างหัวข้อ → วาง JSON 3 การ์ด → เล่นเกมด้วยการ์ด custom — ผ่านทั้งหมด, build + lint ผ่าน
- Test account ใน Clerk dev instance: username `qa_bot` (สร้างผ่าน Backend API เพื่อทดสอบ)

## Decisions Made
- 2026-07-22 — ใช้ `@opennextjs/cloudflare` แทน `@cloudflare/next-on-pages` (ตัวเก่า deprecated, ไม่รองรับ Next 16) — D1 local ใช้ได้ใน `next dev` เลยไม่ต้อง login Cloudflare
- 2026-07-22 — ใช้ `proxy.ts` แทน `middleware.ts` (Next 16 deprecate) และไม่ใช้ `createRouteMatcher` (Clerk v7 deprecate) — auth check ทำระดับ page/action แทน
- 2026-07-22 — Clerk v7 ไม่มี `SignedIn/SignedOut` แล้ว → ใช้ `<Show when="signed-in">` / `<Show when="signed-out">`
- 2026-07-22 — JSON import ยอมรับทั้ง `[...]` และ `{"cards":[...]}`, จำกัด 100 ใบ/ครั้ง, forbidden words สูงสุด 8 คำ, difficulty นอกลิสต์ตกเป็น Medium
- 2026-07-22 — เปลี่ยนเป็นโหมด 2 ทีม (A/B): ตัดปุ่มข้าม, timer นับต่อข้อ (ตั้งค่าได้), auto-advance ผ่าน setTimeout ใน effect
- 2026-07-21 — default deck 26 ใบอยู่ใน `lib/cards.ts` (ไม่ต้องพึ่ง DB)
- 2026-07-21 — ห้ามใช้ font-mono + tracking กว้างกับข้อความไทย (ดู MEMORY.md)

## Deploy (พร้อมแล้ว — เหลือขั้นที่ต้อง Cloudflare login)
- Config พร้อม: `open-next.config.ts`, `wrangler.toml` (main=.open-next/worker.js, ASSETS + D1 binding), scripts `deploy`/`preview`/`db:migrate:*` ใน package.json
- `middleware.ts` (edge) — **ห้ามเปลี่ยนกลับเป็น proxy.ts (Node)** เพราะ OpenNext/Workers ไม่รองรับ Node middleware
- Verified: `opennextjs-cloudflare build` ผ่าน + preview บน workerd จริงเสิร์ฟหน้าเกม 200, /decks ไม่ leak, ไม่มี runtime error
- เหลือทำ (ดู README ส่วน Deployment): `wrangler login` → `wrangler d1 create taboo-db` → ใส่ database_id ใน wrangler.toml → `npm run db:migrate:remote` → set Clerk production keys เป็น secret → `npm run deploy`
- ⚠️ port 8787 (default wrangler preview) ชนกับ Docker LLM server ของ user — ใช้ `-- --port 8799` เวลา preview

## Next Up
- [ ] (optional) แก้ไขการ์ดรายใบ / แชร์หัวข้อให้เพื่อนในทีม / เลือกหลายหัวข้อพร้อมกันตอนเล่น
