/**
 * Fits a width×height box inside a max box, preserving aspect ratio, in
 * exact pixels. Doing this arithmetic here — instead of asking CSS to solve
 * `aspect-ratio` and `max-height` on the same element at once — is what
 * fixes the preview flicker: there's only ever one deterministic size, no
 * browser layout correction pass.
 */
export function fitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}