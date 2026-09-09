/**
 * Plan Registry — maps plan IDs to their current file URLs.
 *
 * Recursively crawls the plans.json index (and any nested category sub-indexes)
 * so that share links can use stable plan IDs instead of file paths.
 * When a plan is moved from one folder to another, only the registry (plans.json)
 * needs updating — all existing ID-based share links keep working.
 */

export interface PlanRegistryEntry {
  id: string;
  url: string;
  title: string;
}

/** In-memory cache so we don't re-fetch on every share link click */
let registryCache: Map<string, PlanRegistryEntry> | null = null;
let registryPromise: Promise<Map<string, PlanRegistryEntry>> | null = null;

/**
 * Recursively fetch a plans.json index and all category sub-indexes,
 * collecting every non-category plan's { id, url } into the map.
 */
async function crawlIndex(indexUrl: string, map: Map<string, PlanRegistryEntry>): Promise<void> {
  try {
    const cacheBustUrl = indexUrl.includes('?')
      ? `${indexUrl}&_t=${Date.now()}`
      : `${indexUrl}?_t=${Date.now()}`;

    const res = await fetch(cacheBustUrl, { cache: 'no-cache' });
    if (!res.ok) return;

    const data = await res.json();
    const plans: any[] = Array.isArray(data) ? data : (data.plans || []);

    const categoryFetches: Promise<void>[] = [];

    for (const item of plans) {
      if (!item.id || !item.url) continue;

      if (item.type === 'category') {
        // Recurse into sub-index
        const subUrl = item.url.startsWith('http') || item.url.startsWith('/')
          ? item.url
          : `/${item.url}`;
        categoryFetches.push(crawlIndex(subUrl, map));
      } else {
        // Register this plan
        map.set(item.id, {
          id: item.id,
          url: item.url,
          title: item.title || item.id
        });
      }
    }

    await Promise.all(categoryFetches);
  } catch (err) {
    console.debug('[PlanRegistry] Failed to crawl index:', indexUrl, err);
  }
}

/**
 * Build (or return cached) plan registry.
 * @param repositoryUrl  The root plans.json URL (e.g. "/plans.json")
 */
export async function buildPlanRegistry(
  repositoryUrl: string
): Promise<Map<string, PlanRegistryEntry>> {
  if (registryCache) return registryCache;

  // Deduplicate concurrent calls
  if (registryPromise) return registryPromise;

  registryPromise = (async () => {
    const map = new Map<string, PlanRegistryEntry>();
    const rootUrl = repositoryUrl.startsWith('http') || repositoryUrl.startsWith('/')
      ? repositoryUrl
      : `/${repositoryUrl}`;
    await crawlIndex(rootUrl, map);
    registryCache = map;
    return map;
  })();

  return registryPromise;
}

/**
 * Look up a plan's current file URL by its ID.
 * Returns the URL string, or null if the ID is not found in the registry.
 */
export async function resolvePlanUrl(
  planId: string,
  repositoryUrl: string
): Promise<string | null> {
  const registry = await buildPlanRegistry(repositoryUrl);
  const entry = registry.get(planId);
  return entry?.url ?? null;
}

/**
 * Detect whether a `?plan=` parameter value is a legacy URL or a plan ID.
 *
 * Legacy URLs contain `/` or end with `.json` or start with `http`.
 * Plan IDs are simple slug strings like "prayers-of-paul-essentials".
 */
export function isLegacyPlanUrl(planParam: string): boolean {
  return planParam.includes('/') || planParam.endsWith('.json') || planParam.startsWith('http');
}

/** Invalidate the cached registry (e.g. after switching repository) */
export function invalidateRegistry(): void {
  registryCache = null;
  registryPromise = null;
}
