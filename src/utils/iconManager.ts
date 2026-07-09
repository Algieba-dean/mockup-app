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

/** Deterministic filename for a given iOS icon spec, e.g. `icon-iphone-60@3x.png`. */
export const iosIconFilename = (spec: IOSIconSpec): string =>
  `icon-${spec.idiom}-${spec.pointSize}@${spec.scale}x.png`;

export interface IOSRenderedIcon {
  spec: IOSIconSpec;
  filename: string;
}

export interface IOSContentsImageEntry {
  size: string;
  idiom: string;
  filename: string;
  scale: string;
}

export interface IOSContentsJson {
  images: IOSContentsImageEntry[];
  info: { version: 1; author: string };
}

/**
 * Builds the `Contents.json` manifest Xcode requires inside an
 * `AppIcon.appiconset/` folder, mapping each rendered icon to its
 * idiom/size/scale/filename. Kept as a pure, exported function (decoupled
 * from the render loop) so the idiom/size/scale <-> filename mapping — the
 * part every Xcode asset catalog validates — is independently testable,
 * mirroring the template.json + generator split used by dwmkerr/app-icon.
 */
export const buildIOSContentsJson = (
  renderedIcons: IOSRenderedIcon[],
  author: string = 'MockupApp'
): IOSContentsJson => ({
  images: renderedIcons
    .map(({ spec, filename }) => ({
      size: `${spec.pointSize}x${spec.pointSize}`,
      idiom: spec.idiom,
      filename,
      scale: `${spec.scale}x`,
    }))
    // Deterministic, reviewable ordering (matches the convention used by
    // dwmkerr/app-icon's iconset generator).
    .sort((a, b) => a.filename.localeCompare(b.filename)),
  info: { version: 1, author },
});

export const ANDROID_LEGACY_DENSITIES: AndroidDensitySpec[] = [
  { name: 'mdpi', px: 48 },
  { name: 'hdpi', px: 72 },
  { name: 'xhdpi', px: 96 },
  { name: 'xxhdpi', px: 144 },
  { name: 'xxxhdpi', px: 192 },
];

export const ANDROID_ADAPTIVE_SIZE = 432;
export const ANDROID_PLAYSTORE_SIZE = 512;

/**
 * Representative sizes shown in the "导出尺寸预览" sidebar grid, each tagged
 * with which platform's padding/offset/scale transform it should be
 * rendered with (iOS sizes use the iOS-specific transform, Android legacy
 * density sizes use the Android-specific transform), so the grid actually
 * reflects each platform's tuning instead of reusing a single master image.
 */
export interface IconSizePreviewSpec {
  size: number;
  platform: 'ios' | 'android';
}

export const ICON_SIZE_PREVIEW_SPECS: IconSizePreviewSpec[] = [
  { size: 1024, platform: 'ios' },
  { size: 180, platform: 'ios' },
  { size: 120, platform: 'ios' },
  { size: 76, platform: 'ios' },
  { size: 192, platform: 'android' },
  { size: 144, platform: 'android' },
  { size: 96, platform: 'android' },
  { size: 48, platform: 'android' },
];

// Master preview/working resolution used for on-screen rendering.
export const ICON_MASTER_SIZE = 512;

export type IconBgMode = 'solid' | 'gradient';

// Fixed gradient angle (135deg, top-left to bottom-right), matching the
// industry-default diagonal used by comparable icon generator tools.
const GRADIENT_ANGLE_DEG = 135;

export interface IconRenderConfig {
  image: HTMLImageElement | HTMLCanvasElement;
  size: number;
  padding: number; // 0 - 0.4, horizontal (left/right) inset fraction of size
  paddingY?: number; // 0 - 0.4, vertical (top/bottom) inset fraction; defaults to `padding` when omitted (symmetric, matches legacy behavior)
  bgColor: string;
  transparentBg?: boolean; // when true, skip background fill (adaptive foreground layer)
  bgMode?: IconBgMode; // defaults to 'solid'
  bgGradient?: [string, string]; // used when bgMode === 'gradient'
  offsetX?: number; // -1..1, fraction of size, content pan (defaults 0)
  offsetY?: number; // -1..1, fraction of size, content pan (defaults 0)
  contentScale?: number; // 0.5 - 2.0, independent content zoom (defaults 1)
}

/** Fills a size×size canvas region with a solid color or a fixed 135° linear gradient. */
export const fillIconBackground = (
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  bgMode: IconBgMode = 'solid',
  bgGradient?: [string, string]
) => {
  if (bgMode === 'gradient' && bgGradient) {
    // 135deg: top-left -> bottom-right diagonal.
    const rad = (GRADIENT_ANGLE_DEG - 90) * (Math.PI / 180);
    const x = Math.cos(rad) * size / 2;
    const y = Math.sin(rad) * size / 2;
    const cx = size / 2;
    const cy = size / 2;
    const gradient = ctx.createLinearGradient(cx - x, cy - y, cx + x, cy + y);
    gradient.addColorStop(0, bgGradient[0]);
    gradient.addColorStop(1, bgGradient[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = bgColor;
  }
  ctx.fillRect(0, 0, size, size);
};

/** Draws the icon artwork centered within a padded, filled square canvas. */
export const renderIconFrame = (ctx: CanvasRenderingContext2D, config: IconRenderConfig) => {
  const {
    image, size, padding, paddingY, bgColor, transparentBg,
    bgMode = 'solid', bgGradient, offsetX = 0, offsetY = 0, contentScale = 1,
  } = config;
  ctx.clearRect(0, 0, size, size);

  if (!transparentBg) {
    fillIconBackground(ctx, size, bgColor, bgMode, bgGradient);
  }

  // Independent horizontal/vertical insets (paddingY falls back to `padding`
  // for symmetric, backward-compatible behavior). The artwork is always
  // uniformly scaled to fit the smaller padded-box dimension (CSS
  // `object-fit: contain` semantics) so asymmetric padding shifts/shrinks
  // the safe area without ever stretching the square artwork.
  const insetX = size * Math.min(Math.max(padding, 0), 0.4);
  const insetY = size * Math.min(Math.max(paddingY ?? padding, 0), 0.4);
  const boxWidth = size - insetX * 2;
  const boxHeight = size - insetY * 2;
  const baseDrawSize = Math.min(boxWidth, boxHeight);
  const clampedScale = Math.min(Math.max(contentScale, 0.5), 2.0);
  const drawSize = baseDrawSize * clampedScale;
  const dx = insetX + (boxWidth - drawSize) / 2 + offsetX * size;
  const dy = insetY + (boxHeight - drawSize) / 2 + offsetY * size;
  ctx.drawImage(image, dx, dy, drawSize, drawSize);
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
  paddingY?: number; // independent vertical inset; defaults to `padding` when omitted
  bgColor: string;
  hasAlpha: boolean;
  foregroundScale: number; // 0.5 - 1.0, adaptive icon foreground content scale
  platforms: { ios: boolean; android: boolean };
  offsetX?: number;
  offsetY?: number;
  contentScale?: number;
  bgMode?: IconBgMode;
  bgGradient?: [string, string];
  includeSvgContainer?: boolean;

  // Dual-platform overrides
  paddingIos?: number;
  paddingYIos?: number;
  offsetXIos?: number;
  offsetYIos?: number;
  contentScaleIos?: number;
  paddingAndroid?: number;
  paddingYAndroid?: number;
  offsetXAndroid?: number;
  offsetYAndroid?: number;
  contentScaleAndroid?: number;
}

/** Master size for the standalone SVG container deliverable. */
export const SVG_CONTAINER_SIZE = 1024;

/**
 * Wraps a rendered raster composition in a minimal SVG document (an <image>
 * element embedding the PNG as base64). Not a true vector — a scalable
 * container intended for design handoff, per icon-export's SVG requirement.
 */
export const buildSvgContainer = (pngDataUrl: string, size: number = SVG_CONTAINER_SIZE): string => (
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n` +
  `  <image width="${size}" height="${size}" href="${pngDataUrl}"/>\n` +
  `</svg>\n`
);

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

const renderToDataUrl = (size: number, config: IconRenderConfig): string => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  renderIconFrame(ctx, { ...config, size });
  return canvas.toDataURL('image/png');
};

/** Builds the full iOS/Android icon set into the given JSZip instance. */
export const buildIconZip = async (
  zip: import('jszip'),
  config: IconExportConfig,
  onProgress?: (msg: string) => void
) => {
  const {
    sourceCanvas, padding, paddingY, bgColor, hasAlpha, foregroundScale, platforms,
    offsetX = 0, offsetY = 0, contentScale = 1, bgMode = 'solid', bgGradient,
    includeSvgContainer,

    // Dual-platform overrides
    paddingIos,
    paddingYIos,
    offsetXIos,
    offsetYIos,
    contentScaleIos,
    paddingAndroid,
    paddingYAndroid,
    offsetXAndroid,
    offsetYAndroid,
    contentScaleAndroid,
  } = config;

  // Compute platform-specific transform objects
  const iosTransform = {
    padding: paddingIos ?? padding,
    paddingY: paddingYIos ?? paddingY ?? padding,
    offsetX: offsetXIos ?? offsetX,
    offsetY: offsetYIos ?? offsetY,
    contentScale: contentScaleIos ?? contentScale,
    bgMode,
    bgGradient,
  };

  const androidTransform = {
    padding: paddingAndroid ?? padding,
    paddingY: paddingYAndroid ?? paddingY ?? padding,
    offsetX: offsetXAndroid ?? offsetX,
    offsetY: offsetYAndroid ?? offsetY,
    contentScale: contentScaleAndroid ?? contentScale,
    bgMode,
    bgGradient,
  };

  if (platforms.ios) {
    const iosFolder = zip.folder('ios/AppIcon.appiconset')!;
    const renderedIcons: IOSRenderedIcon[] = [];

    for (const spec of IOS_ICON_SPECS) {
      const px = Math.round(spec.pointSize * spec.scale);
      const filename = iosIconFilename(spec);
      onProgress?.(`正在渲染 iOS ${spec.idiom} ${spec.pointSize}pt@${spec.scale}x (${px}px)...`);
      const blob = await renderToBlob(px, {
        image: sourceCanvas,
        size: px,
        bgColor,
        ...iosTransform,
      });
      iosFolder.file(filename, blob);
      renderedIcons.push({ spec, filename });
    }

    iosFolder.file('Contents.json', JSON.stringify(buildIOSContentsJson(renderedIcons), null, 2));
  }

  if (platforms.android) {
    const androidFolder = zip.folder('android')!;

    for (const density of ANDROID_LEGACY_DENSITIES) {
      onProgress?.(`正在渲染 Android mipmap-${density.name} (${density.px}px)...`);
      const blob = await renderToBlob(density.px, {
        image: sourceCanvas,
        size: density.px,
        bgColor,
        ...androidTransform,
      });
      androidFolder.file(`mipmap-${density.name}/ic_launcher.png`, blob);
    }

    onProgress?.('正在渲染 Android Adaptive Icon 前景层...');
    // foregroundScale (0.5-1.0) shrinks the content further within the safe zone;
    // a lower scale means more inset padding around the artwork. Applied
    // isotropically to both axes since the adaptive icon safe zone is a
    // concentric circle, regardless of any asymmetric base padding.
    const adaptiveExtraInset = (1 - foregroundScale) * 0.5;
    const adaptivePadding = androidTransform.padding + adaptiveExtraInset;
    const adaptivePaddingY = androidTransform.paddingY + adaptiveExtraInset;
    const fgBlob = hasAlpha
      ? await renderToBlob(ANDROID_ADAPTIVE_SIZE, {
          image: sourceCanvas,
          size: ANDROID_ADAPTIVE_SIZE,
          bgColor,
          transparentBg: true,
          ...androidTransform,
          padding: adaptivePadding,
          paddingY: adaptivePaddingY,
        })
      : await renderToBlob(ANDROID_ADAPTIVE_SIZE, {
          image: sourceCanvas,
          size: ANDROID_ADAPTIVE_SIZE,
          bgColor,
          ...androidTransform,
          padding: adaptivePadding,
          paddingY: adaptivePaddingY,
        });
    androidFolder.file('mipmap-anydpi-v26/ic_launcher_foreground.png', fgBlob);

    onProgress?.('正在渲染 Android Adaptive Icon 背景层...');
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = ANDROID_ADAPTIVE_SIZE;
    bgCanvas.height = ANDROID_ADAPTIVE_SIZE;
    const bgCtx = bgCanvas.getContext('2d')!;
    fillIconBackground(bgCtx, ANDROID_ADAPTIVE_SIZE, bgColor, bgMode, bgGradient);
    const bgBlob: Blob = await new Promise((resolve, reject) => {
      bgCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    });
    androidFolder.file('mipmap-anydpi-v26/ic_launcher_background.png', bgBlob);

    onProgress?.('正在渲染 Google Play 商店图标...');
    const playBlob = await renderToBlob(ANDROID_PLAYSTORE_SIZE, {
      image: sourceCanvas,
      size: ANDROID_PLAYSTORE_SIZE,
      bgColor,
      ...androidTransform,
    });
    androidFolder.file('play_store_512.png', playBlob);
  }

  if (includeSvgContainer) {
    onProgress?.('正在生成 SVG 容器版...');
    // Note: for global SVG, if iOS is selected, we prioritize iOS transform, else Android
    const activeTransform = platforms.ios ? iosTransform : androidTransform;
    const dataUrl = renderToDataUrl(SVG_CONTAINER_SIZE, {
      image: sourceCanvas,
      size: SVG_CONTAINER_SIZE,
      bgColor,
      ...activeTransform,
    });
    zip.file('icon-1024.svg', buildSvgContainer(dataUrl, SVG_CONTAINER_SIZE));
  }
};
