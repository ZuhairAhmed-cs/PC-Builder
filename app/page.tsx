import { ExperienceSelector } from "@/components/experience-selector";
import { HomeRedirectCheck } from "@/components/home-redirect-check";
import {
  getPageByUrl,
  extractHeroBlock,
  isContentstackConfigured,
  getExperienceLevelsFromPage,
} from "@/lib/contentstack";
import type { ExperienceLevel } from "@/types";
import type { CSFeature } from "@/lib/contentstack/types";

export const dynamic = "force-dynamic";

interface HeroData {
  title: string;
  description: string;
  features: CSFeature[];
  $?: {
    title?: { "data-cslp": string };
    description?: { "data-cslp": string };
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const queryParams = await searchParams;

  let heroData: HeroData | null = null;
  let experienceLevels: ExperienceLevel[] = [];

  if (isContentstackConfigured()) {
    try {
      const page = await getPageByUrl("/", undefined, queryParams);
      if (page) {
        const hero = extractHeroBlock(page);
        if (hero) {
          heroData = {
            title: hero.title || "",
            description: hero.description || "",
            features: hero.features || [],
            $: hero.$,
          };
        }
        experienceLevels = getExperienceLevelsFromPage(page);
      }
    } catch (error) {
      console.error("Error fetching home page:", error);
    }
  }

  if (!heroData) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">
            Content Not Available
          </h1>
          <p className="text-muted-foreground">
            Please configure Contentstack and add home page content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HomeRedirectCheck />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12 max-w-3xl">
          <h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            {...heroData.$?.title}
          >
            <span className="text-foreground">
              {heroData.title.split(" ").slice(0, 2).join(" ")}{" "}
            </span>
            <span className="bg-gradient-to-r from-neon-green via-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              {heroData.title.split(" ").slice(2).join(" ") || "Dream PC"}
            </span>
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            {...heroData.$?.description}
          >
            {heroData.description}
          </p>
        </div>

        <ExperienceSelector experienceLevels={experienceLevels} />

        {heroData.features.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {heroData.features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FeatureCard({ feature }: { feature: CSFeature }) {
  return (
    <div className="text-center p-6">
      <div className="w-12 h-12 rounded-xl bg-surface/50 border border-border/50 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl" {...feature.$?.icon}>
          {feature.icon}
        </span>
      </div>
      <h3 className="font-heading font-semibold mb-2" {...feature.$?.title}>
        {feature.title}
      </h3>
      <p className="text-sm text-muted-foreground" {...feature.$?.description}>
        {feature.description}
      </p>
    </div>
  );
}
