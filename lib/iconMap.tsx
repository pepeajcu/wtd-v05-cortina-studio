import type { ComponentType } from 'react';
import {
  Thermometer,
  EyeOff,
  VolumeX,
  Sparkles,
  MapPin,
  Palette,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lucide icons y nuestro WhatsAppIcon tienen firmas incompatibles a nivel de tipo
// (Lucide expone ForwardRefExoticComponent con strokeWidth: string | number).
// Usar `any` aqui acepta ambos en el registry sin friccion en cada consumidor.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IconComponent = ComponentType<any>;

const WhatsAppIcon: IconComponent = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('h-6 w-6', className)}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.041-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.866 9.866 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.825 9.825 0 016.99 2.901 9.825 9.825 0 012.892 6.994c-.002 5.45-4.436 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

/**
 * Registry de iconos consumido por las constantes estructurales de cada seccion
 * (ej. PROBLEM_CARDS en ProblemsSection, PROCESS_STEPS en ProcessSection).
 * Acepta nombres de componentes Lucide o slugs ad-hoc (`whatsapp`, `mappin`, ...).
 */
const REGISTRY: Record<string, IconComponent> = {
  Thermometer,
  EyeOff,
  VolumeX,
  Sparkles,
  whatsapp: WhatsAppIcon,
  mappin: MapPin,
  palette: Palette,
  wrench: Wrench,
};

export function getIcon(name: string | null | undefined): IconComponent {
  if (name && REGISTRY[name]) return REGISTRY[name];
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[iconMap] Icono no registrado: "${name}". Fallback a HelpCircle.`);
  }
  return HelpCircle;
}
