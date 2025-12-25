import { TemplatesClient } from "@/components/templates-client";
import {
  getPageByUrl,
  getAllTemplates,
  isContentstackConfigured,
  getTemplatesFromPage,
} from "@/lib/contentstack";
import { adaptTemplate } from "@/lib/contentstack/adapter";
import type { BuildTemplate } from "@/types";

export default async function TemplatesPage() {
  let templates: BuildTemplate[] = [];

  if (isContentstackConfigured()) {
    try {
      // Try to fetch from page first
      const page = await getPageByUrl("/templates");
      if (page) {
        templates = getTemplatesFromPage(page);
      }

      // If no templates from page, try direct query
      if (templates.length === 0) {
        const csTemplates = await getAllTemplates();
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
