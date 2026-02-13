import { Metadata } from 'next';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { PlaybooksSearch } from './playbooks-search';
import { EmailSignupCta } from '@/components/marketing/EmailSignupCta';

export const metadata: Metadata = {
  title: 'Playbooks | METODIC learn',
  description: 'Sequenced playbooks that combine challenges, interventions, and scripts for high-stakes meetings and sessions.',
  openGraph: {
    title: 'Playbooks | METODIC learn',
    description: 'Sequenced playbooks for recurring team and organizational challenges.',
  },
};

interface PlaybookRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  organizational_challenge: string;
  summary: string | null;
  target_audience: string | null;
  estimated_duration: string | null;
  sequence: unknown[];
  generated_from: {
    transformation_horizon?: string;
    cadence?: string;
    review_checkpoint?: string;
  } | null;
}

async function getPlaybooks(): Promise<PlaybookRow[]> {
  const { data, error } = await supabase
    .from('education_playbooks')
    .select('id, slug, title, category, organizational_challenge, summary, target_audience, estimated_duration, sequence, generated_from')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching playbooks:', error);
    return [];
  }

  return data as PlaybookRow[];
}

export default async function PlaybooksPage() {
  const playbooks = await getPlaybooks();

  return (
    <div className="container py-12">
      <header className="mb-8">
        <Badge variant="secondary" className="mb-4">Sequenced guides</Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Playbooks
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Run a complete sequence instead of a single tactic. These playbooks combine challenges,
          interventions, and facilitator phrasing for meetings and sessions that need strong outcomes.
        </p>
      </header>

      {playbooks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon icon="carbon:roadmap" className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No published playbooks yet</h2>
            <p className="text-sm text-muted-foreground">
              Playbooks are being prepared in Admin Education and will appear here once published.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PlaybooksSearch playbooks={playbooks.map((playbook) => ({
          ...playbook,
          sequence: Array.isArray(playbook.sequence) ? playbook.sequence : [],
        }))} />
      )}

      <section className="mt-10 max-w-3xl">
        <EmailSignupCta
          compact
          source="playbooks-page"
          title="Get playbook updates and news"
          description="Get updates and news as new transformation playbooks and intervention sequences are published."
        />
      </section>
    </div>
  );
}
