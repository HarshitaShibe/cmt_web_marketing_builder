/**
 * Export a DesignDocument SVG as a full-resolution PNG.
 *
 * The renderer uses both SVG <image> elements and HTML <img> elements
 * inside <foreignObject>. Before rasterization, all image sources are
 * converted to data URLs so the canvas does not become tainted.
 */

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not convert image to data URL."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Could not read image data."));
    };

    reader.readAsDataURL(blob);
  });
}

async function inlineImageElement(
  element: Element,
  source: string
): Promise<void> {
  if (!source || source.startsWith("data:")) {
    return;
  }

  try {
    const response = await fetch(source, {
      mode: "cors",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`Image request failed: ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    if (element instanceof HTMLImageElement) {
      element.src = dataUrl;
      element.removeAttribute("srcset");
    } else {
      element.setAttribute("href", dataUrl);

      element.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        dataUrl
      );
    }
  } catch (error) {
    console.warn("Could not inline image for PNG export:", source, error);
  }
}

async function inlineImages(svg: SVGSVGElement): Promise<void> {
  /*
   * SVG <image> elements.
   */
  const svgImages = Array.from(svg.querySelectorAll("image"));

  await Promise.all(
    svgImages.map(async (image) => {
      const source =
        image.getAttribute("href") ||
        image.getAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href"
        );

      if (source) {
        await inlineImageElement(image, source);
      }
    })
  );

  /*
   * HTML <img> elements inside <foreignObject>.
   */
  const htmlImages = Array.from(svg.querySelectorAll("img"));

  await Promise.all(
    htmlImages.map(async (image) => {
      const source = image.getAttribute("src");

      if (source) {
        await inlineImageElement(image, source);
      }
    })
  );
}

export async function exportDocumentAsPng(
  svg: SVGSVGElement,
  width: number,
  height: number,
  filename: string
): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement;

  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  /*
   * Make all images self-contained before creating the SVG blob.
   */
  await inlineImages(clone);

  const source = new XMLSerializer().serializeToString(clone);

  const withHeader = source.startsWith("<?xml")
    ? source
    : `<?xml version="1.0" encoding="UTF-8"?>${source}`;

  const svgBlob = new Blob([withHeader], {
    type: "image/svg+xml;charset=utf-8",
  });

  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();

      img.onerror = () => {
        reject(new Error("Could not load the design for export."));
      };

      img.src = svgUrl;
    });

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas is not supported in this browser.");
    }

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("Could not create the PNG.");
    }

    const pngUrl = URL.createObjectURL(blob);

    try {
      const link = document.createElement("a");

      link.href = pngUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(pngUrl);
    }
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}