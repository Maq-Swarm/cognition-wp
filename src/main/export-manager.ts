/**
 * Cognition WP — Export Manager
 * Handles exporting documents to multiple formats: .cog, .md, .txt, .pdf, .docx, .doc (RTF), .html
 */

import { BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { COGNITION_DOC_FORMAT } from '../shared/constants';

export class ExportManager {
  constructor() {
    this.registerIPC();
  }

  private registerIPC() {
    ipcMain.handle('export:document', async (_, data: ExportRequest) => {
      return this.exportDocument(data);
    });
  }

  async exportDocument(data: ExportRequest): Promise<{ success: boolean; filePath: string | null; error?: string }> {
    const { format, content, title, window } = data;

    // Show save dialog
    const filters = this.getFilters(format);
    const result = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow() || undefined!, {
      title: `Export as ${format.toUpperCase()}`,
      defaultPath: title || 'Untitled',
      filters,
    });

    if (result.canceled || !result.filePath) {
      return { success: false, filePath: null };
    }

    const filePath = result.filePath;

    try {
      switch (format) {
        case 'cog':
          this.exportCog(filePath, content, title);
          break;
        case 'markdown':
        case 'md':
          this.exportMarkdown(filePath, content);
          break;
        case 'txt':
        case 'plaintext':
          this.exportText(filePath, content);
          break;
        case 'html':
          this.exportHtml(filePath, content, title);
          break;
        case 'pdf':
          await this.exportPdf(filePath, content, title, window);
          break;
        case 'docx':
          this.exportDocx(filePath, content, title);
          break;
        case 'doc':
          this.exportDoc(filePath, content, title);
          break;
        default:
          return { success: false, filePath: null, error: `Unknown format: ${format}` };
      }

      return { success: true, filePath };
    } catch (err) {
      return { success: false, filePath: null, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private getFilters(format: string): Electron.FileFilter[] {
    switch (format) {
      case 'cog': return [{ name: 'Cognition Document', extensions: ['cog'] }];
      case 'markdown': case 'md': return [{ name: 'Markdown', extensions: ['md'] }];
      case 'txt': case 'plaintext': return [{ name: 'Plain Text', extensions: ['txt'] }];
      case 'html': return [{ name: 'HTML', extensions: ['html'] }];
      case 'pdf': return [{ name: 'PDF', extensions: ['pdf'] }];
      case 'docx': return [{ name: 'Word Document', extensions: ['docx'] }];
      case 'doc': return [{ name: 'Word 97-2003 Document', extensions: ['doc'] }];
      default: return [{ name: 'All Files', extensions: ['*'] }];
    }
  }

  // ─── .cog Format (v2.0.0) ───────────────────────────────

  buildCogJson(htmlContent: string, title: string): string {
    const stats = this.computeStats(htmlContent);
    const doc: CognitionDocFile = {
      magic: COGNITION_DOC_FORMAT.magic,
      version: '2.0.0',
      metadata: {
        title: title || 'Untitled',
        author: '',
        subject: '',
        keywords: [],
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        appVersion: '1.0.0',
        format: 'cognition-wp',
        wordCount: stats.wordCount,
        charCount: stats.charCount,
        paragraphCount: stats.paragraphCount,
        readingTime: stats.readingTime,
      },
      content: {
        type: 'rich-html',
        html: htmlContent,
        plainText: this.htmlToText(htmlContent),
        markdown: this.htmlToMarkdown(htmlContent),
      },
      styles: {
        theme: 'cognition-dark',
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
        maxWidth: 720,
      },
      history: [
        {
          timestamp: Date.now(),
          action: 'created',
          appVersion: '1.0.0',
        },
      ],
    };
    return JSON.stringify(doc, null, 2);
  }

  private exportCog(filePath: string, htmlContent: string, title: string) {
    fs.writeFileSync(filePath, this.buildCogJson(htmlContent, title), 'utf-8');
  }

  // ─── Markdown ───────────────────────────────────────────

  private exportMarkdown(filePath: string, htmlContent: string) {
    const md = this.htmlToMarkdown(htmlContent);
    fs.writeFileSync(filePath, md, 'utf-8');
  }

  // ─── Plain Text ─────────────────────────────────────────

  private exportText(filePath: string, htmlContent: string) {
    const text = this.htmlToText(htmlContent);
    fs.writeFileSync(filePath, text, 'utf-8');
  }

  // ─── HTML ───────────────────────────────────────────────

  private exportHtml(filePath: string, htmlContent: string, title: string) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title || 'Untitled'}</title>
<style>
body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 20px; line-height: 1.6; font-size: 16px; color: #1e1e2e; }
h1 { font-size: 2em; } h2 { font-size: 1.5em; } h3 { font-size: 1.25em; }
h1, h2, h3, h4, h5, h6 { font-weight: 700; margin: 1em 0 0.3em; }
p { margin: 0 0 1em; }
blockquote { border-left: 3px solid #89b4fa; margin: 1em 0; padding: 0.5em 1em; background: #f5f5f5; }
pre { background: #f5f5f5; padding: 12px 16px; border-radius: 8px; overflow-x: auto; }
code { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 8px 12px; }
th { background: #f5f5f5; font-weight: 700; }
img { max-width: 100%; height: auto; border-radius: 8px; }
a { color: #6c5ce7; }
ul, ol { margin: 0 0 1em; padding-left: 2em; }
hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;
    fs.writeFileSync(filePath, html, 'utf-8');
  }

  // ─── PDF (via hidden BrowserWindow + printToPDF) ─────────

  private async exportPdf(filePath: string, htmlContent: string, title: string, parentWindow?: BrowserWindow): Promise<void> {
    const win = new BrowserWindow({
      show: false,
      width: 800,
      height: 1100,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        offscreen: true,
      },
      parent: parentWindow,
    });

    const styledHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title || 'Untitled'}</title>
<style>
@page { margin: 1in; }
body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 12pt; line-height: 1.6; color: #000; }
h1 { font-size: 22pt; } h2 { font-size: 18pt; } h3 { font-size: 14pt; }
h4 { font-size: 12pt; } h5 { font-size: 11pt; } h6 { font-size: 10pt; }
h1, h2, h3, h4, h5, h6 { font-weight: bold; margin: 1em 0 0.3em; }
p { margin: 0 0 1em; }
blockquote { border-left: 3px solid #999; margin: 1em 0; padding: 0.5em 1em; color: #555; }
pre { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: 'Consolas', monospace; font-size: 10pt; }
code { font-family: 'Consolas', monospace; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #000; padding: 6px 10px; }
th { background: #eee; font-weight: bold; }
img { max-width: 100%; }
ul, ol { margin: 0 0 1em; padding-left: 2em; }
hr { border: none; border-top: 1px solid #999; margin: 1em 0; }
a { color: #000; text-decoration: underline; }
</style>
</head>
<body>${htmlContent}</body>
</html>`;

    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(styledHtml));

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfBuffer = await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
    });

    fs.writeFileSync(filePath, pdfBuffer);
    win.close();
  }

  // ─── DOCX (Office Open XML — minimal but valid) ──────────

  private exportDocx(filePath: string, htmlContent: string, title: string) {
    const docxXml = this.buildDocx(htmlContent, title);
    // DOCX is a ZIP file. We'll build it with Node's zlib.
    const JSZip = require('jszip');
    // jszip might not be available — use a minimal ZIP builder instead
    const zip = this.createMinimalZip(docxXml);
    fs.writeFileSync(filePath, zip);
  }

  private buildDocx(htmlContent: string, title: string): Record<string, string> {
    // Convert HTML to OOXML paragraphs
    const paragraphs = this.htmlToDocxParagraphs(htmlContent);

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${paragraphs}
<w:sectPr>
<w:pgSz w:w="12240" w:h="15840"/>
<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
</w:sectPr>
</w:body>
</w:document>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

    return {
      '[Content_Types].xml': contentTypesXml,
      '_rels/.rels': relsXml,
      'word/document.xml': documentXml,
      'word/_rels/document.xml.rels': wordRelsXml,
    };
  }

  private htmlToDocxParagraphs(html: string): string {
    let paragraphs = '';
    // Parse with a simple DOM
    const { JSDOM } = require('jsdom');
    let doc: Document;
    try {
      doc = new JSDOM(html).window.document;
    } catch {
      // Fallback: create a temp element
      doc = null;
    }

    if (!doc) {
      // Simple text fallback
      const text = this.htmlToText(html);
      for (const line of text.split('\n')) {
        if (line.trim()) {
          paragraphs += `<w:p><w:r><w:t xml:space="preserve">${this.escapeXml(line)}</w:t></w:r></w:p>`;
        }
      }
      return paragraphs;
    }

    const body = doc.body;
    for (const node of body.childNodes) {
      paragraphs += this.nodeToDocx(node as Element);
    }
    return paragraphs;
  }

  private nodeToDocx(node: Element): string {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent;
      if (text.trim()) {
        return `<w:p><w:r><w:t xml:space="preserve">${this.escapeXml(text)}</w:t></w:r></w:p>`;
      }
      return '';
    }
    if (node.nodeType !== 1) return '';

    const tag = (node as Element).tagName.toLowerCase();
    const text = node.textContent || '';
    const escapedText = this.escapeXml(text);

    switch (tag) {
      case 'h1': return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'h2': return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'h3': return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'h4': return `<w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'h5': return `<w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'h6': return `<w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'p': return this.richTextToDocx(node as Element);
      case 'br': return `<w:p/>`;
      case 'hr': return `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="auto"/></w:pBdr></w:pPr></w:p>`;
      case 'blockquote': return `<w:p><w:pPr><w:ind w:left="720"/><w:pStyle w:val="Quote"/></w:pPr><w:r><w:i/><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'pre':
        return `<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/></w:rPr><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
      case 'ul':
        let ulItems = '';
        for (const li of (node as Element).querySelectorAll(':scope > li')) {
          ulItems += `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:ind w:left="720"/></w:pPr><w:r><w:t xml:space="preserve">${this.escapeXml(li.textContent || '')}</w:t></w:r></w:p>`;
        }
        return ulItems;
      case 'ol':
        let olItems = '';
        for (const li of (node as Element).querySelectorAll(':scope > li')) {
          olItems += `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:ind w:left="720"/></w:pPr><w:r><w:t xml:space="preserve">${this.escapeXml(li.textContent || '')}</w:t></w:r></w:p>`;
        }
        return olItems;
      case 'table':
        return this.tableToDocx(node as Element);
      default:
        if (text.trim()) {
          return `<w:p><w:r><w:t xml:space="preserve">${escapedText}</w:t></w:r></w:p>`;
        }
        return '';
    }
  }

  private richTextToDocx(element: Element): string {
    // Walk child nodes to handle bold/italic/underline/code inline
    let runs = '';
    for (const child of element.childNodes) {
      runs += this.inlineNodeToDocxRun(child as Element);
    }
    if (!runs) {
      const text = this.escapeXml(element.textContent || '');
      if (text.trim()) {
        runs = `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>`;
      }
    }
    return `<w:p>${runs}</w:p>`;
  }

  private inlineNodeToDocxRun(node: Element): string {
    if (node.nodeType === 3) {
      const text = this.escapeXml(node.textContent || '');
      return text.trim() ? `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` : '';
    }
    if (node.nodeType !== 1) return '';

    const tag = (node as Element).tagName.toLowerCase();
    const text = this.escapeXml(node.textContent || '');
    if (!text.trim() && tag !== 'br') return '';

    let rPr = '';
    switch (tag) {
      case 'strong': case 'b': rPr = '<w:b/>'; break;
      case 'em': case 'i': rPr = '<w:i/>'; break;
      case 'u': rPr = '<w:u w:val="single"/>'; break;
      case 's': case 'strike': case 'del': rPr = '<w:strike/>'; break;
      case 'code': rPr = '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'; break;
      case 'sub': rPr = '<w:vertAlign w:val="subscript"/>'; break;
      case 'sup': rPr = '<w:vertAlign w:val="superscript"/>'; break;
      case 'a':
        return `<w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`;
      case 'br': return '<w:r><w:br/></w:r>';
      case 'mark': rPr = '<w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/>'; break;
      default: break;
    }

    return `<w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`;
  }

  private tableToDocx(element: Element): string {
    let rows = '';
    const trs = element.querySelectorAll('tr');
    for (const tr of trs) {
      let cells = '';
      const tds = tr.querySelectorAll('th, td');
      for (const td of tds) {
        const isHeader = td.tagName.toLowerCase() === 'th';
        const text = this.escapeXml(td.textContent || '');
        const rPr = isHeader ? '<w:rPr><w:b/></w:rPr>' : '';
        cells += `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr><w:p><w:r>${rPr}<w:t xml:space="preserve">${text}</w:t></w:r></w:p></w:tc>`;
      }
      rows += `<w:tr>${cells}</w:tr>`;
    }
    return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>
<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
<w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
</w:tblBorders></w:tblPr>${rows}</w:tbl><w:p/>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private createMinimalZip(files: Record<string, string>): Buffer {
    // Use Node's built-in zlib + a minimal ZIP builder
    // Since we can't guarantee JSZip, we'll use a simpler approach:
    // Build a ZIP using the archiver package if available, or fallback to RTF for .docx
    try {
      const archiver = require('archiver');
      // This won't work synchronously — we need a different approach
    } catch {}

    // Fallback: write as RTF with .docx extension won't work.
    // Instead, let's build a proper ZIP using zlib
    return this.buildZip(files);
  }

  private buildZip(files: Record<string, string>): Buffer {
    const zlib = require('zlib');
    const crc32 = require('zlib').crc32 || ((buf: Buffer) => {
      // Simple CRC32 implementation
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < buf.length; i++) {
        crc = crc ^ buf[i];
        for (let j = 0; j < 8; j++) {
          crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
        }
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    });

    const localFiles: { name: string; data: Buffer; crc: number; compressed: Buffer }[] = [];
    const centralDir: Buffer[] = [];
    let offset = 0;

    for (const [name, content] of Object.entries(files)) {
      const nameBuf = Buffer.from(name, 'utf-8');
      const data = Buffer.from(content, 'utf-8');
      const crc = typeof crc32 === 'function' ? crc32(data) : this.crc32(data);
      const compressed = zlib.deflateRawSync(data);

      // Local file header
      const localHeader = Buffer.alloc(30);
      localHeader.writeUInt32LE(0x04034b50, 0); // signature
      localHeader.writeUInt16LE(20, 4); // version needed
      localHeader.writeUInt16LE(0, 6); // flags
      localHeader.writeUInt16LE(8, 8); // compression: deflate
      localHeader.writeUInt16LE(0, 10); // mod time
      localHeader.writeUInt16LE(0, 12); // mod date
      localHeader.writeUInt32LE(crc, 14); // crc32
      localHeader.writeUInt32LE(compressed.length, 18); // compressed size
      localHeader.writeUInt32LE(data.length, 22); // uncompressed size
      localHeader.writeUInt16LE(nameBuf.length, 26); // filename length
      localHeader.writeUInt16LE(0, 28); // extra field length

      localFiles.push({ name: name, data, crc, compressed });

      // Central directory entry
      const cdHeader = Buffer.alloc(46);
      cdHeader.writeUInt32LE(0x02014b50, 0); // signature
      cdHeader.writeUInt16LE(20, 4); // version made by
      cdHeader.writeUInt16LE(20, 6); // version needed
      cdHeader.writeUInt16LE(0, 8); // flags
      cdHeader.writeUInt16LE(8, 10); // compression
      cdHeader.writeUInt16LE(0, 12); // mod time
      cdHeader.writeUInt16LE(0, 14); // mod date
      cdHeader.writeUInt32LE(crc, 16);
      cdHeader.writeUInt32LE(compressed.length, 20);
      cdHeader.writeUInt32LE(data.length, 24);
      cdHeader.writeUInt16LE(nameBuf.length, 28);
      cdHeader.writeUInt16LE(0, 30); // extra
      cdHeader.writeUInt16LE(0, 32); // comment
      cdHeader.writeUInt16LE(0, 34); // disk number
      cdHeader.writeUInt16LE(0, 36); // internal attrs
      cdHeader.writeUInt32LE(0, 38); // external attrs
      cdHeader.writeUInt32LE(offset, 42); // offset of local header

      centralDir.push(Buffer.concat([cdHeader, nameBuf]));

      offset += localHeader.length + nameBuf.length + compressed.length;
    }

    // Build the full ZIP
    const parts: Buffer[] = [];
    for (let i = 0; i < localFiles.length; i++) {
      const lf = localFiles[i];
      const nameBuf = Buffer.from(lf.name, 'utf-8');
      const localHeader = Buffer.alloc(30);
      localHeader.writeUInt32LE(0x04034b50, 0);
      localHeader.writeUInt16LE(20, 4);
      localHeader.writeUInt16LE(0, 6);
      localHeader.writeUInt16LE(8, 8);
      localHeader.writeUInt16LE(0, 10);
      localHeader.writeUInt16LE(0, 12);
      localHeader.writeUInt32LE(lf.crc, 14);
      localHeader.writeUInt32LE(lf.compressed.length, 18);
      localHeader.writeUInt32LE(lf.data.length, 22);
      localHeader.writeUInt16LE(nameBuf.length, 26);
      localHeader.writeUInt16LE(0, 28);
      parts.push(localHeader, nameBuf, lf.compressed);
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const cd of centralDir) {
      parts.push(cd);
      cdSize += cd.length;
    }

    // End of central directory
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4); // disk
    eocd.writeUInt16LE(0, 6); // disk with CD
    eocd.writeUInt16LE(localFiles.length, 8); // entries on this disk
    eocd.writeUInt16LE(localFiles.length, 10); // total entries
    eocd.writeUInt32LE(cdSize, 12);
    eocd.writeUInt32LE(cdOffset, 16);
    eocd.writeUInt16LE(0, 20); // comment length
    parts.push(eocd);

    return Buffer.concat(parts);
  }

  private crc32(buf: Buffer): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // ─── DOC (RTF format — universally compatible with Word) ─

  private exportDoc(filePath: string, htmlContent: string, title: string) {
    const rtf = this.htmlToRtf(htmlContent, title);
    fs.writeFileSync(filePath, rtf, 'utf-8');
  }

  private htmlToRtf(html: string, title: string): string {
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Segoe UI;}{\\f1 Consolas;}}';

    // Color table
    rtf += '{\\colortbl ;\\red0\\green0\\blue0;\\red89\\green180\\blue250;}';

    // Parse HTML and convert to RTF
    const text = this.htmlToText(html);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.trim()) {
        // Escape RTF special characters
        const escaped = line
          .replace(/\\/g, '\\\\')
          .replace(/\{/g, '\\{')
          .replace(/\}/g, '\\}');
        rtf += `\\par ${escaped}`;
      }
    }

    rtf += '}';
    return rtf;
  }

  // ─── Utility: HTML to Markdown ──────────────────────────

  private htmlToMarkdown(element: HTMLElement | string): string {
    const html = typeof element === 'string' ? element : element.innerHTML;
    let md = html;

    // Headings
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');

    // Bold
    md = md.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');
    // Italic
    md = md.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');
    // Underline
    md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__');
    // Strikethrough
    md = md.replace(/<(s|strike|del)[^>]*>(.*?)<\/\1>/gi, '~~$2~~');
    // Inline code
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    // Links
    md = md.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    // Images
    md = md.replace(/<img[^>]*src="(.*?)"[^>]*alt="(.*?)"[^>]*\/?>/gi, '![$2]($1)');
    md = md.replace(/<img[^>]*src="(.*?)"[^>]*\/?>/gi, '![]($1)');

    // Code blocks
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
    md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

    // Blockquote
    md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
      return '\n' + content.replace(/<p[^>]*>(.*?)<\/p>/gi, '> $1\n').trim() + '\n';
    });

    // Horizontal rule
    md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

    // Lists
    md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
    });
    md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
      let i = 1;
      return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${i++}. $1\n`);
    });

    // Checklists
    md = md.replace(/<li[^>]*class="[^"]*checked[^"]*"[^>]*>([\s\S]*?)<\/li>/gi, '- [x] $1\n');
    md = md.replace(/<li[^>]*class="[^"]*checklist[^"]*"[^>]*>([\s\S]*?)<\/li>/gi, '- [ ] $1\n');

    // Tables
    md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, content) => {
      let table = '\n';
      const rows = content.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      rows.forEach((row, i) => {
        const cells = (row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [])
          .map(c => c.replace(/<[^>]+>/g, '').trim());
        table += '| ' + cells.join(' | ') + ' |\n';
        if (i === 0) {
          table += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
        }
      });
      return table + '\n';
    });

    // Paragraphs and breaks
    md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');

    // Remove remaining tags
    md = md.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');
    md = md.replace(/&#39;/g, "'");
    md = md.replace(/&apos;/g, "'");

    // Clean up extra whitespace
    md = md.replace(/\n{3,}/g, '\n\n');
    md = md.trim() + '\n';

    return md;
  }

  // ─── Utility: HTML to Plain Text ────────────────────────

  private htmlToText(html: string): string {
    let text = html;
    // Convert <br> and <p> to newlines
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<div[^>]*>/gi, '');
    text = text.replace(/<li[^>]*>/gi, '  • ');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<hr\s*\/?>/gi, '\n---\n');
    // Remove all other tags
    text = text.replace(/<[^>]+>/g, '');
    // Decode entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&apos;/g, "'");
    // Clean up
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }

  // ─── Utility: Compute Stats ─────────────────────────────

  private computeStats(html: string) {
    const text = this.htmlToText(html);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const paragraphs = html.split(/<p[^>]*>/i).length - 1;
    return {
      wordCount: words.length,
      charCount: text.length,
      paragraphCount: Math.max(0, paragraphs),
      readingTime: Math.max(1, Math.ceil(words.length / 200)),
    };
  }
}

// ─── Types ──────────────────────────────────────────────────

export interface ExportRequest {
  format: 'cog' | 'markdown' | 'md' | 'txt' | 'plaintext' | 'html' | 'pdf' | 'docx' | 'doc';
  content: string;
  title: string;
  window?: BrowserWindow;
}

export interface CognitionDocFile {
  magic: string;
  version: string;
  metadata: {
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    createdAt: number;
    modifiedAt: number;
    appVersion: string;
    format: string;
    wordCount: number;
    charCount: number;
    paragraphCount: number;
    readingTime: number;
  };
  content: {
    type: string;
    html: string;
    plainText: string;
    markdown: string;
  };
  styles: {
    theme: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    maxWidth: number;
  };
  history: Array<{
    timestamp: number;
    action: string;
    appVersion: string;
  }>;
}
