"use client";

import { useState } from "react";

/**
 * Renders `article.image_url` when present, hiding the image if it fails to
 * load. Absent images get a decorative fallback from the caller.
 */
export default function ArticleImage({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setHasFailed] = useState(false);

  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setHasFailed(true)}
    />
  );
}
