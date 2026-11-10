import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const authRoutes = ["/login", "/signup"]
const protectedRoutes = ["/shop", "/cart", "/checkout", "/orders", "/returns", "/admin", "/retailer"]
const adminRoutes = ["/admin"]
const retailerRoutes = ["/retailer"]

function isInRouteGroup(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect authenticated users away from login/signup based on role
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const role = await getUserRole(supabase, user.id)
    if (role === "retailer") {
      return NextResponse.redirect(new URL("/retailer", request.url))
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/shop", request.url))
  }

  // Protect private routes (require login)
  if (!user && isInRouteGroup(pathname, protectedRoutes)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role guards for logged-in users
  if (user && isInRouteGroup(pathname, retailerRoutes)) {
    const role = await getUserRole(supabase, user.id)
    if (role !== "retailer") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (user && isInRouteGroup(pathname, adminRoutes)) {
    const role = await getUserRole(supabase, user.id)
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (error || !data) {
    return "customer"
  }

  return data.role as string
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
