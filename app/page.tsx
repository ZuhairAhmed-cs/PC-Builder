import { ExperienceSelector } from "@/components/experience-selector";
import { HomeRedirectCheck } from "@/components/home-redirect-check";
import {
  getPageByUrl,
  extractHeroBlock,
  isContentstackConfigured,
  getExperienceLevelsFromPage,
} from "@/lib/contentstack";
import type { ExperienceLevel } from "@/types";

export const dynamic = 'force-dynamic';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface HeroData {
  title: string;
  description: string;
  features: Feature[];
}

export default async function Home() {
  let heroData: HeroData | null = null;
  let experienceLevels: ExperienceLevel[] = [];

  if (isContentstackConfigured()) {
    try {
      const page = await getPageByUrl("/");
      if (page) {
        const hero = extractHeroBlock(page);
        if (hero) {
          heroData = {
            title: hero.title || "",
            description: hero.description || "",
            features:
              hero.features?.map((f) => ({
                icon: f.icon || "",
                title: f.title || "",
                description: f.description || "",
              })) || [],
          };
        }
        // Extract experience levels from page
        experienceLevels = getExperienceLevelsFromPage(page);
      }
    } catch (error) {
      console.error("Error fetching home page:", error);
    }
  }

  // If no CMS data, show error state
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
      {/* Client component to handle redirect if user already has level selected */}
      <HomeRedirectCheck />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-foreground">
              {heroData.title.split(" ").slice(0, 2).join(" ")}{" "}
            </span>
            <span className="bg-gradient-to-r from-neon-green via-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              {heroData.title.split(" ").slice(2).join(" ") || "Dream PC"}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {heroData.description}
          </p>
        </div>

        {/* Experience Level Selector */}
        <ExperienceSelector experienceLevels={experienceLevels} />

        {/* Feature highlights */}
        {heroData.features.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {heroData.features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="w-12 h-12 rounded-xl bg-surface/50 border border-border/50 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-heading font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
