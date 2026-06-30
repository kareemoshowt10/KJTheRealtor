import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const user = data.user;
    if (user) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existing) {
        const fallbackUsername = (user.email ?? `user-${user.id.slice(0, 8)}`)
          .split('@')[0]
          .replace(/[^a-zA-Z0-9_]/g, '')
          .toLowerCase();

        await supabase.from('profiles').insert({
          id: user.id,
          username: fallbackUsername || `user-${user.id.slice(0, 8)}`,
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
