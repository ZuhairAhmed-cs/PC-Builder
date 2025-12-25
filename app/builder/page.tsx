import Personalize from "@contentstack/personalize-edge-sdk";
import { getPageByUrl } from "@/lib/contentstack";
import { getComponentsByCategoryFromPage } from "@/lib/contentstack/adapter";
import { BuilderClient } from "@/components/builder-client";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  // Get variant parameter from URL (set by Launch Edge Function)
  const variantParam = searchParams[Personalize.VARIANT_QUERY_PARAM];

  // Fetch builder page data with all categories and components resolved
  // If variant param exists, CDA will return personalized component variants
  const pageData = await getPageByUrl("/builder", variantParam);

  // Extract components grouped by category
  const componentsByCategory = pageData
    ? getComponentsByCategoryFromPage(pageData)
    : [];

  return <BuilderClient componentsByCategory={componentsByCategory} />;
}
