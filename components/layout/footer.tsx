import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import {
  getFooter,
  isContentstackConfigured,
  adaptFooter,
} from "@/lib/contentstack";
import type { AdaptedFooter } from "@/lib/contentstack/adapter";

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

export async function Footer() {
  let footerData: AdaptedFooter | null = null;

  if (isContentstackConfigured()) {
    try {
      const queryParams = await getQueryParams();
      const csFooter = await getFooter(queryParams);
      if (csFooter) {
        footerData = adaptFooter(csFooter);
      }
    } catch (error) {
      console.error("Error fetching footer:", error);
    }
  }

  if (!footerData) {
    return (
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Footer content not configured
          </p>
        </div>
      </footer>
    );
  }

  const { logo, siteName, description, copyright, navLinks, $, logo$ } =
    footerData;

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {logo && (
                <Image
                  src={logo}
                  alt={`${siteName} Logo`}
                  width={36}
                  height={36}
                  className="rounded-lg"
                  unoptimized
                  {...logo$?.url}
                />
              )}
              <span
                className="font-heading font-bold tracking-wider"
                {...$?.name}
              >
                {siteName}
              </span>
            </Link>
            {description && (
              <p
                className="text-sm text-muted-foreground max-w-xs"
                {...$?.description}
              >
                {description}
              </p>
            )}
          </div>

          {navLinks.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link, index) => (
                  <li key={link.url || index}>
                    <Link
                      href={link.url}
                      className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
                      {...link.$?.title}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground" {...$?.copyright}>
            {copyright || `© ${new Date().getFullYear()} ${siteName}`}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                Contentstack
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
