import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { html, fileName } = await req.json();
    // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'shell' });
    const page = await browser.newPage();
    // Set A4 viewport size
    await page.setViewport({ width: 1122, height: 1587 }); // 1122x1587px ~ 210x297mm @ 135dpi
    let finalHtml = html;
    // Inject Google Fonts if not present
    if (!finalHtml.includes('fonts.googleapis.com')) {
      finalHtml = finalHtml.replace(
        '<head>',
        `<head><link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap\" rel=\"stylesheet\">`
      );
    }
    // Set content and wait for network
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    // Wait for fonts and images to load
    await page.evaluate(async () => {
      // Wait for all fonts
      // @ts-ignore
      if (document.fonts) await document.fonts.ready;
      // Wait for all images
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = img.onerror = resolve; });
      }));
    });
    // Only print the .resume-print-area
    await page.addStyleTag({ content: `body > *:not(.resume-print-area) { display: none !important; }` });
    // Extract margin values from CSS variables in the HTML
    const marginTBMatch = finalHtml.match(/--resume-margin-tb:\s*([^;]+)/);
    const marginLRMatch = finalHtml.match(/--resume-margin-lr:\s*([^;]+)/);
    const topMargin = marginTBMatch ? marginTBMatch[1].trim() : '10mm';
    const sideMargin = marginLRMatch ? marginLRMatch[1].trim() : '10mm';
    
    // Inject print CSS for modern UI with proper page breaks and consistent margins
    await page.addStyleTag({
      content: `
        @page {
          size: A4;
          margin: ${topMargin} ${sideMargin} !important;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .resume-print-area,
          .resume-print-area * {
            visibility: visible !important;
          }
          .resume-print-area {
            position: relative !important;
            width: 100% !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          /* First element on first page has no extra top margin */
          .resume-print-area > *:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          /* Sections should not break across pages */
          section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 0;
          }
          /* First section has no extra margin */
          section:first-of-type {
            margin-top: 0 !important;
          }
          /* When section starts on new page, it should have top margin from @page */
          .print\\:break-after-page {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `,
    });
    // If the user is in dark mode, force dark mode for Puppeteer
    if (finalHtml.includes('dark:bg-gray-900')) {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
    }
    // Generate PDF in A4
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0in',
        right: '0in',
        bottom: '0in',
        left: '0in',
      },
    });
    await browser.close();
    // Return PDF as response
    // Convert Uint8Array to Buffer for NextResponse
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'resume'}.pdf"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
