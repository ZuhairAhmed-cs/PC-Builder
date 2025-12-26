import Personalize from "@contentstack/personalize-edge-sdk";

export default async function handler(request, context) {
  console.log("==========================================");
  console.log("🚀 [EDGE FUNCTION] INVOKED!");
  console.log("📍 [EDGE FUNCTION] URL:", request.url);
  console.log("==========================================");

  const parsedUrl = new URL(request.url);
  const pathname = parsedUrl.pathname;
  console.log("📂 [EDGE FUNCTION] Pathname:", pathname);

  // Skip edge function for static assets (prevents infinite loops)
  if (["_next", "favicon.ico"].some((path) => pathname.includes(path))) {
    console.log("⏭️  [EDGE FUNCTION] Skipping static asset");
    return fetch(request);
  }

  console.log("🔧 [EDGE FUNCTION] Processing personalization...");

  // Configure SDK for EU region if specified
  const edgeApiUrl =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL;
  const projectUid =
    context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;

  console.log("🔑 [EDGE FUNCTION] Project UID exists:", !!projectUid);
  console.log("🌍 [EDGE FUNCTION] Edge API URL exists:", !!edgeApiUrl);

  if (edgeApiUrl) {
    console.log("🌍 [EDGE FUNCTION] Setting Edge API URL");
    Personalize.setEdgeApiUrl(edgeApiUrl);
  }

  // Initialize Personalize SDK with the request
  console.log("🎯 [EDGE FUNCTION] Initializing Personalize SDK...");
  try {
    const personalizeSdk = await Personalize.init(projectUid, { request });
    console.log("✅ [EDGE FUNCTION] Personalize SDK initialized successfully");

    // Get variant parameter (e.g., "a_0,b_1")
    const variantParam = personalizeSdk.getVariantParam();
    console.log("🎲 [EDGE FUNCTION] Variant param:", variantParam);

    // Add variant parameter to URL using SDK's constant
    parsedUrl.searchParams.set(
      personalizeSdk.VARIANT_QUERY_PARAM,
      variantParam
    );
    console.log("🔗 [EDGE FUNCTION] Modified URL:", parsedUrl.toString());

    // Create new request with modified URL
    const modifiedRequest = new Request(parsedUrl.toString(), request);

    // Forward to origin (Next.js)
    console.log("📤 [EDGE FUNCTION] Fetching from origin...");
    const response = await fetch(modifiedRequest);
    console.log("📥 [EDGE FUNCTION] Response status:", response.status);

    // Create new response to add state cookies
    const modifiedResponse = new Response(response.body, response);

    // Add Personalize state to response cookies
    personalizeSdk.addStateToResponse(modifiedResponse);

    // Prevent CDN caching of personalized content
    modifiedResponse.headers.set("cache-control", "no-store");

    console.log("✅ [EDGE FUNCTION] Returning personalized response");
    console.log("==========================================");
    return modifiedResponse;
  } catch (error) {
    console.error("❌ [EDGE FUNCTION] Error:", error);
    console.error("❌ [EDGE FUNCTION] Stack:", error.stack);
    // Return original request on error
    return fetch(request);
  }
}
