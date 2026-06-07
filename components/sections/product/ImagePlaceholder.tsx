import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  className?: string;
  label?: string;
}

// Marca el espacio reservado para una foto de producto que aun no existe.
// Cuando el cliente entregue la imagen, se reemplaza por un <img>/<Image> y
// este placeholder deja de renderizarse (ver logica en cada seccion).
export function ImagePlaceholder({ className, label = 'Imagen del producto' }: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl',
        'border border-dashed border-border bg-secondary/25 text-foreground/35',
        className,
      )}
    >
      <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
      <span className="px-4 text-center text-xs font-medium uppercase tracking-[0.18em]">
        {label}
      </span>
    </div>
  );
}
