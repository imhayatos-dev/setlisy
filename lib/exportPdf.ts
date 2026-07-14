type PdfExportOptions = {
  marginMm?: number;
  quality?: number;
};

export async function exportElementToLandscapePdf(
  sourceElement: HTMLElement,
  fileName: string,
  options: PdfExportOptions = {},
) {
  const { marginMm = 5, quality = 0.95 } = options;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const host = document.createElement("div");
  host.className = "pdfCaptureHost";

  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.classList.add("pdfCapture");

  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await waitForImages(clone);
    await nextPaint();

    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const availableWidth = pageWidth - marginMm * 2;
    const availableHeight = pageHeight - marginMm * 2;

    const scale = Math.min(
      availableWidth / canvas.width,
      availableHeight / canvas.height,
    );

    const imageWidth = canvas.width * scale;
    const imageHeight = canvas.height * scale;
    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;

    pdf.addImage(
      canvas.toDataURL("image/jpeg", quality),
      "JPEG",
      x,
      y,
      imageWidth,
      imageHeight,
      undefined,
      "FAST",
    );

    pdf.save(fileName);
  } finally {
    host.remove();
  }
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      if (image.complete) return;

      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

async function nextPaint() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
