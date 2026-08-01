// lib/gtagConversion.ts
declare global {
  interface Window { gtag?: (...args: any[]) => void; }
}

export function reportInquiryConversion() {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: "AW-17701157571/_FdXCPrx3ZkcEMP1yPhB",
    });
    // GA4 lead event (routes to the G- config) so inquiries appear in the
    // GA4 funnel alongside view_item / add_to_cart / purchase.
    window.gtag("event", "generate_lead", { lead_type: "inquiry_form" });
  }
}
