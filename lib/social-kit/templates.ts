import type {
  KitPlatform,
  ThemeTokens,
  KitHeadlineWeight,
  KitHeadlineSize,
  KitLogoSize,
  KitPadding,
} from "@/lib/schema";

export const PLATFORM_DIMENSIONS: Record<
  KitPlatform,
  {
    width: number;
    height: number;
    label: string;
  }
> = {
  instagram: {
    width: 1080,
    height: 1080,
    label: "Instagram",
  },
  linkedin: {
    width: 1200,
    height: 627,
    label: "LinkedIn",
  },
  twitter: {
    width: 1600,
    height: 900,
    label: "X (Twitter) · Post",
  },
};

export const KIT_PLATFORM_LABELS: Record<KitPlatform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
};

export const RADIUS_PX: Record<ThemeTokens["radius"], number> = {
  none: 0,
  sm: 6,
  md: 14,
  lg: 28,
  full: 999,
};

export const HEADLINE_WEIGHT_CSS: Record<KitHeadlineWeight, number> = {
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 800,
};

export const HEADLINE_SIZE_RATIO: Record<KitHeadlineSize, number> = {
  sm: 0.05,
  md: 0.066,
  lg: 0.084,
};

export const LOGO_SIZE_RATIO: Record<KitLogoSize, number> = {
  sm: 0.11,
  md: 0.15,
  lg: 0.2,
};

export const PADDING_RATIO: Record<KitPadding, number> = {
  compact: 0.055,
  normal: 0.075,
  airy: 0.1,
};