import { clerkMiddleware } from '@clerk/nextjs/server';

// ให้ Clerk อ่าน session ทุก request — การกันหน้า /decks ทำที่ระดับ page ด้วย auth()
export default clerkMiddleware();

export const config = {
  matcher: [
    // ข้าม static files และ _next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
