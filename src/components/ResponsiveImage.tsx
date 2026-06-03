import React from 'react';

interface ResponsiveImageProps {
  baseSrc: string; // The base name, e.g. /assets/furniture/sofa_079.webp
  alt: string;
  className?: string; // Additional classes for styling
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  draggable?: boolean;
  style?: React.CSSProperties;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  baseSrc,
  alt,
  className = "",
  fetchPriority = "auto",
  loading = "lazy",
  draggable,
  style
}) => {
  // If the src does not end in .webp or is missing, simply return a standard image 
  // (We only generated srcset variants for .webp via our node script)
  if (!baseSrc || typeof baseSrc !== 'string' || !baseSrc.endsWith('.webp')) {
    return (
      <img
        src={baseSrc}
        alt={alt}
        className={className}
        fetchPriority={fetchPriority}
        loading={loading}
        draggable={draggable}
        style={style}
      />
    );
  }

  // Construct responsive paths (assumes our optimize-images pipeline ran)
  const dir = baseSrc.substring(0, baseSrc.lastIndexOf('/'));
  const filename = baseSrc.substring(baseSrc.lastIndexOf('/') + 1);
  const nameBase = filename.substring(0, filename.lastIndexOf('.'));

  const smUrl = `${dir}/${nameBase}-sm.webp`;
  const mdUrl = `${dir}/${nameBase}-md.webp`;
  const lgUrl = `${dir}/${nameBase}-lg.webp`;

  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={smUrl} />
      <source media="(max-width: 1024px)" srcSet={mdUrl} />
      <source media="(min-width: 1025px)" srcSet={lgUrl} />
      <img
        src={lgUrl} // Fallback to large
        alt={alt}
        className={className}
        fetchPriority={fetchPriority}
        loading={loading}
        draggable={draggable}
        style={style}
      />
    </picture>
  );
};
