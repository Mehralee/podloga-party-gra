import { useEffect, useState } from "react";
import { getImageUrl } from "./imageStore";

/** Resolves a locally stored image id to a displayable object URL. */
export function useImageUrl(imageId: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!imageId) {
      setUrl(null);
      return;
    }
    getImageUrl(imageId).then((value) => {
      if (active) setUrl(value);
    });
    return () => {
      active = false;
    };
  }, [imageId]);

  return url;
}
