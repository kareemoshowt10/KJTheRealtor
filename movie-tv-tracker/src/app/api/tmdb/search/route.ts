import { NextResponse, type NextRequest } from 'next/server';
import { searchTitles } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchTitles(query);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'TMDB search failed' },
      { status: 502 }
    );
  }
}
