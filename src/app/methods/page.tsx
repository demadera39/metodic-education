import { Metadata } from 'next';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase';
import { MethodsSearch } from './methods-search';
import { EmailSignupCta } from '@/components/marketing/EmailSignupCta';

export const metadata: Metadata = {
  title: 'Facilitation Methods | METODIC learn',
  description: 'Step-by-step instructions for running effective workshops and meetings. Each method includes timing, tips, and variations.',
  openGraph: {
    title: 'Facilitation Methods | METODIC learn',
    description: 'Step-by-step instructions for running effective workshops and meetings.',
  },
};

type Difficulty = 'easy' | 'medium' | 'hard';

interface Method {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  duration_range: string | null;
  difficulty: Difficulty;
  keywords: string[];
}

interface CategoryGroup {
  category: string;
  icon: string;
  description: string;
  methods: Method[];
}

function normalizeCategory(rawCategory: string | null | undefined): string {
  const raw = (rawCategory || '').toLowerCase();

  if (raw.includes('decision')) return 'decision';
  if (raw.includes('ideation') || raw.includes('innovation')) return 'ideation';
  if (raw.includes('retrospective') || raw.includes('reflection')) return 'retrospective';
  if (raw.includes('energizer') || raw.includes('icebreaker')) return 'energizer';
  if (
    raw.includes('problem solving') ||
    raw.includes('problem-solving') ||
    raw.includes('analysis') ||
    raw.includes('systems thinking') ||
    raw.includes('evaluation')
  ) {
    return 'problem-solving';
  }
  if (
    raw.includes('alignment') ||
    raw.includes('team building') ||
    raw.includes('communication') ||
    raw.includes('collaboration')
  ) {
    return 'alignment';
  }

  return 'engagement';
}

function parseMaxMinutes(durationRange: string | null | undefined): number | null {
  if (!durationRange) return null;
  const matches = durationRange.match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  const values = matches.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
  if (values.length === 0) return null;
  return Math.max(...values);
}

function inferDifficulty(
  durationRange: string | null | undefined,
  keywords: string[] = [],
  name: string = ''
): Difficulty {
  const maxMinutes = parseMaxMinutes(durationRange);
  const combined = `${name} ${keywords.join(' ')}`.toLowerCase();

  if (
    combined.includes('advanced') ||
    combined.includes('expert') ||
    combined.includes('complex') ||
    combined.includes('deep democracy')
  ) {
    return 'hard';
  }

  if (
    combined.includes('icebreaker') ||
    combined.includes('energizer') ||
    combined.includes('check-in') ||
    combined.includes('dot voting')
  ) {
    return 'easy';
  }

  if (maxMinutes === null) return 'medium';
  if (maxMinutes <= 15) return 'easy';
  if (maxMinutes <= 60) return 'medium';
  return 'hard';
}

const categoryConfig: Record<string, { icon: string; description: string }> = {
  engagement: { icon: 'carbon:user-speaker', description: 'Get everyone involved, not just the loud voices' },
  decision: { icon: 'carbon:decision-tree', description: 'Move from discussion to decision' },
  ideation: { icon: 'carbon:idea', description: 'Generate creative ideas and solutions' },
  retrospective: { icon: 'carbon:review', description: 'Reflect, learn, and improve together' },
  alignment: { icon: 'carbon:compass', description: 'Get everyone on the same page' },
  energizer: { icon: 'carbon:lightning', description: 'Build energy and connection' },
  'problem-solving': { icon: 'carbon:analytics', description: 'Analyze and solve complex problems' },
};

async function getMethods(): Promise<Method[]> {
  // First try education_methods table
  const { data: educationMethods, error: educationError } = await supabase
    .from('education_methods')
    .select('id, slug, name, category, description, duration_range, difficulty, keywords')
    .eq('is_published', true)
    .order('name');

  if (!educationError && educationMethods && educationMethods.length > 0) {
    return educationMethods.map((m) => ({
      ...m,
      category: normalizeCategory(m.category),
      difficulty: m.difficulty || inferDifficulty(m.duration_range, m.keywords || [], m.name),
      keywords: Array.isArray(m.keywords) ? m.keywords : [],
    })) as Method[];
  }

  // Fallback to curated_methods table (645+ methods)
  const { data: curatedMethods, error: curatedError } = await supabase
    .from('curated_methods')
    .select('id, slug, name, category, description, duration_label, tags')
    .eq('is_active', true)
    .order('name');

  if (curatedError || !curatedMethods) {
    console.error('Error fetching methods:', curatedError);
    return [];
  }

  // Map curated_methods to our Method interface
  return curatedMethods.map(m => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    category: normalizeCategory(m.category),
    description: m.description,
    duration_range: m.duration_label,
    difficulty: inferDifficulty(m.duration_label, Array.isArray(m.tags) ? m.tags : [], m.name),
    keywords: Array.isArray(m.tags) ? m.tags : [],
  }));
}

function groupByCategory(methods: Method[]): CategoryGroup[] {
  const groups: Record<string, Method[]> = {};

  methods.forEach(method => {
    const category = normalizeCategory(method.category);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(method);
  });

  return Object.entries(groups).map(([category, methods]) => {
    const config = categoryConfig[category] || { icon: 'carbon:folder', description: '' };
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
      icon: config.icon,
      description: config.description,
      methods,
    };
  });
}

export default async function MethodsPage() {
  const methods = await getMethods();
  const categoryGroups = groupByCategory(methods);
  const totalMethods = methods.length;

  if (totalMethods === 0) {
    return (
      <div className="container py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Facilitation Methods
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Step-by-step instructions for running effective workshops and meetings.
          </p>
        </header>

        <div className="text-center py-12">
          <Icon icon="carbon:catalog" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No methods available yet</h3>
          <p className="text-muted-foreground mb-4">
            Check back soon for facilitation methods and techniques.
          </p>
        </div>

        {/* CTA Section */}
        <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
          <Icon icon="carbon:catalog" className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4">
            Want a Complete Method Library?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Metodic includes 645+ methods as building blocks. Mix and match to create custom sessions.
          </p>
          <a
            href="https://metodic.io/methods"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon icon="carbon:catalog" className="h-5 w-5" />
            Explore Full Library
          </a>
        </section>

        <section className="mt-8 max-w-3xl">
          <EmailSignupCta
            compact
            source="methods-empty"
            title="Get method updates and news"
            description="Get updates and news when new facilitation methods and step-by-step guides are added."
          />
        </section>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Facilitation Methods
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Step-by-step instructions for running effective workshops and meetings.
          Each method includes timing, tips, and variations.
        </p>
      </header>

      {/* Search - Client Component */}
      <MethodsSearch
        categoryGroups={categoryGroups}
        totalMethods={totalMethods}
      />

      {/* CTA Section */}
      <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
        <Icon icon="carbon:catalog" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Want a Complete Method Library?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Metodic includes 100+ methods as building blocks. Mix and match to create custom sessions.
        </p>
        <a
          href="https://metodic.io/methods"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon icon="carbon:catalog" className="h-5 w-5" />
          Explore Full Library
        </a>
      </section>

      <section className="mt-8 max-w-3xl">
        <EmailSignupCta
          compact
          source="methods-page"
          title="Get updates and news for methods"
          description="Get updates and news about new methods, variations, and practical facilitation tips."
        />
      </section>
    </div>
  );
}
