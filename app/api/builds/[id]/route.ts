import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const supabaseClient = getSupabaseServerClient();
    const { data: build, error } = await supabaseClient
      .from("builds")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    if (!build.is_public && build.userId !== user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ build });
  } catch (error) {
    console.error("Error in GET /api/builds/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, experienceLevel, components, totalPrice, isPublic } = body;

    const supabaseClient = getSupabaseServerClient();
    
    const { data: existingBuild } = await supabaseClient
      .from("builds")
      .select("userId")
      .eq("id", id)
      .single();

    if (!existingBuild || existingBuild.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (experienceLevel !== undefined) updateData.experience_level = experienceLevel;
    if (components !== undefined) updateData.components = components;
    if (totalPrice !== undefined) updateData.total_price = totalPrice;
    if (isPublic !== undefined) updateData.is_public = isPublic;

    const { data: build, error } = await supabaseClient
      .from("builds")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating build:", error);
      return NextResponse.json(
        { error: "Failed to update build" },
        { status: 500 }
      );
    }

    return NextResponse.json({ build });
  } catch (error) {
    console.error("Error in PATCH /api/builds/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseClient = getSupabaseServerClient();
    
    const { data: existingBuild } = await supabaseClient
      .from("builds")
      .select("userId")
      .eq("id", id)
      .single();

    if (!existingBuild || existingBuild.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabaseClient.from("builds").delete().eq("id", id);

    if (error) {
      console.error("Error deleting build:", error);
      return NextResponse.json(
        { error: "Failed to delete build" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/builds/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
