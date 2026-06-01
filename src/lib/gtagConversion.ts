// lib/gtagConversion.ts
declare global {
  interface Window { gtag?: (...args: any[]) => void; }
}

export function reportInquiryConversion() {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: "AW-17701157571/_FdXCPrx3ZkcEMP1yPhB",
    });
  }
}
