import Personalize from '@contentstack/personalize-edge-sdk';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const variantParam = url.searchParams.get(Personalize.VARIANT_QUERY_PARAM);
  
  return Response.json({
    edgeFunctionWorking: !!variantParam,
    variantParam: variantParam || 'NOT SET',
    allSearchParams: Object.fromEntries(url.searchParams),
    timestamp: new Date().toISOString(),
  });
}

