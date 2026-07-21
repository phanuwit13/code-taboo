# 🎮 Code Taboo

เกมใบ้คำศัพท์สาย dev สำหรับสันทนาการทีม Frontend — แข่งกัน 2 ทีม (A/B) ใบ้คำเป้าหมายโดยห้ามพูดคำต้องห้ามบนการ์ด ทีมไหนทายถูกกดเก็บแต้มทีมนั้น ตั้งเวลาต่อข้อได้ (5–120 วินาที) ถ้าหมดเวลาไม่มีใครได้แต้มแล้วข้ามไปข้อถัดไปอัตโนมัติ

Login ด้วย Clerk แล้วสร้าง**หัวข้อโจทย์ของตัวเอง**ได้ — เพิ่มการ์ดด้วยการวาง JSON (มีปุ่ม Copy example JSON เอาไปให้ AI ช่วย generate)

Design: minimal โทนขาว–น้ำเงิน

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Clerk** — authentication (`@clerk/nextjs`)
- **Cloudflare D1** — เก็บหัวข้อ/การ์ดของแต่ละ user (local dev ใช้ miniflare ผ่าน `@opennextjs/cloudflare` ไม่ต้อง login Cloudflare)

## เริ่มใช้งาน

```bash
npm install

# ตั้งค่า Clerk keys (copy จาก dashboard.clerk.com → API Keys)
cp .env.example .env   # แล้วเติมค่า 2 ตัว
# ไม่ใส่ก็รันได้ — Clerk จะเข้า keyless mode ให้อัตโนมัติใน dev

# สร้างตารางใน D1 local
npx wrangler d1 execute taboo-db --local --file=./schema.sql

npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

> ⚠️ ห้าม commit `.env` (gitignored อยู่แล้ว) — key เก็บใน Keychain/env เท่านั้นตาม team rules

## โครงสร้างหลัก

| ไฟล์ | หน้าที่ |
|---|---|
| `lib/cards.ts` | ชุดคำศัพท์ default 26 ใบ + type + shuffle |
| `lib/parse-cards-json.ts` | validate JSON ที่ user วางมา (pure function) |
| `lib/example-cards.ts` | ตัวอย่าง JSON สำหรับปุ่ม Copy |
| `lib/db.ts` | D1 binding ผ่าน `getCloudflareContext` |
| `app/actions/topics.ts` | Server Actions: CRUD หัวข้อ/การ์ด + import JSON |
| `app/decks/` | หน้าจัดการหัวข้อ + เพิ่มการ์ด (ต้อง login) |
| `app/components/game-board.tsx` | ลอจิกเกม 2 ทีม (timer ต่อข้อ, สกอร์ A/B) |
| `proxy.ts` | clerkMiddleware (Next 16 ใช้ proxy แทน middleware) |
| `schema.sql` | ตาราง `topics` + `cards` |

## JSON format สำหรับเพิ่มการ์ด

```json
[
  {
    "target_word": "Docker",
    "forbidden_words": ["Container", "Image", "ปลาวาฬ", "Deploy"],
    "category": "DevOps",
    "difficulty": "Easy"
  }
]
```

- `category` / `difficulty` ไม่ใส่ก็ได้ (default: `Custom` / `Medium`, difficulty รับ `Easy|Medium|Hard`)
- วางได้สูงสุด 100 ใบต่อครั้ง, คำห้ามพูดเก็บสูงสุด 8 คำต่อใบ
- กดปุ่ม **Copy example JSON** ในหน้าจัดการหัวข้อ แล้วเอาไปให้ AI generate ตาม format ได้เลย

## Deployment (Cloudflare Workers)

Deploy ด้วย [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) — config พร้อมหมดแล้ว (`open-next.config.ts`, `wrangler.toml`, npm scripts)

```bash
# 1. login Cloudflare (เปิด browser ให้ยืนยัน)
npx wrangler login

# 2. สร้างฐานข้อมูล D1 จริงบน Cloudflare
npx wrangler d1 create taboo-db
#    → copy "database_id" ที่ได้ ไปแทน <REPLACE_WITH_D1_DATABASE_ID> ใน wrangler.toml

# 3. สร้างตารางบน D1 remote
npm run db:migrate:remote

# 4. ใส่ Clerk secret key เป็น Worker secret (ใช้ตอน runtime, ไม่ commit)
npx wrangler secret put CLERK_SECRET_KEY

# 5. build + deploy
npm run deploy
```

**สำคัญเรื่อง key 2 ตัว (คนละจังหวะกัน):**
| Key | ใช้เมื่อไหร่ | ตั้งที่ไหน |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ฝังตอน **build** (อยู่ในโค้ดฝั่ง client) | ต้องมีใน `.env` ตอนรัน `npm run deploy` |
| `CLERK_SECRET_KEY` | ตอน **runtime** (server) | `wrangler secret put` (ข้อ 4) |

→ เพราะ publishable key ถูก build เข้าไปในไฟล์ตอน `npm run deploy` เลยต้องอยู่ใน `.env` ไม่ใช่ Worker secret

**ทดสอบ build บนเครื่องก่อน deploy** (รันบน Cloudflare runtime จริงผ่าน workerd):

```bash
npm run preview -- --port 8799   # 8787 เป็น default แต่ถ้าชน port อื่น ใช้ --port
```

> **Clerk production:** ตอน deploy จริงควรใช้ production instance ของ Clerk (key `pk_live_`/`sk_live_`)
> และเพิ่ม domain ของ Worker ใน Clerk Dashboard → Domains ด้วย
