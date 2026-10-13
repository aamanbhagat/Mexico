/**
 * Dependency-free PDF writer for calculation reports (A4, Helvetica, WinAnsi).
 * Loaded on demand when someone presses "Descargar PDF", so it costs nothing on page load.
 * Runs entirely in the browser: the report never leaves the device.
 */

export interface ReportRow {
  label: string;
  detail?: string | undefined;
  value: string;
  tone?: 'normal' | 'negative' | 'total' | undefined;
}

export interface ReportSection {
  title: string;
  rows: ReportRow[];
}

export interface Report {
  siteName: string;
  title: string;
  subtitle: string;
  url: string;
  generatedOn: string;
  headline: { label: string; value: string };
  sections: ReportSection[];
  notes: string[];
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;

// Helvetica advance widths (1/1000 em) for the glyphs used in right-aligned amounts.
const WIDTHS: Record<string, number> = {
  '0': 556,
  '1': 556,
  '2': 556,
  '3': 556,
  '4': 556,
  '5': 556,
  '6': 556,
  '7': 556,
  '8': 556,
  '9': 556,
  ',': 278,
  '.': 278,
  $: 556,
  '-': 333,
  ' ': 278,
  '%': 889,
  '(': 333,
  ')': 333,
};

function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) w += WIDTHS[ch] ?? 560;
  return (w / 1000) * size;
}

const WIN_ANSI_EXTRA: Record<string, number> = {
  '€': 0x80,
  '‚': 0x82,
  '„': 0x84,
  '…': 0x85,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '−': 0x2d,
};

/** Encodes text as a PDF literal string in WinAnsi (covers Spanish: á é í ó ú ñ ü ¿ ¡). */
function pdfString(text: string): string {
  let out = '(';
  for (const ch of text.normalize('NFC')) {
    const extra = WIN_ANSI_EXTRA[ch];
    let code = extra ?? ch.codePointAt(0) ?? 63;
    if (extra === undefined && (code > 255 || (code >= 0x80 && code < 0xa0))) code = 63; // '?'
    if (code === 0x28 || code === 0x29 || code === 0x5c) out += `\\${String.fromCharCode(code)}`;
    else if (code < 32 || code > 126) out += `\\${code.toString(8).padStart(3, '0')}`;
    else out += String.fromCharCode(code);
  }
  return `${out})`;
}

function wrap(text: string, size: number, maxWidth: number): string[] {
  const avg = size * 0.5;
  const maxChars = Math.max(10, Math.floor(maxWidth / avg));
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line ? `${line} ${word}` : word).length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class Page {
  ops: string[] = [];
  y = PAGE_H - MARGIN;

  text(x: number, y: number, s: string, size: number, bold = false, rgb: [number, number, number] = [0.11, 0.12, 0.13]) {
    this.ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${rgb.join(' ')} rg ${x.toFixed(2)} ${y.toFixed(2)} Td ${pdfString(s)} Tj ET`);
  }
  rightText(xRight: number, y: number, s: string, size: number, bold = false, rgb?: [number, number, number]) {
    this.text(xRight - textWidth(s, size), y, s, size, bold, rgb);
  }
  line(x1: number, y1: number, x2: number, y2: number, width = 0.6, gray = 0.75) {
    this.ops.push(`${gray} G ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }
  rect(x: number, y: number, w: number, h: number, rgb: [number, number, number]) {
    this.ops.push(`${rgb.join(' ')} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }
}

const NEGATIVE: [number, number, number] = [0.66, 0.1, 0.1];
const MUTED: [number, number, number] = [0.38, 0.4, 0.43];

export function buildPdf(report: Report): Uint8Array {
  const pages: Page[] = [new Page()];
  let page = pages[0] as Page;
  const right = PAGE_W - MARGIN;
  const ensure = (needed: number) => {
    if (page.y - needed < MARGIN) {
      page = new Page();
      pages.push(page);
    }
  };

  // Header
  page.text(MARGIN, page.y, report.siteName, 10, true, MUTED);
  page.rightText(right, page.y, report.generatedOn, 9, false, MUTED);
  page.y -= 28;
  page.text(MARGIN, page.y, report.title, 20, true);
  page.y -= 16;
  for (const l of wrap(report.subtitle, 10, right - MARGIN)) {
    page.text(MARGIN, page.y, l, 10, false, MUTED);
    page.y -= 13;
  }
  page.y -= 10;

  // Headline amount
  page.rect(MARGIN, page.y - 46, right - MARGIN, 52, [0.95, 0.95, 0.93]);
  page.text(MARGIN + 14, page.y - 16, report.headline.label, 10, false, MUTED);
  page.text(MARGIN + 14, page.y - 36, report.headline.value, 20, true);
  page.y -= 72;

  for (const section of report.sections) {
    ensure(40);
    page.text(MARGIN, page.y, section.title, 12, true);
    page.y -= 8;
    page.line(MARGIN, page.y, right, page.y, 0.8, 0.2);
    page.y -= 16;
    for (const row of section.rows) {
      const detailLines = row.detail ? wrap(row.detail, 8, right - MARGIN - 140) : [];
      ensure(16 + detailLines.length * 10);
      const bold = row.tone === 'total';
      const color = row.tone === 'negative' ? NEGATIVE : undefined;
      page.text(MARGIN, page.y, row.label, 10, bold, color);
      page.rightText(right, page.y, row.value, 10, bold, color);
      page.y -= 11;
      for (const d of detailLines) {
        page.text(MARGIN, page.y, d, 8, false, MUTED);
        page.y -= 10;
      }
      page.y -= 4;
      page.line(MARGIN, page.y + 2, right, page.y + 2, 0.3, 0.85);
      page.y -= 8;
    }
    page.y -= 10;
  }

  ensure(30);
  for (const note of report.notes) {
    for (const l of wrap(note, 8, right - MARGIN)) {
      ensure(12);
      page.text(MARGIN, page.y, l, 8, false, MUTED);
      page.y -= 10;
    }
    page.y -= 4;
  }
  ensure(14);
  page.text(MARGIN, page.y, report.url, 8, false, MUTED);

  // Serialize
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const catalogId = add('');
  const pagesId = add('');
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const pageIds: number[] = [];
  for (const p of pages) {
    const stream = p.ops.join('\n');
    const contentId = add(`<< /Length ${latin1Length(stream)} >>\nstream\n${stream}\nendstream`);
    pageIds.push(
      add(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${contentId} 0 R >>`,
      ),
    );
  }
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const info = add(`<< /Title ${pdfString(report.title)} /Producer ${pdfString(report.siteName)} >>`);

  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(latin1Length(out));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = latin1Length(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i += 1) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}

function latin1Length(s: string): number {
  return s.length;
}

export function downloadPdf(report: Report, filename: string): void {
  const bytes = buildPdf(report);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
