import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { MethodsSearch } from './methods-search';

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
    return educationMethods as Method[];
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
    category: m.category || 'engagement',
    description: m.description,
    duration_range: m.duration_label,
    difficulty: 'medium' as Difficulty, // Default to medium
    keywords: Array.isArray(m.tags) ? m.tags : [],
  }));
}

function groupByCategory(methods: Method[]): CategoryGroup[] {
  const groups: Record<string, Method[]> = {};

  methods.forEach(method => {
    const category = method.category || 'other';
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
    </div>
  );
}
