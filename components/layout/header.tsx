import { headers } from "next/headers";
import {
  getHeader,
  isContentstackConfigured,
  adaptHeader,
} from "@/lib/contentstack";
import { getUser } from "@/lib/auth";
import { HeaderClient } from "./header-client";
import type { AdaptedHeader } from "@/lib/contentstack/adapter";

async function getQueryParams(): Promise<Record<string, string>> {
  try {
    const headersList = await headers();
    const referer = headersList.get("referer");
    if (referer) {
      const url = new URL(referer);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    }
  } catch {}
  return {};
}

export async function Header() {
  let headerData: AdaptedHeader | null = null;

  if (isContentstackConfigured()) {
    try {
      const queryParams = await getQueryParams();
      const csHeader = await getHeader(queryParams);
      if (csHeader) {
        headerData = adaptHeader(csHeader);
      }
    } catch (error) {
      console.error("Error fetching header:", error);
    }
  }

  if (!headerData) {
    return (
      <header className="border-b border-border/50 bg-surface/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">
            Header content not configured
          </span>
        </div>
      </header>
    );
  }

  const user = await getUser();

  return <HeaderClient headerData={headerData} user={user} />;
}
