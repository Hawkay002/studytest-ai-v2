// PDF export helpers. Renders a hidden, print-styled DOM node via html2canvas,
// then packs the resulting image into a single-page jsPDF document.

import { jsPDF } from "jspdf"

interface PdfOptions {
  filename: string
}

/**
 * Render the given DOM node to a PNG image embedded in a PDF, fit to A4 width.
 * The node should be styled for print (off-screen, fixed width, white bg).
 */
export async function exportNodeToPdf(
  node: HTMLElement,
  { filename }: PdfOptions,
): Promise<void> {
  // Dynamically import html2canvas so it isn't in the main chunk.
  const { default: html2canvas } = await import("html2canvas")

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  })

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // If the content is taller than one page, split across pages.
  let heightLeft = imgHeight
  let position = 0
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight
  while (heightLeft > 0) {
    position -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

/** Type label for printable output. */
export function typeLabel(type: string): string {
  switch (type) {
    case "mcq":
      return "Multiple Choice"
    case "true_false":
      return "True / False"
    case "fill_blank":
      return "Fill in Blank"
    case "short_answer":
      return "Short Answer"
    default:
      return type
  }
}
