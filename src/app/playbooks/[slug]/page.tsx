import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { EmailSignupCta } from '@/components/marketing/EmailSignupCta';

interface PlaybookStep {
  order: number;
  title: string;
  phase?: string;
  time_window?: string;
  intervention_duration?: string;
  owner?: string;
  success_signal?: string;
  challenge_title?: string;
  method_name?: string;
  intervention: string;
  script_template: string;
  run_in_metodic_url?: string;
}

interface Playbook {
  id: string;
  slug: string;
  title: string;
  category: string;
  organizational_challenge: string;
  summary: string | null;
  target_audience: string | null;
  estimated_duration: string | null;
  sequence: PlaybookStep[];
  generated_from: {
    transformation_horizon?: string;
    cadence?: string;
    review_checkpoint?: string;
  } | null;
}

async function getPlaybook(slug: string): Promise<Playbook | null> {
  const { data, error } = await supabase
    .from('education_playbooks')
    .select('id, slug, title, category, organizational_challenge, summary, target_audience, estimated_duration, sequence, generated_from')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...(data as Omit<Playbook, 'sequence' | 'generated_from'>),
    sequence: Array.isArray(data.sequence) ? (data.sequence as PlaybookStep[]) : [],
    generated_from: data.generated_from as Playbook['generated_from'],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);
  if (!playbook) {
    return {
      title: 'Playbook not found | METODIC learn',
    };
  }

  return {
    title: `${playbook.title} | METODIC learn`,
    description: playbook.summary || playbook.organizational_challenge,
    openGraph: {
      title: `${playbook.title} | METODIC learn`,
      description: playbook.summary || playbook.organizational_challenge,
    },
  };
}

export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);

  if (!playbook) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/playbooks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Icon icon="carbon:arrow-left" className="h-4 w-4" />
          Back to playbooks
        </Link>
      </div>

      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{playbook.sequence.length} steps</Badge>
          {playbook.generated_from?.transformation_horizon && (
            <Badge variant="outline">{playbook.generated_from.transformation_horizon}</Badge>
          )}
          {playbook.estimated_duration && <Badge variant="outline">{playbook.estimated_duration}</Badge>}
          <Badge variant="outline">{playbook.category}</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{playbook.title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {playbook.summary || playbook.organizational_challenge}
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          <span className="font-medium text-foreground">Designed for:</span> {playbook.target_audience || 'Leaders and facilitators'}
        </p>
        <div className="mt-4">
          <a
            href={`/playbooks/${playbook.slug}/download`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Icon icon="carbon:download" className="h-4 w-4" />
            Download Extended PDF
          </a>
        </div>
      </header>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organizational Challenge</CardTitle>
            <CardDescription>The context this playbook is built to solve</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{playbook.organizational_challenge}</p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transformation Timeline</CardTitle>
            <CardDescription>Playbook-level rhythm across multiple interventions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {playbook.generated_from?.transformation_horizon && (
              <Badge variant="outline">Horizon: {playbook.generated_from.transformation_horizon}</Badge>
            )}
            {playbook.generated_from?.cadence && (
              <Badge variant="outline">Cadence: {playbook.generated_from.cadence}</Badge>
            )}
            {playbook.generated_from?.review_checkpoint && (
              <Badge variant="outline">Checkpoint: {playbook.generated_from.review_checkpoint}</Badge>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        {playbook.sequence.map((step) => (
          <Card key={`${step.order}-${step.title}`}>
            <CardHeader>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-1">
                {step.phase && <Badge variant="secondary">Phase: {step.phase}</Badge>}
                {step.time_window && <Badge variant="secondary">{step.time_window}</Badge>}
                {step.challenge_title && <Badge variant="outline">Challenge: {step.challenge_title}</Badge>}
                {step.method_name && <Badge variant="outline">Method: {step.method_name}</Badge>}
                {step.intervention_duration && <Badge variant="outline">{step.intervention_duration}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Intervention</h3>
                <p className="text-sm text-muted-foreground">{step.intervention}</p>
              </div>
              <div className="h-px w-full bg-border" />
              <div>
                <h3 className="text-sm font-semibold mb-1">Script Template</h3>
                <p className="text-sm">{step.script_template}</p>
              </div>
              {(step.owner || step.success_signal) && (
                <>
                  <div className="h-px w-full bg-border" />
                  <div className="grid md:grid-cols-2 gap-3">
                    {step.owner && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Owner</h3>
                        <p className="text-sm text-muted-foreground">{step.owner}</p>
                      </div>
                    )}
                    {step.success_signal && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Success Signal</h3>
                        <p className="text-sm text-muted-foreground">{step.success_signal}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              {step.run_in_metodic_url && (
                <a
                  href={step.run_in_metodic_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Run this step in Metodic
                  <Icon icon="carbon:arrow-up-right" className="h-4 w-4" />
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10 max-w-3xl">
        <EmailSignupCta
          compact
          source="playbook-detail"
          title="Get updates and news"
          description="Get updates and news about new playbooks, intervention sequences, and practical scripts."
        />
      </section>
    </div>
  );
}
