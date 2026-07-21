import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { deleteCard, getTopicWithCards } from '@/app/actions/topics';
import CopyExampleButton from '@/app/components/copy-example-button';
import ImportCardsForm from '@/app/components/import-cards-form';

export const dynamic = 'force-dynamic';

interface TopicDetailPageProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const { topicId: topicIdParam } = await params;
  const topicId = Number(topicIdParam);
  if (!Number.isInteger(topicId)) notFound();

  const data = await getTopicWithCards(topicId);
  if (!data) notFound();
  const { topic, cards } = data;

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <Link
          href="/decks"
          className="font-mono text-xs text-slate-400 hover:text-blue-600 transition"
        >
          ← โจทย์ของฉัน
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">{topic.name}</h1>
        <p className="font-mono text-xs text-slate-400 mt-1">{cards.length} cards</p>
      </div>

      {/* เพิ่มการ์ดด้วย JSON */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">เพิ่มการ์ด (วาง JSON)</h2>
          <CopyExampleButton />
        </div>
        <p className="text-sm text-slate-500">
          กด <span className="font-mono text-slate-600">Copy example JSON</span>{' '}
          แล้วเอาไปให้ AI ช่วย generate โจทย์ตาม format นี้ เสร็จแล้ววางกลับที่ช่องด้านล่างได้เลย
        </p>
        <ImportCardsForm topicId={topic.id} />
      </section>

      {/* รายการการ์ด */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-slate-900">การ์ดทั้งหมด</h2>
        {cards.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400">ยังไม่มีการ์ดในหัวข้อนี้</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {cards.map((card) => (
              <li
                key={card.id}
                className="px-6 py-4 bg-white border border-slate-200 rounded-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-mono font-bold text-slate-900 truncate">
                        {card.target_word}
                      </p>
                      <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase shrink-0">
                        {card.category} · {card.difficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {card.forbidden_words.map((word) => (
                        <span
                          key={word}
                          className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-800 rounded-full"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <form
                    action={async () => {
                      'use server';
                      await deleteCard(topic.id, card.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-sm font-semibold text-slate-300 hover:text-slate-600 transition shrink-0"
                      aria-label={`ลบการ์ด ${card.target_word}`}
                    >
                      ลบ
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
