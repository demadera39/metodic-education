import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { ChallengesSearch } from './challenges-search';

export const metadata: Metadata = {
  title: 'Common Workshop & Meeting Challenges | METODIC learn',
  description: 'Find practical solutions for the challenges you face in meetings, workshops, and team sessions. Each challenge includes copy-paste scripts for immediate use.',
  openGraph: {
    title: 'Common Workshop & Meeting Challenges | METODIC learn',
    description: 'Find practical solutions for the challenges you face in meetings, workshops, and team sessions.',
  },
};

interface Challenge {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  solution_count: number;
  keywords: string[];
}

interface CategoryGroup {
  category: string;
  icon: string;
  challenges: Challenge[];
}

const categoryIcons: Record<string, string> = {
  participation: 'carbon:user-speaker',
  decision: 'carbon:decision-tree',
  alignment: 'carbon:connect',
  collaboration: 'carbon:group',
  efficiency: 'carbon:time',
  innovation: 'carbon:idea',
};

async function getChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('education_challenges')
    .select('id, slug, title, category, description, solution_count, keywords')
    .eq('is_published', true)
    .order('title');

  if (error || !data) {
    console.error('Error fetching challenges:', error);
    return [];
  }

  return data as Challenge[];
}

function groupByCategory(challenges: Challenge[]): CategoryGroup[] {
  const groups: Record<string, Challenge[]> = {};

  challenges.forEach(challenge => {
    const category = challenge.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(challenge);
  });

  return Object.entries(groups).map(([category, challenges]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
    icon: categoryIcons[category] || 'carbon:folder',
    challenges,
  }));
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();
  const categoryGroups = groupByCategory(challenges);
  const totalChallenges = challenges.length;

  if (totalChallenges === 0) {
    return (
      <div className="container py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Common Workshop & Meeting Challenges
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Find practical solutions for the challenges you face in meetings, workshops, and team sessions.
          </p>
        </header>

        <div className="text-center py-12">
          <Icon icon="carbon:document" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No challenges available yet</h3>
          <p className="text-muted-foreground mb-4">
            Check back soon for facilitation challenges and solutions.
          </p>
        </div>

        {/* CTA Section */}
        <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
          <Icon icon="carbon:idea" className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4">
            Have a Challenge?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Metodic can help you design a custom session for any challenge.
            Just describe your situation and get a tailored agenda.
          </p>
          <a
            href="https://metodic.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon icon="carbon:chat-bot" className="h-5 w-5" />
            Describe Your Challenge
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Common Workshop & Meeting Challenges
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Find practical solutions for the challenges you face in meetings, workshops, and team sessions.
          Each challenge includes copy-paste scripts for immediate use.
        </p>
      </header>

      {/* Search - Client Component */}
      <ChallengesSearch
        categoryGroups={categoryGroups}
        totalChallenges={totalChallenges}
      />

      {/* CTA Section */}
      <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
        <Icon icon="carbon:idea" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Don&apos;t See Your Challenge?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Metodic can help you design a custom session for any challenge.
          Just describe your situation and get a tailored agenda.
        </p>
        <a
          href="https://metodic.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon icon="carbon:chat-bot" className="h-5 w-5" />
          Describe Your Challenge
        </a>
      </section>
    </div>
  );
}
