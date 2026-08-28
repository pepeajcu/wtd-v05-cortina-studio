declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type WhatsAppCtaLocation = 'header_menu' | 'floating_cta' | 'content';

export function trackWhatsAppClick(location: WhatsAppCtaLocation) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'click_whatsapp', whatsapp_location: location });
}
