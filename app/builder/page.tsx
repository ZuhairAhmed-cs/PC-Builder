import Personalize from "@contentstack/personalize-edge-sdk";
import { getPageByUrl } from "@/lib/contentstack";
import { getComponentsByCategoryFromPage } from "@/lib/contentstack/adapter";
import { BuilderClient } from "@/components/builder-client";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const variantParam = params[Personalize.VARIANT_QUERY_PARAM];

  const pageData = await getPageByUrl("/builder", variantParam, params);

  const componentsByCategory = pageData
    ? getComponentsByCategoryFromPage(pageData)
    : [];

  return <BuilderClient componentsByCategory={componentsByCategory} />;
}
