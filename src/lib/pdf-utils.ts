import puppeteer from 'puppeteer';

export interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  margin?: { top: string; right: string; bottom: string; left: string };
}

export async function generatePDF(html: string, options?: PDFOptions) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1
    });

    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 60000
    });

    await page.addStyleTag({
      content: `
        @page {
          size: 794px 1123px;
          margin: 0;
        }
        * {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 794px !important;
          background: white !important;
          overflow: visible !important;
          display: block !important;
        }
        #resume-preview {
          width: 794px !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          transform: none !important;
          display: block !important;
        }
        .resume-page {
          margin: 0 !important;
          padding: var(--resume-margin-tb) var(--resume-margin-lr) !important;
          box-shadow: none !important;
          width: 794px !important;
          height: 1123px !important;
          min-height: 1123px !important;
          position: relative !important;
          display: block !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          transform: none !important;
          overflow: hidden !important;
          background: white !important;
        }
      `
    });

    // Ensure fonts are loaded before generating PDF
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      width: '794px',
      height: '1123px',
      scale: 1,
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      },
      preferCSSPageSize: true
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) await browser.close();
  }
}
