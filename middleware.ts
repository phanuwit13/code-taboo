import { clerkMiddleware } from '@clerk/nextjs/server';

// ให้ Clerk อ่าน session ทุก request — การกันหน้า /decks ทำที่ระดับ page ด้วย auth()
// หมายเหตุ: ใช้ middleware.ts (edge) แทน proxy.ts (Node) เพราะ OpenNext/Cloudflare Workers
// ยังไม่รองรับ Node.js middleware — Next 16 จะขึ้น deprecation warning ซึ่งยอมรับได้
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
