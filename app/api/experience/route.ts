import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXPERIENCE_COOKIE_NAME = "pc_builder_experience";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level } = body;

    const validLevels = ["beginner", "intermediate", "advanced"];
    if (!level || !validLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid experience level" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(EXPERIENCE_COOKIE_NAME, level, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true, level });
  } catch (error) {
    console.error("Error setting experience cookie:", error);
    return NextResponse.json(
      { error: "Failed to set experience level" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const experienceCookie = cookieStore.get(EXPERIENCE_COOKIE_NAME);

    return NextResponse.json({
      level: experienceCookie?.value || null,
    });
  } catch (error) {
    console.error("Error getting experience cookie:", error);
    return NextResponse.json(
      { error: "Failed to get experience level" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(EXPERIENCE_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience cookie:", error);
    return NextResponse.json(
      { error: "Failed to delete experience level" },
      { status: 500 }
    );
  }
}
