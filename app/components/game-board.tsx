'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { shuffle, type TabooCard } from '@/lib/cards';
import type { Topic } from '@/app/actions/topics';

const MIN_SECONDS = 5;
const MAX_SECONDS = 120;
const STEP_SECONDS = 5;
const DEFAULT_SECONDS = 30;

type Phase = 'idle' | 'playing' | 'ended';
type Team = 'A' | 'B';

interface GameBoardProps {
  initialCards: TabooCard[];
  topics?: Topic[];
  selectedTopicId?: number | null;
}

export default function GameBoard({
  initialCards,
  topics = [],
  selectedTopicId = null,
}: GameBoardProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsPerCard, setSecondsPerCard] = useState(DEFAULT_SECONDS);
  const [deck, setDeck] = useState<TabooCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<Team, number>>({ A: 0, B: 0 });
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (phase !== 'playing' || isPaused) return;
    const timer = setInterval(
      () => setTimeLeft((prev) => Math.max(prev - 1, 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [phase, isPaused]);

  const startGame = () => {
    setDeck(shuffle(initialCards));
    setCurrentIndex(0);
    setScores({ A: 0, B: 0 });
    setTimeLeft(secondsPerCard);
    setIsPaused(false);
    setPhase('playing');
  };

  const endGame = () => {
    setIsPaused(false);
    setPhase('ended');
  };

  const goNextCard = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(secondsPerCard);
    } else {
      setPhase('ended');
    }
  };

  const handleTeamCorrect = (team: Team) => {
    if (timeLeft <= 0 || isPaused) return; // หมดเวลาแล้วต้องกดข้อถัดไปเท่านั้น
    setScores((prev) => ({ ...prev, [team]: prev[team] + 1 }));
    goNextCard();
  };

  const adjustSeconds = (delta: number) => {
    setSecondsPerCard((prev) =>
      Math.min(Math.max(prev + delta, MIN_SECONDS), MAX_SECONDS),
    );
  };

  const currentCard = deck[currentIndex];

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <p className="font-mono text-xs tracking-[0.4em] text-blue-600 uppercase">
            Frontend Team Game
          </p>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-900">
            Code <span className="text-blue-600">Taboo</span>
          </h1>
          <p className="max-w-md text-slate-500 leading-relaxed">
            แข่งกัน 2 ทีม — ใบ้คำศัพท์สาย dev โดยห้ามพูดคำต้องห้ามบนการ์ด
            ทีมไหนทายถูกกดเก็บแต้มทีมนั้น ถ้าหมดเวลาไม่มีใครได้แต้ม
          </p>
        </div>

        {/* เลือกหัวข้อโจทย์ */}
        {topics.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold text-slate-400">หัวข้อโจทย์</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              <Link
                href="/"
                className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition ${
                  selectedTopicId === null
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                รวม Frontend (default)
              </Link>
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/?topic=${topic.id}`}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition ${
                    selectedTopicId === topic.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {topic.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ตั้งเวลาต่อข้อ */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold text-slate-400">เวลาต่อข้อ</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => adjustSeconds(-STEP_SECONDS)}
              disabled={secondsPerCard <= MIN_SECONDS}
              className="w-12 h-12 rounded-full border border-slate-200 text-xl text-slate-600
                         hover:bg-slate-50 active:scale-95 transition disabled:opacity-30"
              aria-label="ลดเวลา"
            >
              −
            </button>
            <div className="w-28 text-center">
              <span className="font-mono text-5xl font-bold text-blue-600 tabular-nums">
                {secondsPerCard}
              </span>
              <span className="ml-1 text-slate-400 text-sm">วิ</span>
            </div>
            <button
              onClick={() => adjustSeconds(STEP_SECONDS)}
              disabled={secondsPerCard >= MAX_SECONDS}
              className="w-12 h-12 rounded-full border border-slate-200 text-xl text-slate-600
                         hover:bg-slate-50 active:scale-95 transition disabled:opacity-30"
              aria-label="เพิ่มเวลา"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={initialCards.length === 0}
          className="px-12 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg
                     hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-600/20
                     disabled:opacity-40 disabled:pointer-events-none"
        >
          เริ่มเกม
        </button>
        {initialCards.length === 0 ? (
          <p className="text-sm text-slate-400">
            หัวข้อนี้ยังไม่มีการ์ด —{' '}
            <Link href="/decks" className="text-blue-600 font-semibold hover:underline">
              ไปเพิ่มการ์ดก่อน
            </Link>
          </p>
        ) : (
          <p className="font-mono text-xs text-slate-400">
            {initialCards.length} cards loaded
          </p>
        )}
      </div>
    );
  }

  if (phase === 'ended') {
    const winner: Team | null =
      scores.A === scores.B ? null : scores.A > scores.B ? 'A' : 'B';
    return (
      <div className="flex flex-col items-center text-center gap-8">
        <p className="font-mono text-xs tracking-[0.4em] text-blue-600 uppercase">
          Game Over
        </p>
        <h2 className="text-4xl font-bold text-slate-900">
          {winner ? (
            <>
              ทีม {winner}{' '}
              <span className={winner === 'A' ? 'text-blue-600' : 'text-slate-900'}>
                ชนะ!
              </span>{' '}
              🏆
            </>
          ) : (
            'เสมอกัน! 🤝'
          )}
        </h2>

        <div className="flex items-stretch gap-6">
          <div
            className={`w-40 py-8 rounded-3xl border ${
              winner === 'A'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200'
            }`}
          >
            <p className="text-xs font-semibold text-blue-600 mb-2">
              ทีม A
            </p>
            <p className="font-mono text-6xl font-bold text-blue-600 tabular-nums">
              {scores.A}
            </p>
          </div>
          <div
            className={`w-40 py-8 rounded-3xl border ${
              winner === 'B'
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200'
            }`}
          >
            <p className="text-xs font-semibold text-slate-500 mb-2">
              ทีม B
            </p>
            <p className="font-mono text-6xl font-bold text-slate-900 tabular-nums">
              {scores.B}
            </p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="px-12 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg
                     hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-600/20"
        >
          เล่นอีกรอบ
        </button>
      </div>
    );
  }

  const timePercent = (timeLeft / secondsPerCard) * 100;
  const isUrgent = timeLeft <= 5;
  const isTimedOut = timeLeft <= 0;

  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      {/* Scores + timer */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600">
            ทีม A
          </p>
          <p className="font-mono text-4xl font-bold tabular-nums text-blue-600">
            {scores.A}
          </p>
        </div>
        <div className="text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase">
            {isPaused ? 'Paused' : 'Time'}
          </p>
          <p
            className={`font-mono text-4xl font-bold tabular-nums ${
              isPaused
                ? 'text-slate-300'
                : isUrgent
                  ? 'text-blue-600 animate-pulse'
                  : 'text-slate-900'
            }`}
          >
            {timeLeft}s
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">
            ทีม B
          </p>
          <p className="font-mono text-4xl font-bold tabular-nums text-slate-900">
            {scores.B}
          </p>
        </div>
      </div>

      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">
          <span>{currentCard.category}</span>
          <span>{currentCard.difficulty}</span>
        </div>

        <h2 className="my-8 text-center font-mono text-4xl sm:text-5xl font-bold text-slate-900 break-words">
          {currentCard.target_word}
        </h2>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-center text-xs font-semibold text-blue-600 mb-4">
            {isTimedOut ? 'หมดเวลา! ไม่มีทีมไหนได้แต้ม' : 'ห้ามพูดคำเหล่านี้'}
          </p>
          <ul className="space-y-2">
            {currentCard.forbidden_words.map((word) => (
              <li
                key={word}
                className="text-center py-2.5 rounded-xl bg-blue-50 text-blue-800 font-semibold"
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* เลือกทีมที่ทายถูก / ข้อถัดไปเมื่อหมดเวลา */}
      {isTimedOut ? (
        <button
          onClick={goNextCard}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-600/20"
        >
          {currentIndex < deck.length - 1 ? 'ข้อถัดไป →' : 'ดูคะแนน →'}
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => handleTeamCorrect('A')}
            disabled={isPaused}
            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-semibold
                       hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-600/20
                       disabled:opacity-40 disabled:pointer-events-none"
          >
            ทีม A ทายถูก
          </button>
          <button
            onClick={() => handleTeamCorrect('B')}
            disabled={isPaused}
            className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-semibold
                       hover:bg-slate-800 active:scale-95 transition shadow-lg shadow-slate-900/20
                       disabled:opacity-40 disabled:pointer-events-none"
          >
            ทีม B ทายถูก
          </button>
        </div>
      )}

      {/* พัก / จบเกม */}
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className={`text-sm font-semibold transition ${
            isPaused ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          {isPaused ? '▶ เล่นต่อ' : '⏸ พักเกม'}
        </button>
        <span className="w-px h-4 bg-slate-200" />
        <button
          onClick={endGame}
          className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition"
        >
          จบเกมเลย →
        </button>
      </div>

      <p className="text-center font-mono text-xs text-slate-400">
        card {currentIndex + 1} / {deck.length}
      </p>
    </div>
  );
}
