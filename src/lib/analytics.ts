// lib/analytics.ts
// GA4 e-commerce event helpers.
//
// These send the standard GA4 "recommended e-commerce" events for the
// view -> add_to_cart -> begin_checkout -> purchase funnel.
//
// Delivery strategy (no double counting):
//   1. If a Google tag / GA4 is already on the page (window.gtag exists —
//      e.g. the G-… Google tag loaded via Matteo's GTM container), send the
//      event straight through gtag('event', …). It lands in GA4 with NO GTM
//      trigger configuration required.
//   2. Otherwise fall back to a GTM dataLayer ecommerce push, which a GA4
//      tag in a GTM container can be configured to listen for.
//
// Schema reference: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

type DataLayerItem = {
  item_id?: string | number;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const CURRENCY = 'USD';

function pushEcommerce(event: string, ecommerce: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Preferred path: a Google tag (GA4) is already present on the page.
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, ecommerce);
    return;
  }

  // Fallback path: GTM dataLayer ecommerce push.
  window.dataLayer = window.dataLayer || [];
  // GA4 best practice: clear the previous ecommerce object so values
  // from a prior event don't bleed into this one.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
}

function toItem(p: any, quantity = 1): DataLayerItem {
  return {
    item_id: p?.styleName || p?.parentName || p?.id,
    item_name: p?.title || p?.parentName || 'Unknown Item',
    item_category: p?.category,
    item_variant: p?.variationTitle,
    price: Number(p?.price) || 0,
    quantity,
  };
}

/** Fired when a shop product page is viewed. This is the "looking" signal. */
export function trackViewItem(product: any) {
  const item = toItem(product);
  pushEcommerce('view_item', {
    currency: CURRENCY,
    value: item.price || 0,
    items: [item],
  });
}

/** Fired when an item is added to the bag. */
export function trackAddToCart(product: any, quantity = 1) {
  const item = toItem(product, quantity);
  pushEcommerce('add_to_cart', {
    currency: CURRENCY,
    value: (item.price || 0) * quantity,
    items: [item],
  });
}

/** Fired when the customer starts the checkout / payment step. */
export function trackBeginCheckout(cartItems: any[], value: number) {
  pushEcommerce('begin_checkout', {
    currency: CURRENCY,
    value: Number(value) || 0,
    items: (cartItems || []).map((i) => toItem(i, i?.quantity || 1)),
  });
}
