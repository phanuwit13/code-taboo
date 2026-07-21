const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const MAX_FORBIDDEN_WORDS = 8;
const MAX_CARDS_PER_IMPORT = 100;

export type ParsedCard = {
  target_word: string;
  forbidden_words: string[];
  category: string;
  difficulty: string;
};

export type ParseCardsResult =
  | { ok: true; cards: ParsedCard[] }
  | { ok: false; error: string };

// แปลง + validate JSON ที่ user วางมา — ยอมรับทั้ง [...] และ { "cards": [...] }
export function parseCardsJson(rawJson: string): ParseCardsResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      ok: false,
      error: 'JSON ไม่ถูกต้อง — เช็ค syntax อีกครั้ง (ลองกด Copy example JSON ดูตัวอย่าง)',
    };
  }

  const items = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' &&
        parsed !== null &&
        Array.isArray((parsed as Record<string, unknown>).cards)
      ? ((parsed as Record<string, unknown>).cards as unknown[])
      : null;

  if (!items)
    return {
      ok: false,
      error: 'ต้องเป็น JSON array ของการ์ด เช่น [{ "target_word": ..., "forbidden_words": [...] }]',
    };
  if (items.length === 0) return { ok: false, error: 'ไม่มีการ์ดใน JSON ที่วางมา' };
  if (items.length > MAX_CARDS_PER_IMPORT)
    return { ok: false, error: `เพิ่มได้ครั้งละไม่เกิน ${MAX_CARDS_PER_IMPORT} การ์ด` };

  const cards: ParsedCard[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    const targetWord =
      typeof item?.target_word === 'string' ? item.target_word.trim() : '';
    if (!targetWord)
      return { ok: false, error: `การ์ดลำดับที่ ${i + 1}: ไม่มี target_word` };

    const forbidden = Array.isArray(item.forbidden_words)
      ? item.forbidden_words
          .filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
          .map((w) => w.trim())
      : [];
    if (forbidden.length === 0)
      return {
        ok: false,
        error: `การ์ด "${targetWord}": forbidden_words ต้องเป็น array ของคำอย่างน้อย 1 คำ`,
      };

    const difficulty =
      typeof item.difficulty === 'string' && DIFFICULTIES.includes(item.difficulty)
        ? item.difficulty
        : 'Medium';
    const category =
      typeof item.category === 'string' && item.category.trim()
        ? item.category.trim().slice(0, 50)
        : 'Custom';

    cards.push({
      target_word: targetWord.slice(0, 100),
      forbidden_words: forbidden.slice(0, MAX_FORBIDDEN_WORDS),
      category,
      difficulty,
    });
  }

  return { ok: true, cards };
}
