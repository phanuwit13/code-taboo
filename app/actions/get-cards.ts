'use server';

import { SEED_CARDS, shuffle, type TabooCard } from '@/lib/cards';

// ตอนนี้ดึงจาก seed data ใน repo — เมื่อพร้อมต่อ Cloudflare D1 ให้เปลี่ยน
// ฟังก์ชันนี้ไป query ตาราง taboo_cards (ดู schema.sql และ wrangler.toml)
export async function getRandomCards(limit: number = 30): Promise<TabooCard[]> {
  return shuffle(SEED_CARDS).slice(0, limit);
}
