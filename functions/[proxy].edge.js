import Personalize from "@contentstack/personalize-edge-sdk";

export default async function handler(request, context) {
  try {
    const projectUid = context.env.NEXT_PUBLIC_PERSONALIZE_PROJECT_ID;
    const edgeApiUrl = context.env.NEXT_PUBLIC_PERSONALIZE_EDGE_API_URL;

    // Configure SDK for EU region if specified
    if (edgeApiUrl) {
      Personalize.setEdgeApiUrl(edgeApiUrl);
    }

    // Initialize Personalize SDK with the request
    // SDK will automatically read cookies and set user context
    const personalizeSdk = await Personalize.init(projectUid, {
      request: request,
    });

    // Get variant parameter (e.g., "a_0,b_1")
    const variantParam = personalizeSdk.getVariantParam();

    // Parse the request URL
    const url = new URL(request.url);

    // Add variant parameter to URL using SDK's constant
    url.searchParams.set(personalizeSdk.VARIANT_QUERY_PARAM, variantParam);

    // Create new request with modified URL
    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Forward to origin (Next.js)
    const response = await fetch(modifiedRequest);

    // Create new response to add state cookies
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });

    // Add Personalize state to response cookies
    await personalizeSdk.addStateToResponse(newResponse);

    return newResponse;
  } catch (error) {
    console.error("[Personalize Edge] Error:", error);

    // On error, pass through without personalization
    return fetch(request);
  }
}

/**
 * Configuration for Launch Edge Function
 * This tells Launch which routes this function should handle
 */
export const config = {
  path: "/*",
};
