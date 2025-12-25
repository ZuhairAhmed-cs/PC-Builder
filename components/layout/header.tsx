import {
  getHeader,
  isContentstackConfigured,
  adaptHeader,
} from "@/lib/contentstack";
import { HeaderClient } from "./header-client";
import type { AdaptedHeader } from "@/lib/contentstack/adapter";

export async function Header() {
  let headerData: AdaptedHeader | null = null;

  if (isContentstackConfigured()) {
    try {
      const csHeader = await getHeader();
      if (csHeader) {
        headerData = adaptHeader(csHeader);
      }
    } catch (error) {
      console.error("Error fetching header:", error);
    }
  }

  // If no CMS data, show minimal header
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

  return <HeaderClient headerData={headerData} />;
}
