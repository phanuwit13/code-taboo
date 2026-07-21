-- หัวข้อโจทย์ของแต่ละ user (user_id = Clerk user id)
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_user ON topics(user_id);

-- การ์ดคำศัพท์ในแต่ละหัวข้อ
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    target_word TEXT NOT NULL,
    forbidden_words TEXT NOT NULL, -- JSON array string เช่น '["React", "Component", "State"]'
    category TEXT DEFAULT 'Custom',
    difficulty TEXT DEFAULT 'Medium', -- Easy, Medium, Hard
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cards_topic ON cards(topic_id);
