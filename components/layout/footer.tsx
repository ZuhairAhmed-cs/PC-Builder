import Link from "next/link";
import Image from "next/image";
import {
  getFooter,
  isContentstackConfigured,
  adaptFooter,
} from "@/lib/contentstack";

export async function Footer() {
  let logoUrl: string | undefined;
  let siteName: string | undefined;
  let description: string | undefined;
  let copyright: string | undefined;
  let navLinks: { name: string; url: string }[] = [];

  if (isContentstackConfigured()) {
    try {
      const csFooter = await getFooter();
      if (csFooter) {
        const footerData = adaptFooter(csFooter);
        logoUrl = footerData.logo;
        siteName = footerData.siteName;
        description = footerData.description;
        copyright = footerData.copyright;
        navLinks = footerData.navLinks || [];
      }
    } catch (error) {
      console.error("Error fetching footer:", error);
    }
  }

  // If no CMS data, show minimal footer
  if (!siteName) {
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

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  width={36}
                  height={36}
                  className="rounded-lg"
                  unoptimized
                />
              )}
              <span className="font-heading font-bold tracking-wider">
                {siteName}
              </span>
            </Link>
            {description && (
              <p className="text-sm text-muted-foreground max-w-xs">
                {description}
              </p>
            )}
          </div>

          {/* Quick Links */}
          {navLinks.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="text-sm text-muted-foreground hover:text-neon-green transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
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
