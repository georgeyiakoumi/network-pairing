import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isApiRoute = pathname.startsWith('/api')
  const isAppRoute = !isAuthRoute && !isApiRoute && pathname !== '/'

  // redirect unauthenticated users away from app routes
  if (!user && isAppRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // redirect authenticated users away from auth routes
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/match', request.url))
  }

  // Set admin cookie when visiting /admin with ?key= query param
  // so subsequent admin navigations don't need the key in the URL
  const adminKey = process.env.ADMIN_SECRET_KEY
  if (adminKey && pathname.startsWith('/admin')) {
    const queryKey = request.nextUrl.searchParams.get('key')
    if (queryKey === adminKey && !request.cookies.get('admin_key')) {
      supabaseResponse.cookies.set('admin_key', adminKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/admin',
        maxAge: 60 * 60 * 24,
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
