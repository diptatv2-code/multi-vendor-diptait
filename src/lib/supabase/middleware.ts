import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't need auth
  const publicRoutes = ['/', '/home', '/products', '/login', '/signup', '/auth/callback', '/vendor/register'];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith('/products/')
  );

  // Protected routes that require login (cart + checkout are public for guests)
  const protectedRoutes = ['/orders', '/profile', '/admin', '/vendor'];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!user && isProtectedRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    // Get user role to redirect appropriately
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    if (profile?.role === 'admin') {
      url.pathname = '/admin';
    } else if (profile?.role === 'vendor') {
      url.pathname = '/vendor';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/vendor'))) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (
      pathname.startsWith('/vendor') &&
      pathname !== '/vendor/register' &&
      profile?.role !== 'vendor' &&
      profile?.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}
