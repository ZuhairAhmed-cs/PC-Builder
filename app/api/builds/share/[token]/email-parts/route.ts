import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuth } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send-email";
import { readFile } from "fs/promises";
import { join } from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const supabase = await getSupabaseAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseClient = getSupabaseServerClient();
    const { data: build, error } = await supabaseClient
      .from("builds")
      .select("*")
      .eq("share_token", token)
      .single();

    if (error || !build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    const components = build.components || {};
    let componentsHtml = "";

    const categoryNames: Record<string, string> = {
      cpu: "Processor (CPU)",
      gpu: "Graphics Card (GPU)",
      motherboard: "Motherboard",
      ram: "Memory (RAM)",
      storage: "Storage",
      psu: "Power Supply (PSU)",
      case: "Case",
      cooling: "Cooling",
    };

    for (const [category, component] of Object.entries(components)) {
      if (component && typeof component === "object") {
        const comp = component as any;
        
        const componentName = comp.name || comp.title || "Component";
        const price = comp.price || 0;
        const productLink = comp.productLinks?.amazon?.url || 
                            comp.productLinks?.flipkart?.url ||
                            comp.product_links?.[0]?.link?.href ||
                            comp.productLink || 
                            comp.productUrl || 
                            "#";
        
        componentsHtml += `
          <div class="component">
            <div class="component-category">${categoryNames[category] || category}</div>
            <div class="component-name">${componentName}</div>
            <div class="component-price">₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            ${productLink !== "#" ? `<a href="${productLink}" class="component-link">View Product</a>` : '<span class="text-muted-foreground text-sm">No link available</span>'}
          </div>
        `;
      }
    }

    const buildLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005"}/share/${token}`;

    const templatePath = join(
      process.cwd(),
      "lib/email/templates/parts-list.html"
    );
    let template = await readFile(templatePath, "utf-8");

    template = template
      .replace("{{BUILD_NAME}}", build.name || "PC Build")
      .replace("{{BUILD_DESCRIPTION}}", build.description || "")
      .replace("{{COMPONENTS}}", componentsHtml)
      .replace("{{TOTAL_PRICE}}", `₹${(build.total_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      .replace(/{{BUILD_LINK}}/g, buildLink);

    await sendEmail({
      to: user.email,
      subject: `Your PC Build Parts List - ${build.name}`,
      html: template,
    });

    return NextResponse.json(
      { message: "Parts list email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending parts list email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

