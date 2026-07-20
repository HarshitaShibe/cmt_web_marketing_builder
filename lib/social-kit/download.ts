/** Serialises an in-page <svg> element and triggers a browser download. */
export function downloadSvgElement(svg: SVGSVGElement, filename: string) {
  const source = new XMLSerializer().serializeToString(svg);
  const withHeader = source.startsWith("<?xml")
    ? source
    : `<?xml version="1.0" standalone="no"?>\r\n${source}`;

  const blob = new Blob([withHeader], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}