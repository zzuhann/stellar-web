import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// 清掉全部公開頁的 ISR 快取，不再依 body 精準列路徑。
// 決策見 specs/_decisions/isr-cache-invalidation.md。
export async function POST() {
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true });
}
