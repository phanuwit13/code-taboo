import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { createTopic, deleteTopic, getMyTopics } from '../actions/topics';

export const dynamic = 'force-dynamic';

export default async function DecksPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const topics = await getMyTopics();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs tracking-[0.4em] text-blue-600 uppercase mb-2">
          My Decks
        </p>
        <h1 className="text-3xl font-bold text-slate-900">โจทย์ของฉัน</h1>
        <p className="text-slate-500 mt-1 text-sm">
          สร้างหัวข้อ แล้วเข้าไปเพิ่มคำถาม + คำห้ามพูดด้วยการวาง JSON
        </p>
      </div>

      {/* สร้างหัวข้อใหม่ */}
      <form action={createTopic} className="flex gap-3">
        <input
          name="name"
          required
          maxLength={100}
          placeholder="ชื่อหัวข้อใหม่ เช่น DevOps, ศัพท์ Design..."
          className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 text-slate-900
                     placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold
                     hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-600/20"
        >
          + สร้างหัวข้อ
        </button>
      </form>

      {/* รายการหัวข้อ */}
      {topics.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-400">ยังไม่มีหัวข้อ — สร้างอันแรกได้เลย</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between gap-4 px-6 py-4 bg-white border border-slate-200
                         rounded-2xl hover:border-blue-300 transition"
            >
              <Link href={`/decks/${topic.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{topic.name}</p>
                <p className="font-mono text-xs text-slate-400 mt-0.5">
                  {topic.card_count} cards
                </p>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/decks/${topic.id}`}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200
                             rounded-full hover:bg-blue-50 transition"
                >
                  จัดการ
                </Link>
                <form
                  action={async () => {
                    'use server';
                    await deleteTopic(topic.id);
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold text-slate-400 rounded-full
                               hover:text-slate-600 hover:bg-slate-50 transition"
                  >
                    ลบ
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
