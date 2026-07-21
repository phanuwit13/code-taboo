'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { parseCardsJson } from '@/lib/parse-cards-json';
import type { TabooCard } from '@/lib/cards';

export type Topic = {
  id: number;
  name: string;
  card_count: number;
};

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('ต้อง login ก่อน');
  return userId;
}

export async function getMyTopics(): Promise<Topic[]> {
  const { userId } = await auth();
  if (!userId) return [];
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT t.id, t.name, COUNT(c.id) AS card_count
       FROM topics t LEFT JOIN cards c ON c.topic_id = t.id
       WHERE t.user_id = ? GROUP BY t.id ORDER BY t.created_at DESC`,
    )
    .bind(userId)
    .all();
  return results as unknown as Topic[];
}

export async function getTopicWithCards(
  topicId: number,
): Promise<{ topic: Topic; cards: TabooCard[] } | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const db = await getDb();
  const topic = await db
    .prepare(`SELECT id, name FROM topics WHERE id = ? AND user_id = ?`)
    .bind(topicId, userId)
    .first();
  if (!topic) return null;

  const { results } = await db
    .prepare(
      `SELECT id, target_word, forbidden_words, category, difficulty
       FROM cards WHERE topic_id = ? ORDER BY created_at DESC`,
    )
    .bind(topicId)
    .all();

  const cards = (results as Array<Record<string, unknown>>).map((row) => ({
    ...row,
    forbidden_words: JSON.parse(row.forbidden_words as string),
  })) as TabooCard[];

  return {
    topic: { id: topic.id as number, name: topic.name as string, card_count: cards.length },
    cards,
  };
}

// ใช้ในหน้าเกม — ดึงการ์ดของหัวข้อที่เลือก (เฉพาะหัวข้อของ user เอง)
export async function getCardsForTopic(topicId: number): Promise<TabooCard[]> {
  const data = await getTopicWithCards(topicId);
  return data?.cards ?? [];
}

export async function createTopic(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const name = (formData.get('name') as string | null)?.trim();
  if (!name) return;
  const db = await getDb();
  await db
    .prepare(`INSERT INTO topics (user_id, name) VALUES (?, ?)`)
    .bind(userId, name.slice(0, 100))
    .run();
  revalidatePath('/decks');
}

export async function deleteTopic(topicId: number): Promise<void> {
  const userId = await requireUserId();
  const db = await getDb();
  // ลบการ์ดก่อน (D1 ไม่เปิด foreign_keys cascade เสมอไป)
  await db
    .prepare(
      `DELETE FROM cards WHERE topic_id = ?
       AND EXISTS (SELECT 1 FROM topics WHERE id = ? AND user_id = ?)`,
    )
    .bind(topicId, topicId, userId)
    .run();
  await db
    .prepare(`DELETE FROM topics WHERE id = ? AND user_id = ?`)
    .bind(topicId, userId)
    .run();
  revalidatePath('/decks');
}

export async function deleteCard(topicId: number, cardId: number): Promise<void> {
  const userId = await requireUserId();
  const db = await getDb();
  await db
    .prepare(
      `DELETE FROM cards WHERE id = ? AND topic_id IN
       (SELECT id FROM topics WHERE id = ? AND user_id = ?)`,
    )
    .bind(cardId, topicId, userId)
    .run();
  revalidatePath(`/decks/${topicId}`);
}

export type ImportResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

// รับ JSON ที่ user วางมา — array ของ { target_word, forbidden_words, category?, difficulty? }
export async function importCards(
  topicId: number,
  rawJson: string,
): Promise<ImportResult> {
  const userId = await requireUserId();

  const parsed = parseCardsJson(rawJson);
  if (!parsed.ok) return parsed;
  const validated = parsed.cards;

  const db = await getDb();
  const topic = await db
    .prepare(`SELECT id FROM topics WHERE id = ? AND user_id = ?`)
    .bind(topicId, userId)
    .first();
  if (!topic) return { ok: false, error: 'ไม่พบหัวข้อนี้' };

  const stmt = db.prepare(
    `INSERT INTO cards (topic_id, target_word, forbidden_words, category, difficulty) VALUES (?, ?, ?, ?, ?)`,
  );
  await db.batch(
    validated.map((c) =>
      stmt.bind(topicId, c.target_word, JSON.stringify(c.forbidden_words), c.category, c.difficulty),
    ),
  );

  revalidatePath(`/decks/${topicId}`);
  return { ok: true, count: validated.length };
}
