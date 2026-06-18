import type {
  BackgroundPalette,
  BorderPalette,
  FontPalette,
  Hex,
  Oklch,
  Palette,
  SourceBackgroundPalette,
  SourceBorderPalette,
  SourceColor,
  SourceFontPalette,
} from "./theme.js";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const stripHash = (value: Hex) => value.slice(1);

export const toByte = (value: number) =>
  Math.round(clamp01(value) * 255)
    .toString(16)
    .padStart(2, "0");

export const withAlpha = (value: Hex, opacity: number): Hex =>
  `#${stripHash(value).slice(0, 6)}${toByte(opacity)}`;

export const keys = (ids: readonly string[], value: Hex): Record<string, Hex> =>
  Object.fromEntries(ids.map((id) => [id, value]));

const parseOklch = (value: Oklch): { l: number; c: number; h: number } => {
  const match =
    /^oklch\((\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)$/.exec(
      value,
    );
  if (!match) throw new Error(`Invalid OKLCH color: ${value}`);

  return {
    l: Number(match[1]) / 100,
    c: Number(match[2]),
    h: Number(match[3]),
  };
};

const linearToSrgb = (value: number) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;

const oklchToHex = (value: Oklch): Hex => {
  const { l, c, h } = parseOklch(value);
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lCone = lPrime ** 3;
  const mCone = mPrime ** 3;
  const sCone = sPrime ** 3;

  const red = linearToSrgb(
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
  );
  const green = linearToSrgb(
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
  );
  const blue = linearToSrgb(
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  );

  return `#${toByte(red)}${toByte(green)}${toByte(blue)}`;
};

const isHexColor = (value: SourceColor): value is Hex =>
  /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value);

export const sourceColorToHex = (value: SourceColor): Hex => {
  if (isHexColor(value)) return value.toLowerCase() as Hex;
  if (value.startsWith("#")) throw new Error(`Invalid hex color: ${value}`);

  return oklchToHex(value);
};

export const createColorMap = <T extends Record<string, SourceColor>>(
  colors: T,
): Record<keyof T, Hex> =>
  Object.fromEntries(
    Object.entries(colors).map(([id, value]) => [id, sourceColorToHex(value)]),
  ) as Record<keyof T, Hex>;

export const createPalette = (
  backgroundColors: SourceBackgroundPalette,
  fontColors: SourceFontPalette,
  borderColors: SourceBorderPalette,
): Palette => {
  const background = createColorMap(backgroundColors) as Omit<
    BackgroundPalette,
    "shadow" | "minimap" | "transparent"
  >;
  const font = createColorMap(fontColors) as FontPalette;
  const border = createColorMap(borderColors) as BorderPalette;
  const transparent = withAlpha(background.black, 0);

  return {
    background: {
      ...background,
      shadow: withAlpha(background.black, 0.22),
      minimap: withAlpha(background.black, 0.22),
      transparent,
    },
    font,
    border,
  };
};

export const assertHex = (value: string, path: string) => {
  if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) {
    throw new Error(`${path} must be a 6- or 8-digit hex color, got ${value}`);
  }
};

export const hexToRgb = (
  value: Hex,
): { red: number; green: number; blue: number } => {
  const rgb = stripHash(value).slice(0, 6);

  return {
    red: Number.parseInt(rgb.slice(0, 2), 16) / 255,
    green: Number.parseInt(rgb.slice(2, 4), 16) / 255,
    blue: Number.parseInt(rgb.slice(4, 6), 16) / 255,
  };
};

export const srgbToRelativeLuminance = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

export const relativeLuminance = (value: Hex) => {
  const { red, green, blue } = hexToRgb(value);

  return (
    0.2126 * srgbToRelativeLuminance(red) +
    0.7152 * srgbToRelativeLuminance(green) +
    0.0722 * srgbToRelativeLuminance(blue)
  );
};

const alphaOpacity = (value: Hex) => {
  const alpha = stripHash(value).slice(6, 8);

  return alpha ? Number.parseInt(alpha, 16) / 255 : 1;
};

export const compositeOver = (foreground: Hex, background: Hex): Hex => {
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);
  const opacity = alphaOpacity(foreground);

  return `#${toByte(
    foregroundRgb.red * opacity + backgroundRgb.red * (1 - opacity),
  )}${toByte(
    foregroundRgb.green * opacity + backgroundRgb.green * (1 - opacity),
  )}${toByte(
    foregroundRgb.blue * opacity + backgroundRgb.blue * (1 - opacity),
  )}`;
};

export const contrastRatio = (foreground: Hex, background: Hex) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);

  return (light + 0.05) / (dark + 0.05);
};

const hexToOklab = (value: Hex): { l: number; a: number; b: number } => {
  const { red, green, blue } = hexToRgb(value);
  const linearRed = srgbToRelativeLuminance(red);
  const linearGreen = srgbToRelativeLuminance(green);
  const linearBlue = srgbToRelativeLuminance(blue);

  const long = Math.cbrt(
    0.4122214708 * linearRed +
      0.5363325363 * linearGreen +
      0.0514459929 * linearBlue,
  );
  const medium = Math.cbrt(
    0.2119034982 * linearRed +
      0.6806995451 * linearGreen +
      0.1073969566 * linearBlue,
  );
  const short = Math.cbrt(
    0.0883024619 * linearRed +
      0.2817188376 * linearGreen +
      0.6299787005 * linearBlue,
  );

  return {
    l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  };
};

export const oklabDistance = (left: Hex, right: Hex) => {
  const a = hexToOklab(left);
  const b = hexToOklab(right);

  return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
};

const isSingleWordPaletteProperty = (value: string) => /^[a-z]+$/.test(value);

export const assertSingleWordPaletteProperties = (
  name: string,
  palette: Record<string, unknown>,
) => {
  const invalid = Object.keys(palette).filter(
    (id) => !isSingleWordPaletteProperty(id),
  );
  if (invalid.length) {
    throw new Error(
      `${name} palette properties must be single lowercase words: ${invalid.join(", ")}`,
    );
  }
};
