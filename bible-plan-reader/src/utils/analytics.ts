// Google Analytics 4 (GA4) Tracking Utility
// Measurement ID: G-CKGXRLYYZJ

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-CKGXRLYYZJ';

/**
 * Generic event tracker that safely calls window.gtag if available
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // Filter out null or undefined values
    const cleanedParams: Record<string, string | number | boolean> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) {
          cleanedParams[key] = value;
        }
      }
    }
    window.gtag('event', eventName, cleanedParams);
  }
}

// ── Plan Events ──

/**
 * Track when a user selects or opens a reading/prayer plan
 */
export function trackPlanSelected(planId: string, planTitle: string, planType?: string): void {
  trackEvent('plan_selected', {
    plan_id: planId,
    plan_title: planTitle,
    plan_type: planType || 'reading',
  });
}

/**
 * Track when a user views a specific item/session/day
 */
export function trackItemViewed(
  planId: string,
  itemNumber: number,
  itemTitle: string,
  planTitle?: string
): void {
  trackEvent('item_viewed', {
    plan_id: planId,
    item_number: itemNumber,
    item_title: itemTitle,
    plan_title: planTitle,
  });
}

/**
 * Track when a user marks an item/session completed
 */
export function trackItemCompleted(
  planId: string,
  itemNumber: number,
  totalItems: number,
  isCompleted: boolean
): void {
  trackEvent('item_completed', {
    plan_id: planId,
    item_number: itemNumber,
    total_items: totalItems,
    is_completed: isCompleted,
    progress_pct: totalItems > 0 ? Math.round((itemNumber / totalItems) * 100) : 0,
  });
}

/**
 * Track when a user completes all items in a plan
 */
export function trackPlanCompleted(planId: string, planTitle: string, totalItems: number): void {
  trackEvent('plan_completed', {
    plan_id: planId,
    plan_title: planTitle,
    total_items: totalItems,
  });
}

// ── Content Engagement Events ──

/**
 * Track when a user expands and reads scripture text
 */
export function trackScriptureRead(planId: string, itemNumber: number, passages: string): void {
  trackEvent('scripture_read', {
    plan_id: planId,
    item_number: itemNumber,
    passage: passages,
  });
}

/**
 * Track when a user clicks an external Bible passage link (e.g. to Bible.com)
 */
export function trackBibleLinkClicked(
  planId: string,
  itemNumber: number,
  passage: string,
  translation: string,
  url: string
): void {
  trackEvent('bible_link_clicked', {
    plan_id: planId,
    item_number: itemNumber,
    passage,
    translation,
    link_url: url,
  });
}

/**
 * Track when a user switches between tabs (Read & Reflect vs Prayers)
 */
export function trackTabSwitched(tab: string, planId?: string, itemNumber?: number): void {
  trackEvent('tab_switched', {
    tab_name: tab,
    plan_id: planId,
    item_number: itemNumber,
  });
}

// ── Sharing Events ──

/**
 * Track when content is shared via WhatsApp or native share / copy link
 */
export function trackContentShared(
  method: 'whatsapp' | 'native_share' | 'copy_link',
  planId: string,
  itemNumber: number,
  planTitle?: string
): void {
  trackEvent('content_shared', {
    method,
    plan_id: planId,
    item_number: itemNumber,
    plan_title: planTitle,
  });
}

// ── Settings Events ──

/**
 * Track changes to user settings (font size, theme, bible translation)
 */
export function trackSettingsChanged(setting: 'fontSize' | 'theme' | 'bibleTranslation', value: string): void {
  trackEvent('settings_changed', {
    setting_name: setting,
    setting_value: value,
  });
}

// ── SPA Page View Tracking ──

/**
 * Track virtual page views for SPA navigation
 */
export function trackPageView(pagePath: string, pageTitle: string): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}
