import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  type PlaybookPdfData,
  type PlaybookStep,
  type ExtendedPrintableContent,
  renderPlaybookPdf,
} from '@/lib/playbook-pdf';

export const runtime = 'nodejs';

async function getPlaybook(slug: string): Promise<PlaybookPdfData | null> {
  const { data, error } = await supabase
    .from('education_playbooks')
    .select(
      'slug, title, category, organizational_challenge, summary, target_audience, estimated_duration, sequence, extended_printable, generated_from'
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;

  return {
    ...(data as Omit<PlaybookPdfData, 'sequence' | 'extended_printable' | 'generated_from'>),
    sequence: Array.isArray(data.sequence) ? (data.sequence as PlaybookStep[]) : [],
    extended_printable: (data.extended_printable as ExtendedPrintableContent) || null,
    generated_from: data.generated_from as PlaybookPdfData['generated_from'],
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);

  if (!playbook) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
  }

  const fileName = `${playbook.slug || 'playbook'}-extended.pdf`;

  try {
    const buffer = await renderPlaybookPdf(playbook);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[pdf-download] PDF generation failed:', err);
    return NextResponse.json(
      { error: 'PDF generation failed', detail: String(err) },
      { status: 500 }
    );
  }
}
