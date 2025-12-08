import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getOrigin } from "@/lib/utils/get-origin";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  const origin = getOrigin(request);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const nextUrl = new URL(next, origin);
      const action = nextUrl.searchParams.get("action");

      if (action === "save") {
        return NextResponse.redirect(
          new URL("/auth/complete-signup?action=save", origin)
        );
      } else if (action === "email-parts") {
        const token = nextUrl.searchParams.get("token");
        return NextResponse.redirect(
          new URL(
            `/auth/complete-signup?action=email-parts&token=${token}`,
            origin
          )
        );
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", origin));
}
