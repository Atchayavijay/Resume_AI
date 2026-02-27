import { NextRequest, NextResponse } from 'next/server';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { pdfRateLimiter } from '@/lib/rateLimiter';
import { getUserIdFromRequest } from '@/lib/auth/withAuth';
import { pdfQueue, isQueueEnabled } from '@/lib/queue';
import { generatePDF } from '@/lib/pdf-utils';

export const runtime = 'nodejs';

// Initialize DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate Limiting
  const { success, reset } = await pdfRateLimiter.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in ' + Math.ceil((reset - Date.now()) / 1000) + 's' },
      { status: 429 }
    );
  }

  try {
    const { html, fileName, options } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    // Sanitize HTML
    const cleanHtml = DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ['style', 'link'],
      ADD_ATTR: ['class', 'style', 'id', 'src', 'href'],
      PARSER_MEDIA_TYPE: 'text/html',
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    });

    if (!isQueueEnabled) {
      console.log('Redis is not configured. Falling back to synchronous PDF generation.');
      const pdfBuffer = await generatePDF(cleanHtml, options);
      const base64 = pdfBuffer.toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        state: 'completed',
        result: { success: true, base64, fileName: fileName || 'resume.pdf' },
        message: 'PDF generated synchronously (Redis fallback)' 
      });
    }

    // Enqueue PDF generation job
    const job = await pdfQueue.add('generate-pdf', {
      html: cleanHtml,
      fileName: fileName || 'resume.pdf',
      options: options || { format: 'A4' },
      userId
    });

    return NextResponse.json({ 
      success: true, 
      jobId: job.id, 
      message: 'PDF generation enqueued' 
    });

  } catch (err: any) {
    console.error('PDF Export Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  if (!isQueueEnabled) {
     return NextResponse.json({ error: 'Queue is disabled' }, { status: 503 });
  }

  try {
    const job = await pdfQueue.getJob(jobId);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const result = job.returnvalue;

    return NextResponse.json({
      id: job.id,
      state,
      progress: job.progress,
      result
    });
  } catch (err: any) {
    console.error('Job Status Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
