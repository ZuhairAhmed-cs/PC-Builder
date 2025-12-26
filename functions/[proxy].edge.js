import Personalize from "@contentstack/personalize-edge-sdk";

export default async function handler(request, context) {
  const parsedUrl = new URL(request.url);
  const pathname = parsedUrl.pathname;

  // Skip edge function for static assets (prevents infinite loops)
  if (["_next", "favicon.ico"].some((path) => pathname.includes(path))) {
    return fetch(request);
  }

  // Configure SDK for EU region if specified
  if (context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
    Personalize.setEdgeApiUrl(
      context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL
    );
  }

  // Initialize Personalize SDK with the request
  // SDK will automatically read cookies and set user context
  const personalizeSdk = await Personalize.init(
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID,
    { request }
  );

  // Get variant parameter (e.g., "a_0,b_1")
  const variantParam = personalizeSdk.getVariantParam();

  // Add variant parameter to URL using SDK's constant
  parsedUrl.searchParams.set(personalizeSdk.VARIANT_QUERY_PARAM, variantParam);

  // Create new request with modified URL
  const modifiedRequest = new Request(parsedUrl.toString(), request);

  // Forward to origin (Next.js)
  const response = await fetch(modifiedRequest);

  // Create new response to add state cookies
  const modifiedResponse = new Response(response.body, response);

  // Add Personalize state to response cookies
  personalizeSdk.addStateToResponse(modifiedResponse);

  // Prevent CDN caching of personalized content
  modifiedResponse.headers.set("cache-control", "no-store");

  return modifiedResponse;
}

/**
 * Configuration for Launch Edge Function
 * This tells Launch which routes this function should handle
 */
export const config = {
  path: "/*",
};
