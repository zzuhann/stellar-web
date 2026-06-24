import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paths } = (await request.json()) as { paths: string[] };
    paths.forEach((path) => revalidatePath(path));
    return NextResponse.json({ revalidated: true, paths });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
