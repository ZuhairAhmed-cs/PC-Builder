import { TemplatesClient } from "@/components/templates-client";
import {
  getPageByUrl,
  getAllTemplates,
  isContentstackConfigured,
  getTemplatesFromPage,
} from "@/lib/contentstack";
import { adaptTemplate } from "@/lib/contentstack/adapter";
import type { BuildTemplate } from "@/types";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const queryParams = await searchParams;

  let templates: BuildTemplate[] = [];

  if (isContentstackConfigured()) {
    try {
      const page = await getPageByUrl("/templates", undefined, queryParams);
      if (page) {
        templates = getTemplatesFromPage(page);
      }

      if (templates.length === 0) {
        const csTemplates = await getAllTemplates(queryParams);
        if (csTemplates.length > 0) {
          templates = csTemplates.map(adaptTemplate);
        }
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  }

  return <TemplatesClient templates={templates} />;
}
