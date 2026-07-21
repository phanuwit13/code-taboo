# 🎮 Project: Frontend Code Taboo

เอกสารนี้ครอบคลุมการออกแบบสถาปัตยกรรมและแผนการพัฒนาเกม "Code Taboo" สำหรับสันทนาการในทีม Frontend โดยใช้ **Next.js** เป็น Full-stack Framework และเชื่อมต่อกับ **Cloudflare D1** เป็นฐานข้อมูลหลักโดยตรง

---

## 🛠 Tech Stack Overview
*   **Framework:** Next.js (App Router) - ใช้ทำหน้าที่เป็น Full-stack จัดการทั้ง UI และ Server API
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Shadcn UI (เพื่อความรวดเร็วในการประกอบ UI)
*   **Database:** Cloudflare D1 (Serverless SQLite)
*   **Deployment:** Cloudflare Pages (ผ่าน `@cloudflare/next-on-pages` adapter)

---

## 🗄️ Database Schema (Cloudflare D1)
ระบบจะใช้ D1 ในการเก็บชุดคำศัพท์ (Cards) เพื่อความยืดหยุ่นในการเพิ่ม/แก้ไขคำศัพท์โดยไม่ต้องนำโค้ดขึ้นใหม่ 

**ไฟล์ `schema.sql`**
```sql
DROP TABLE IF EXISTS taboo_cards;

CREATE TABLE taboo_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_word TEXT NOT NULL,
    forbidden_words TEXT NOT NULL, -- เก็บเป็น JSON array string เช่น '["React", "Component", "State"]'
    category TEXT DEFAULT 'Frontend',
    difficulty TEXT DEFAULT 'Medium', -- Easy, Medium, Hard
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตัวอย่าง Initial Data
INSERT INTO taboo_cards (target_word, forbidden_words, category, difficulty) VALUES 
('Svelte', '["Framework", "React", "Compiler", "Javascript"]', 'Frontend', 'Medium'),
('File-based routing', '["Directory", "URL", "Path", "Page", "Folder"]', 'Architecture', 'Easy'),
('TanStack Router', '["React", "Type-safe", "Navigation", "URL", "State"]', 'Architecture', 'Hard'),
('WebRTC', '["Video", "Call", "Peer", "Streaming", "Connection"]', 'Network', 'Hard');
```

---

## ⚙️ Project Setup & Configuration

1.  **สร้างโปรเจกต์ Next.js:**
    ```bash
    npx create-next-app@latest code-taboo
    cd code-taboo
    ```
2.  **ติดตั้ง Cloudflare Adapter & Wrangler:**
    ```bash
    npm install -D @cloudflare/next-on-pages wrangler
    ```
3.  **สร้างฐานข้อมูล D1 แบบ Local / Remote:**
    ```bash
    npx wrangler d1 create taboo-db
    ```
4.  **ตั้งค่า `wrangler.toml` ใน Root Directory:**
    ```toml
    name = "code-taboo"
    compatibility_date = "2024-03-20"
    compatibility_flags = ["nodejs_compat"]

    [[d1_databases]]
    binding = "DB"
    database_name = "taboo-db"
    database_id = "<นำ ID จากขั้นตอนที่ 3 มาใส่>"
    ```

---

## 💻 Core Implementation

### 1. Types & Cloudflare Env Binding
กำหนด Type ให้กับ Cloudflare bindings เพื่อให้ TypeScript รู้จัก D1 Database Object

**ไฟล์ `env.d.ts`**
```typescript
interface CloudflareEnv {
  DB: D1Database;
}
```

### 2. Data Access (Server Actions)
ใช้ Next.js Server Actions ในการดึงข้อมูลจาก D1 โดยตรงจากฝั่งเซิร์ฟเวอร์ โดยไม่ต้องสร้าง API Route 분แยกต่างหาก

**ไฟล์ `app/actions/getCards.ts`**
```typescript
'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';

export type TabooCard = {
  id: number;
  target_word: string;
  forbidden_words: string[];
  category: string;
  difficulty: string;
};

export async function getRandomCards(limit: number = 10): Promise<TabooCard[]> {
  // ดึง Context ของ Cloudflare (รองรับทั้ง Dev และ Prod)
  const env = process.env.NODE_ENV === 'development' 
    ? process.env as unknown as CloudflareEnv 
    : getRequestContext().env as CloudflareEnv; 
    
  const db = env.DB;

  // Query แบบสุ่ม
  const { results } = await db.prepare(
    `SELECT * FROM taboo_cards ORDER BY RANDOM() LIMIT ?`
  ).bind(limit).all();

  return results.map((row: any) => ({
    ...row,
    forbidden_words: JSON.parse(row.forbidden_words)
  }));
}
```

### 3. Game Board Component (Client Side)
จัดการ State ของเกม เช่น เวลา (Timer), คะแนน (Score) และลอจิกการเล่น

**ไฟล์ `app/components/GameBoard.tsx`**
```tsx
'use client'

import { useState, useEffect } from 'react';
import { TabooCard } from '../actions/getCards';

interface GameBoardProps {
  initialCards: TabooCard[];
}

export default function GameBoard({ initialCards }: GameBoardProps) {
  const [cards, setCards] = useState<TabooCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // รอบละ 60 วินาที
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const currentCard = cards[currentIndex];

  const handleCorrect = () => {
    setScore((prev) => prev + 1);
    nextCard();
  };

  const handleSkip = () => nextCard();

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false); // การ์ดหมด
    }
  };

  if (!isPlaying && timeLeft === 60) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h1 className="text-4xl font-bold">Code Taboo</h1>
        <button 
          onClick={() => setIsPlaying(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          เริ่มเกม
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex justify-between w-full text-2xl font-bold">
        <div className="text-red-500">เวลา: {timeLeft}s</div>
        <div className="text-green-500">คะแนน: {score}</div>
      </div>

      {currentCard && isPlaying ? (
        <div className="w-full bg-white p-8 rounded-3xl shadow-2xl border-2 border-gray-100 text-center">
          <h2 className="text-5xl font-black text-gray-800 mb-8 border-b-2 pb-6">
            {currentCard.target_word}
          </h2>
          <div className="space-y-4">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">ห้ามพูดคำเหล่านี้</p>
            {currentCard.forbidden_words.map((word, idx) => (
              <div key={idx} className="text-2xl font-bold text-red-600 bg-red-50 py-3 rounded-xl">
                {word}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-3xl font-bold text-center">
          หมดเวลา! 🎉 <br/><br/>
          ทีมคุณทำได้: <span className="text-blue-600 text-5xl">{score}</span> คะแนน
        </div>
      )}

      {isPlaying && (
        <div className="flex space-x-4 w-full pt-4">
          <button onClick={handleSkip} className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-2xl font-bold text-xl hover:bg-gray-300 transition">
            ข้าม
          </button>
          <button onClick={handleCorrect} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold text-xl hover:bg-green-600 transition shadow-lg shadow-green-200">
            ทายถูก
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4. Page Component (Server Side)
ดึงข้อมูลตั้งแต่ฝั่งเซิร์ฟเวอร์ก่อนส่งให้ Client

**ไฟล์ `app/page.tsx`**
```tsx
import GameBoard from './components/GameBoard';
import { getRandomCards } from './actions/getCards';

export const runtime = 'edge'; // สำคัญสำหรับการรันบน Cloudflare

export default async function Home() {
  const initialCards = await getRandomCards(15);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <GameBoard initialCards={initialCards} />
    </main>
  );
}
```

---

## 🚀 Deployment (Cloudflare Pages)

รันคำสั่งเพื่อ Build ผ่าน Adapter และ Deploy ขึ้น Cloudflare Pages 

```bash
# Build
npx @cloudflare/next-on-pages

# Deploy
npx wrangler pages deploy .vercel/output/static
```

**สำคัญ:** นำเข้าข้อมูลเริ่มต้นลง D1 บน Production Environment
```bash
npx wrangler d1 execute taboo-db --remote --file=./schema.sql
```
