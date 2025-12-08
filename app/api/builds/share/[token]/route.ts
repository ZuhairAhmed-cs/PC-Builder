import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const supabase = getSupabaseServerClient();
    const { data: build, error } = await supabase
      .from("builds")
      .select("*")
      .eq("share_token", token)
      .single();

    if (error || !build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    const user = await getUser();
    
    if (!build.is_public && build.userId !== user?.id) {
      return NextResponse.json(
        { error: "This build is not public" },
        { status: 403 }
      );
    }

    await supabase
      .from("builds")
      .update({ view_count: build.view_count + 1 })
      .eq("id", build.id);

    return NextResponse.json({ build });
  } catch (error) {
    console.error("Error in GET /api/builds/share/[token]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";


