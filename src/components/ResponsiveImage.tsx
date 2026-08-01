import React from 'react';

interface ResponsiveImageProps {
  baseSrc: string; // The base name, e.g. /assets/furniture/sofa_079.webp
  alt: string;
  className?: string; // Additional classes for styling
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  draggable?: boolean;
  style?: React.CSSProperties;
  /** Optional cap on the largest generated variant served. Card-size slots
      can pass 'md' (or 'sm') so they stop fetching the heavy -lg files.
      Omitted = no cap; output is identical to before this prop existed. */
  maxVariant?: 'sm' | 'md' | 'lg';
  /** Optional passthrough for the native img `sizes` attribute. */
  sizes?: string;
}

const VARIANT_ORDER = ['sm', 'md', 'lg'] as const;

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  baseSrc,
  alt,
  className = "",
  fetchPriority = "auto",
  loading = "lazy",
  draggable,
  style,
  maxVariant,
  sizes
}) => {
  // React 18 drops the camelCase `fetchPriority` prop with a console warning;
  // lowercase custom attributes are forwarded to the DOM as-is. We omit the
  // attribute entirely for "auto" (the spec default) so default markup is
  // unchanged for existing callers.
  const fetchPriorityAttr = (
    fetchPriority !== 'auto' ? { fetchpriority: fetchPriority } : {}
  ) as Record<string, string>;

  // If the src does not end in .webp or is missing, simply return a standard image
  // (We only generated srcset variants for .webp via our node script)
  if (!baseSrc || typeof baseSrc !== 'string' || !baseSrc.endsWith('.webp')) {
    return (
      <img
        src={baseSrc}
        alt={alt}
        className={className}
        {...fetchPriorityAttr}
        loading={loading}
        draggable={draggable}
        style={style}
        sizes={sizes}
      />
    );
  }

  // Construct responsive paths (assumes our optimize-images pipeline ran)
  const dir = baseSrc.substring(0, baseSrc.lastIndexOf('/'));
  const filename = baseSrc.substring(baseSrc.lastIndexOf('/') + 1);
  const nameBase = filename.substring(0, filename.lastIndexOf('.'));

  // Cap each slot at maxVariant when provided (default: no cap)
  const capIndex = maxVariant ? VARIANT_ORDER.indexOf(maxVariant) : VARIANT_ORDER.length - 1;
  const variantUrl = (size: (typeof VARIANT_ORDER)[number]) => {
    const capped = VARIANT_ORDER[Math.min(VARIANT_ORDER.indexOf(size), capIndex)];
    return `${dir}/${nameBase}-${capped}.webp`;
  };

  const smUrl = variantUrl('sm');
  const mdUrl = variantUrl('md');
  const lgUrl = variantUrl('lg');

  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={smUrl} />
      <source media="(max-width: 1024px)" srcSet={mdUrl} />
      <source media="(min-width: 1025px)" srcSet={lgUrl} />
      <img
        src={lgUrl} // Fallback to the largest permitted variant
        alt={alt}
        className={className}
        {...fetchPriorityAttr}
        loading={loading}
        draggable={draggable}
        style={style}
        sizes={sizes}
      />
    </picture>
  );
};
