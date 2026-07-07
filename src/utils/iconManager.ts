// Icon Generator: size catalogs, canvas rendering, and multi-platform ZIP export.

export interface IOSIconSpec {
  idiom: 'iphone' | 'ipad' | 'ios-marketing';
  pointSize: number;
  scale: 1 | 2 | 3;
}

export interface AndroidDensitySpec {
  name: string;
  px: number;
}

// Apple's canonical universal icon set (Settings, Spotlight, Notification, App, Marketing).
export const IOS_ICON_SPECS: IOSIconSpec[] = [
  { idiom: 'iphone', pointSize: 20, scale: 2 },
  { idiom: 'iphone', pointSize: 20, scale: 3 },
  { idiom: 'iphone', pointSize: 29, scale: 2 },
  { idiom: 'iphone', pointSize: 29, scale: 3 },
  { idiom: 'iphone', pointSize: 40, scale: 2 },
  { idiom: 'iphone', pointSize: 40, scale: 3 },
  { idiom: 'iphone', pointSize: 60, scale: 2 },
  { idiom: 'iphone', pointSize: 60, scale: 3 },
  { idiom: 'ipad', pointSize: 20, scale: 1 },
  { idiom: 'ipad', pointSize: 20, scale: 2 },
  { idiom: 'ipad', pointSize: 29, scale: 1 },
  { idiom: 'ipad', pointSize: 29, scale: 2 },
  { idiom: 'ipad', pointSize: 40, scale: 1 },
  { idiom: 'ipad', pointSize: 40, scale: 2 },
  { idiom: 'ipad', pointSize: 76, scale: 1 },
  { idiom: 'ipad', pointSize: 76, scale: 2 },
  { idiom: 'ipad', pointSize: 83.5, scale: 2 },
  { idiom: 'ios-marketing', pointSize: 1024, scale: 1 },
];

export const ANDROID_LEGACY_DENSITIES: AndroidDensitySpec[] = [
  { name: 'mdpi', px: 48 },
  { name: 'hdpi', px: 72 },
  { name: 'xhdpi', px: 96 },
  { name: 'xxhdpi', px: 144 },
  { name: 'xxxhdpi', px: 192 },
];

export const ANDROID_ADAPTIVE_SIZE = 432;
export const ANDROID_PLAYSTORE_SIZE = 512;

// Master preview/working resolution used for on-screen rendering.
export const ICON_MASTER_SIZE = 512;

export interface IconRenderConfig {
  image: HTMLImageElement | HTMLCanvasElement;
  size: number;
  padding: number; // 0 - 0.4, fraction of size inset on each side
  bgColor: string;
  transparentBg?: boolean; // when true, skip background fill (adaptive foreground layer)
}

/** Draws the icon artwork centered within a padded, filled square canvas. */
export const renderIconFrame = (ctx: CanvasRenderingContext2D, config: IconRenderConfig) => {
  const { image, size, padding, bgColor, transparentBg } = config;
  ctx.clearRect(0, 0, size, size);

  if (!transparentBg) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  const inset = size * Math.min(Math.max(padding, 0), 0.4);
  const drawSize = size - inset * 2;
  ctx.drawImage(image, inset, inset, drawSize, drawSize);
};

// Upper bound for the persisted/master source resolution. All export sizes
// (max 1024px for the iOS App Store icon) fit comfortably within this, so
// capping here avoids writing multi-megabyte base64 strings to localStorage.
export const MAX_SOURCE_SIDE = 1024;

/** Center-crops any image element to a square HTMLCanvasElement, capped at MAX_SOURCE_SIDE. */
export const cropImageToSquare = (img: HTMLImageElement): HTMLCanvasElement => {
  const cropSide = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - cropSide) / 2;
  const sy = (img.naturalHeight - cropSide) / 2;
  const outputSide = Math.min(cropSide, MAX_SOURCE_SIDE);
  const canvas = document.createElement('canvas');
  canvas.width = outputSide;
  canvas.height = outputSide;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, outputSide, outputSide);
  return canvas;
};

/** Detects whether the image has any non-opaque pixels. */
export const detectAlphaChannel = (source: HTMLCanvasElement): boolean => {
  const ctx = source.getContext('2d')!;
  const { data } = ctx.getImageData(0, 0, source.width, source.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
};

/** Samples the artwork's edge pixels to suggest a sensible background fill color. */
export const detectEdgeColor = (source: HTMLCanvasElement): string => {
  const { width, height } = source;
  const ctx = source.getContext('2d')!;
  const { data } = ctx.getImageData(0, 0, width, height);

  let rEdge = 0, gEdge = 0, bEdge = 0, edgeCount = 0;
  let rAll = 0, gAll = 0, bAll = 0, allCount = 0;

  const visit = (x: number, y: number, isEdge: boolean) => {
    const idx = (y * width + x) * 4;
    if (data[idx + 3] <= 10) return; // skip fully transparent pixels
    rAll += data[idx]; gAll += data[idx + 1]; bAll += data[idx + 2]; allCount++;
    if (isEdge) {
      rEdge += data[idx]; gEdge += data[idx + 1]; bEdge += data[idx + 2]; edgeCount++;
    }
  };

  for (let x = 0; x < width; x++) {
    visit(x, 0, true);
    visit(x, height - 1, true);
  }
  for (let y = 1; y < height - 1; y++) {
    visit(0, y, true);
    visit(width - 1, y, true);
  }

  if (edgeCount > 0) {
    return rgbToHex(rEdge / edgeCount, gEdge / edgeCount, bEdge / edgeCount);
  }
  if (allCount > 0) {
    return rgbToHex(rAll / allCount, gAll / allCount, bAll / allCount);
  }
  return '#e5e5e4'; // Neutral fallback matching the app's monochrome palette.
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export interface IconExportConfig {
  sourceCanvas: HTMLCanvasElement; // square-cropped master artwork
  padding: number;
  bgColor: string;
  hasAlpha: boolean;
  foregroundScale: number; // 0.5 - 1.0, adaptive icon foreground content scale
  platforms: { ios: boolean; android: boolean };
}

const renderToBlob = (size: number, config: IconRenderConfig): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  renderIconFrame(ctx, { ...config, size });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
};

/** Builds the full iOS/Android icon set into the given JSZip instance. */
export const buildIconZip = async (
  zip: import('jszip'),
  config: IconExportConfig,
  onProgress?: (msg: string) => void
) => {
  const { sourceCanvas, padding, bgColor, hasAlpha, foregroundScale, platforms } = config;

  if (platforms.ios) {
    const contentsEntries: Array<{ size: string; idiom: string; filename: string; scale: string }> = [];
    const iosFolder = zip.folder('ios/AppIcon.appiconset')!;

    for (const spec of IOS_ICON_SPECS) {
      const px = Math.round(spec.pointSize * spec.scale);
      const filename = `icon-${spec.idiom}-${spec.pointSize}@${spec.scale}x.png`;
      onProgress?.(`正在渲染 iOS ${spec.idiom} ${spec.pointSize}pt@${spec.scale}x (${px}px)...`);
      const blob = await renderToBlob(px, { image: sourceCanvas, size: px, padding, bgColor });
      iosFolder.file(filename, blob);
      contentsEntries.push({
        size: `${spec.pointSize}x${spec.pointSize}`,
        idiom: spec.idiom,
        filename,
        scale: `${spec.scale}x`,
      });
    }

    const contentsJson = {
      images: contentsEntries,
      info: { version: 1, author: 'MockupApp' },
    };
    iosFolder.file('Contents.json', JSON.stringify(contentsJson, null, 2));
  }

  if (platforms.android) {
    const androidFolder = zip.folder('android')!;

    for (const density of ANDROID_LEGACY_DENSITIES) {
      onProgress?.(`正在渲染 Android mipmap-${density.name} (${density.px}px)...`);
      const blob = await renderToBlob(density.px, { image: sourceCanvas, size: density.px, padding, bgColor });
      androidFolder.file(`mipmap-${density.name}/ic_launcher.png`, blob);
    }

    onProgress?.('正在渲染 Android Adaptive Icon 前景层...');
    // foregroundScale (0.5-1.0) shrinks the content further within the safe zone;
    // a lower scale means more inset padding around the artwork.
    const adaptivePadding = padding + (1 - foregroundScale) * 0.5;
    const fgBlob = hasAlpha
      ? await renderToBlob(ANDROID_ADAPTIVE_SIZE, {
          image: sourceCanvas,
          size: ANDROID_ADAPTIVE_SIZE,
          padding: adaptivePadding,
          bgColor,
          transparentBg: true,
        })
      : await renderToBlob(ANDROID_ADAPTIVE_SIZE, { image: sourceCanvas, size: ANDROID_ADAPTIVE_SIZE, padding: adaptivePadding, bgColor });
    androidFolder.file('mipmap-anydpi-v26/ic_launcher_foreground.png', fgBlob);

    onProgress?.('正在渲染 Android Adaptive Icon 背景层...');
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = ANDROID_ADAPTIVE_SIZE;
    bgCanvas.height = ANDROID_ADAPTIVE_SIZE;
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.fillStyle = bgColor;
    bgCtx.fillRect(0, 0, ANDROID_ADAPTIVE_SIZE, ANDROID_ADAPTIVE_SIZE);
    const bgBlob: Blob = await new Promise((resolve, reject) => {
      bgCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    });
    androidFolder.file('mipmap-anydpi-v26/ic_launcher_background.png', bgBlob);

    onProgress?.('正在渲染 Google Play 商店图标...');
    const playBlob = await renderToBlob(ANDROID_PLAYSTORE_SIZE, {
      image: sourceCanvas,
      size: ANDROID_PLAYSTORE_SIZE,
      padding,
      bgColor,
    });
    androidFolder.file('play_store_512.png', playBlob);
  }
};
