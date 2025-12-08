import { notFound } from "next/navigation";
import { SharedBuildClient } from "@/components/share/shared-build-client";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export default async function SharedBuildPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = getSupabaseServerClient();
  const { data: build, error } = await supabase
    .from("builds")
    .select("*")
    .eq("share_token", token)
    .single();

  if (error || !build) {
    notFound();
  }

  const user = await getUser();

  if (!build.is_public && build.userId !== user?.id) {
    notFound();
  }

  let creatorInfo: { name: string | null; email: string | null } | null = null;
  if (build.userId) {
    const { data: profile } = await supabase
      .rpc("get_user_profile", { user_id: build.userId })
      .single<{ email: string; display_name: string }>();

    if (profile) {
      creatorInfo = {
        name: profile.display_name || null,
        email: profile.email || null,
      };
    }
  }

  await supabase
    .from("builds")
    .update({ view_count: build.view_count + 1 })
    .eq("id", build.id);

  return <SharedBuildClient build={build} creatorInfo={creatorInfo} />;
}

export const dynamic = "force-dynamic";
