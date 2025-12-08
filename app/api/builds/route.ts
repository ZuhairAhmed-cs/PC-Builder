import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseClient = getSupabaseServerClient();
    const { data: builds, error } = await supabaseClient
      .from("builds")
      .select("*")
      .eq("userId", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch builds" },
        { status: 500 }
      );
    }

    return NextResponse.json({ builds });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, experienceLevel, components, totalPrice } = body;

    if (!name || !experienceLevel || !components) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const shareToken = nanoid(16);
    const supabaseClient = getSupabaseServerClient();
    
    const insertData = {
      userId: user.id,
      name,
      description: description || null,
      experience_level: experienceLevel,
      components,
      total_price: totalPrice,
      share_token: shareToken,
      is_public: false,
    };
    
    const { data: build, error } = await supabaseClient
      .from("builds")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ build }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
