export type TabooCard = {
  id: number;
  target_word: string;
  forbidden_words: string[];
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

// Seed data สำหรับเล่นแบบ local — โครงสร้างเดียวกับตาราง taboo_cards ใน schema.sql
// เมื่อต่อ Cloudflare D1 แล้ว data ชุดนี้จะถูกแทนด้วยผล query จาก DB
export const SEED_CARDS: TabooCard[] = [
  { id: 1, target_word: 'React', forbidden_words: ['Component', 'Hook', 'Facebook', 'JSX', 'Library'], category: 'Frontend', difficulty: 'Easy' },
  { id: 2, target_word: 'Svelte', forbidden_words: ['Framework', 'React', 'Compiler', 'JavaScript'], category: 'Frontend', difficulty: 'Medium' },
  { id: 3, target_word: 'File-based Routing', forbidden_words: ['Directory', 'URL', 'Path', 'Page', 'Folder'], category: 'Architecture', difficulty: 'Easy' },
  { id: 4, target_word: 'TanStack Router', forbidden_words: ['React', 'Type-safe', 'Navigation', 'URL', 'State'], category: 'Architecture', difficulty: 'Hard' },
  { id: 5, target_word: 'WebRTC', forbidden_words: ['Video', 'Call', 'Peer', 'Streaming', 'Connection'], category: 'Network', difficulty: 'Hard' },
  { id: 6, target_word: 'useEffect', forbidden_words: ['Hook', 'Side Effect', 'Render', 'Dependency', 'React'], category: 'Frontend', difficulty: 'Easy' },
  { id: 7, target_word: 'Tailwind CSS', forbidden_words: ['Utility', 'Class', 'Style', 'Framework', 'CSS'], category: 'Frontend', difficulty: 'Easy' },
  { id: 8, target_word: 'TypeScript', forbidden_words: ['JavaScript', 'Type', 'Microsoft', 'Compile', 'Interface'], category: 'Language', difficulty: 'Easy' },
  { id: 9, target_word: 'Virtual DOM', forbidden_words: ['React', 'Diff', 'Render', 'Tree', 'Browser'], category: 'Frontend', difficulty: 'Medium' },
  { id: 10, target_word: 'Hydration', forbidden_words: ['Server', 'Client', 'HTML', 'JavaScript', 'Render'], category: 'Frontend', difficulty: 'Hard' },
  { id: 11, target_word: 'Debounce', forbidden_words: ['Delay', 'Function', 'Search', 'Timeout', 'Event'], category: 'JavaScript', difficulty: 'Medium' },
  { id: 12, target_word: 'Memoization', forbidden_words: ['Cache', 'Function', 'Performance', 'Result', 'useMemo'], category: 'JavaScript', difficulty: 'Medium' },
  { id: 13, target_word: 'Zustand', forbidden_words: ['State', 'Store', 'React', 'Redux', 'Global'], category: 'Frontend', difficulty: 'Medium' },
  { id: 14, target_word: 'Server Component', forbidden_words: ['React', 'Client', 'Render', 'Next.js', 'Server'], category: 'Architecture', difficulty: 'Hard' },
  { id: 15, target_word: 'Flexbox', forbidden_words: ['CSS', 'Layout', 'Row', 'Column', 'Align'], category: 'CSS', difficulty: 'Easy' },
  { id: 16, target_word: 'z-index', forbidden_words: ['CSS', 'Layer', 'Stack', 'ซ้อน', 'Position'], category: 'CSS', difficulty: 'Easy' },
  { id: 17, target_word: 'Closure', forbidden_words: ['Function', 'Scope', 'Variable', 'JavaScript', 'Return'], category: 'JavaScript', difficulty: 'Hard' },
  { id: 18, target_word: 'Event Loop', forbidden_words: ['JavaScript', 'Async', 'Queue', 'Callback', 'Thread'], category: 'JavaScript', difficulty: 'Hard' },
  { id: 19, target_word: 'REST API', forbidden_words: ['HTTP', 'Endpoint', 'GET', 'POST', 'JSON'], category: 'Network', difficulty: 'Easy' },
  { id: 20, target_word: 'GraphQL', forbidden_words: ['Query', 'API', 'Schema', 'Facebook', 'REST'], category: 'Network', difficulty: 'Medium' },
  { id: 21, target_word: 'Webpack', forbidden_words: ['Bundle', 'Build', 'Module', 'JavaScript', 'Config'], category: 'Tooling', difficulty: 'Medium' },
  { id: 22, target_word: 'Dark Mode', forbidden_words: ['Theme', 'สีดำ', 'Light', 'Toggle', 'กลางคืน'], category: 'UI/UX', difficulty: 'Easy' },
  { id: 23, target_word: 'Skeleton Loading', forbidden_words: ['Placeholder', 'Loading', 'สีเทา', 'Shimmer', 'รอ'], category: 'UI/UX', difficulty: 'Medium' },
  { id: 24, target_word: 'Infinite Scroll', forbidden_words: ['เลื่อน', 'Pagination', 'Load', 'Feed', 'List'], category: 'UI/UX', difficulty: 'Medium' },
  { id: 25, target_word: 'Responsive', forbidden_words: ['Mobile', 'หน้าจอ', 'Breakpoint', 'Media Query', 'ขนาด'], category: 'CSS', difficulty: 'Easy' },
  { id: 26, target_word: 'Git Rebase', forbidden_words: ['Commit', 'Branch', 'Merge', 'History', 'Git'], category: 'Tooling', difficulty: 'Hard' },
];

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
