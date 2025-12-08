import Personalize from "@contentstack/personalize-edge-sdk";

const EXPERIENCE_COOKIE_NAME = "pc_builder_experience";

function getCookieValue(request, cookieName) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name === cookieName) {
      return valueParts.join("=");
    }
  }
  return null;
}

export default async function handler(request, context) {
  const parsedUrl = new URL(request.url);
  const pathname = parsedUrl.pathname;

  const shouldPersonalize = pathname === "/builder";
  
  if (!shouldPersonalize) {
    return fetch(request);
  }

  const edgeApiUrl =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  const projectUid =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;

  if (edgeApiUrl) {
    Personalize.setEdgeApiUrl(edgeApiUrl);
  }

  try {
    Personalize.reset();
    
    const personalizeSdk = await Personalize.init(projectUid, { request });

    const experienceLevel = getCookieValue(request, EXPERIENCE_COOKIE_NAME);

    if (experienceLevel) {
      personalizeSdk.set({ experience_level: experienceLevel });
    }

    const variantParam = personalizeSdk.getVariantParam();

    parsedUrl.searchParams.set(
      personalizeSdk.VARIANT_QUERY_PARAM,
      variantParam
    );

    const modifiedRequest = new Request(parsedUrl.toString(), request);

    const response = await fetch(modifiedRequest);

    const modifiedResponse = new Response(response.body, response);

    personalizeSdk.addStateToResponse(modifiedResponse);

    modifiedResponse.headers.set("cache-control", "no-store");

    return modifiedResponse;
  } catch (error) {
    return fetch(request);
  }
}
