/**
 * Image compression, white border trimming, and deduplication helpers for Facebook Matrix
 * Automatically detects and trims white margins from screenshots/downloads
 * and enforces strict 1:1 photo deduplication across accounts.
 */

/**
 * Detects and trims white, near-white, or transparent borders from an image.
 * Solves the common issue where screenshots or saved photos contain 1-20px white bars on edges.
 */
export async function trimWhiteBorders(
  dataUriOrFile: string | File,
  trimThreshold = 236, // brightness threshold to consider "white border"
  maxTrimPercent = 0.18 // trim at most 18% of dimension from any edge
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleProcess = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) {
        resolve(typeof dataUriOrFile === 'string' ? dataUriOrFile : '');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof dataUriOrFile === 'string' ? dataUriOrFile : '');
        return;
      }

      ctx.drawImage(img, 0, 0);
      let imgData: ImageData;
      try {
        imgData = ctx.getImageData(0, 0, w, h);
      } catch (e) {
        resolve(typeof dataUriOrFile === 'string' ? dataUriOrFile : '');
        return;
      }
      const data = imgData.data;

      // Check if a pixel is considered border (white, near-white or transparent)
      const isBorderPixel = (x: number, y: number) => {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        // Transparent
        if (a < 30) return true;
        // Pure or near-white
        if (r >= trimThreshold && g >= trimThreshold && b >= trimThreshold) return true;
        // White-gray border lines
        if (r >= 225 && g >= 225 && b >= 225 && Math.abs(r - g) < 6 && Math.abs(g - b) < 6) return true;
        return false;
      };

      const maxTrimX = Math.floor(w * maxTrimPercent);
      const maxTrimY = Math.floor(h * maxTrimPercent);

      // 1. Scan Left
      let cropLeft = 0;
      for (let x = 0; x < maxTrimX; x++) {
        let borderCount = 0;
        const step = Math.max(1, Math.floor(h / 30));
        let totalTested = 0;
        for (let y = 0; y < h; y += step) {
          totalTested++;
          if (isBorderPixel(x, y)) borderCount++;
        }
        if (borderCount / totalTested >= 0.82) {
          cropLeft = x + 1;
        } else {
          break;
        }
      }

      // 2. Scan Right
      let cropRight = w;
      for (let x = w - 1; x >= w - maxTrimX; x--) {
        let borderCount = 0;
        const step = Math.max(1, Math.floor(h / 30));
        let totalTested = 0;
        for (let y = 0; y < h; y += step) {
          totalTested++;
          if (isBorderPixel(x, y)) borderCount++;
        }
        if (borderCount / totalTested >= 0.82) {
          cropRight = x;
        } else {
          break;
        }
      }

      // 3. Scan Top
      let cropTop = 0;
      for (let y = 0; y < maxTrimY; y++) {
        let borderCount = 0;
        const step = Math.max(1, Math.floor(w / 30));
        let totalTested = 0;
        for (let x = 0; x < w; x += step) {
          totalTested++;
          if (isBorderPixel(x, y)) borderCount++;
        }
        if (borderCount / totalTested >= 0.82) {
          cropTop = y + 1;
        } else {
          break;
        }
      }

      // 4. Scan Bottom
      let cropBottom = h;
      for (let y = h - 1; y >= h - maxTrimY; y--) {
        let borderCount = 0;
        const step = Math.max(1, Math.floor(w / 30));
        let totalTested = 0;
        for (let x = 0; x < w; x += step) {
          totalTested++;
          if (isBorderPixel(x, y)) borderCount++;
        }
        if (borderCount / totalTested >= 0.82) {
          cropBottom = y;
        } else {
          break;
        }
      }

      // Add a 1px safety margin inside if trimmed
      if (cropLeft > 0) cropLeft += 1;
      if (cropRight < w) cropRight -= 1;
      if (cropTop > 0) cropTop += 1;
      if (cropBottom < h) cropBottom -= 1;

      const trimmedWidth = Math.max(20, cropRight - cropLeft);
      const trimmedHeight = Math.max(20, cropBottom - cropTop);

      // Create trimmed canvas
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = trimmedWidth;
      trimmedCanvas.height = trimmedHeight;
      const tCtx = trimmedCanvas.getContext('2d');
      if (!tCtx) {
        resolve(canvas.toDataURL('image/jpeg', 0.85));
        return;
      }

      tCtx.drawImage(img, cropLeft, cropTop, trimmedWidth, trimmedHeight, 0, 0, trimmedWidth, trimmedHeight);
      resolve(trimmedCanvas.toDataURL('image/jpeg', 0.88));
    };

    img.onerror = () => {
      resolve(typeof dataUriOrFile === 'string' ? dataUriOrFile : '');
    };

    if (typeof dataUriOrFile === 'string') {
      img.onload = handleProcess;
      img.src = dataUriOrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = handleProcess;
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(dataUriOrFile);
    }
  });
}

/**
 * Compresses raw high-res user photos (2MB-10MB) down to crisp 256x256 avatar tokens (~20KB)
 * and automatically cuts any white/transparent borders.
 */
export async function compressAvatarImage(
  fileOrBase64: File | string,
  maxWidth = 360,
  maxHeight = 360,
  quality = 0.85,
  autoTrim = true
): Promise<string> {
  // First auto-trim white borders
  const trimmed = autoTrim ? await trimWhiteBorders(fileOrBase64) : (typeof fileOrBase64 === 'string' ? fileOrBase64 : '');

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(trimmed || (typeof fileOrBase64 === 'string' ? fileOrBase64 : ''));
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        resolve(trimmed || (typeof fileOrBase64 === 'string' ? fileOrBase64 : ''));
      }
    };

    img.onerror = () => {
      resolve(trimmed || (typeof fileOrBase64 === 'string' ? fileOrBase64 : ''));
    };

    if (trimmed) {
      img.onload = handleLoad;
      img.src = trimmed;
    } else if (typeof fileOrBase64 === 'string') {
      img.onload = handleLoad;
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = handleLoad;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    }
  });
}

/**
 * Simple fast string hash for photo deduplication fingerprinting
 */
export function getPhotoFingerprint(dataUri: string): string {
  if (!dataUri) return '';
  let hash = 0;
  const len = dataUri.length;
  const step = Math.max(1, Math.floor(len / 120));
  for (let i = 0; i < len; i += step) {
    const char = dataUri.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash)}_${len}`;
}

/**
 * Deduplicate an array of image data URIs using photo fingerprints
 */
export function deduplicateImages(images: string[]): { unique: string[]; duplicatesCount: number } {
  const seenHashes = new Set<string>();
  const unique: string[] = [];
  let duplicatesCount = 0;

  for (const img of images) {
    if (!img) continue;
    const fp = getPhotoFingerprint(img);
    if (seenHashes.has(fp)) {
      duplicatesCount++;
    } else {
      seenHashes.add(fp);
      unique.push(img);
    }
  }

  return { unique, duplicatesCount };
}
