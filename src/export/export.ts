import fs from 'fs';
import path from 'path';
import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFName,
  PDFArray,
  PDFNumber,
} from 'pdf-lib';
import { OrderResult } from '../order/order';
import { PageInfo } from '../pdf/pdf';
import { TocSection } from '../analysis/toc';
import { DuplicateInfo } from '../analysis/duplicates';
import { MissingPageInfo } from '../analysis/missing';

// ---------- helpers: link annotations on a page ----------
function addLinkAnnotationToPage(opts: {
  doc: PDFDocument;
  sourcePageIndex: number;
  rect: { x: number; y: number; w: number; h: number };
  destPageIndex: number;
}) {
  const { doc, sourcePageIndex, rect, destPageIndex } = opts;
  const srcPage = doc.getPage(sourcePageIndex);
  const destPage = doc.getPage(destPageIndex);
  const ctx = doc.context;

  const annotsKey = PDFName.of('Annots');
  let annots = srcPage.node.get(annotsKey) as PDFArray | undefined;
  if (!annots) {
    annots = ctx.obj([]);
    srcPage.node.set(annotsKey, annots);
  }

  const linkDict = ctx.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: ctx.obj([rect.x, rect.y, rect.x + rect.w, rect.y + rect.h]),
    Border: ctx.obj([0, 0, 0]),
    A: ctx.obj({
      S: PDFName.of('GoTo'),
      D: ctx.obj([destPage.ref, PDFName.of('Fit')]), // whole-page fit
    }),
  });

  annots.push(linkDict);
}

export async function exportReorderedPDF(inputPdf: Buffer, order: number[], outPath: string) {
  const srcDoc = await PDFDocument.load(inputPdf);
  const outDoc = await PDFDocument.create();
  const copied = await outDoc.copyPages(srcDoc, order);
  copied.forEach((p) => outDoc.addPage(p));
  const bytes = await outDoc.save();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(bytes));
}

// Insert a ToC page with clickable links to the target pages.
export async function exportReorderedPDFWithToc(
  inputPdf: Buffer,
  order: number[],
  outPath: string,
  tocItems?: Array<{ title: string; page: number }> // page is 1-based BEFORE ToC insertion
) {
  const srcDoc = await PDFDocument.load(inputPdf);
  const outDoc = await PDFDocument.create();

  // First, add all the reordered content pages
  const copied = await outDoc.copyPages(srcDoc, order);
  copied.forEach((p) => outDoc.addPage(p));

  // Now add the TOC page at the beginning (this will shift all content pages by 1)
  if (tocItems && tocItems.length) {
    // Insert TOC page at the beginning
    const toc = outDoc.insertPage(0, [595, 842]); // A4, insert at index 0
    const font = await outDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = toc.getSize();

    toc.drawText('Table of Contents', {
      x: 50, y: height - 60, size: 24, font, color: rgb(0, 0, 0),
    });

    let y = height - 100;
    tocItems.forEach((item, idx) => {
      toc.drawText(`${item.title} .......... ${item.page + 1}`, {
        x: 60, y: y, size: 14, font, color: rgb(0, 0, 0),
      });
      // Add clickable link annotation for each entry
      // Since TOC is now at index 0, content pages start at index 1
      // item.page is 0-based from the original order, so we add 1 to get the correct page number
      const actualDestPageIndex = item.page + 1;
      addLinkAnnotationToPage({
        doc: outDoc,
        sourcePageIndex: 0, // ToC page is always first
        rect: { x: 60, y: y, w: 400, h: 18 },
        destPageIndex: actualDestPageIndex,
      });
      y -= 22;
    });
  }

  const bytes = await outDoc.save();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(bytes));
}

export function writeJsonLog(result: OrderResult, pages: PageInfo[], outPath: string) {
  const log = {
    confidence: result.confidence,
    order: result.order,
    reasoning: result.reasoning,
    pages: pages.map((p) => ({
      pageNumber: p.pageNumber,
      width: p.width,
      height: p.height,
      rotation: p.rotation,
    })),
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(log, null, 2), 'utf-8');
}

export function writeHtmlReport(result: OrderResult, outPath: string) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>PDF Reconstructor Report</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;max-width:1000px;margin:auto}
table{border-collapse:collapse;width:100%;margin-top:16px}
td,th{border:1px solid #ddd;padding:8px}
tr:nth-child(even){background:#fafafa}
</style>
</head>
<body>
<h1>Reconstruction Report</h1>
<p>Confidence: ${result.confidence.toFixed(2)}</p>
<p>Reasoning: ${result.reasoning}</p>
<h2>Page Order</h2>
<p>${result.order.join(' → ')}</p>
</body></html>`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf-8');
}

export function writeTocJson(toc: { sections: TocSection[] }, outPath: string) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(toc, null, 2), 'utf-8');
}

export function writeDupMissingJson(dups: DuplicateInfo[], missing: MissingPageInfo[], outPath: string) {
  const payload = { duplicates: dups, missingPages: missing };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
}
