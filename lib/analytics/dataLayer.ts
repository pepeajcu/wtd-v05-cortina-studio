declare global {
  interface Window {
    // @next/third-parties ya declara `dataLayer?: Object[]` globalmente;
    // se respeta el mismo modificador opcional para no chocar en el merge de tipos.
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayerEvent(event: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push(event);
}
