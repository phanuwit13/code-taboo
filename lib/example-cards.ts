// ตัวอย่าง JSON format สำหรับวางเพิ่มการ์ด — ปุ่ม "Copy example JSON" ใช้ค่านี้
// เอาไปให้ AI generate ต่อได้เลย
export const EXAMPLE_CARDS_JSON = JSON.stringify(
  [
    {
      target_word: 'React Query',
      forbidden_words: ['Cache', 'Fetch', 'Server State', 'Hook', 'TanStack'],
      category: 'Frontend',
      difficulty: 'Medium',
    },
    {
      target_word: 'Docker',
      forbidden_words: ['Container', 'Image', 'ปลาวาฬ', 'Deploy', 'Build'],
      category: 'DevOps',
      difficulty: 'Easy',
    },
  ],
  null,
  2,
);
