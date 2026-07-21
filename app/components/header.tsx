import Link from 'next/link';
import { ClerkLoaded, Show, SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="w-full border-b border-slate-100">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-mono font-bold text-slate-900">
          CODE<span className="text-blue-600">TABOO</span>
        </Link>
        <nav className="flex items-center gap-4">
          <ClerkLoaded>
            <Show when="signed-in">
              <Link
                href="/decks"
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
              >
                โจทย์ของฉัน
              </Link>
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-4 py-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition">
                  เข้าสู่ระบบ
                </button>
              </SignInButton>
            </Show>
          </ClerkLoaded>
        </nav>
      </div>
    </header>
  );
}
