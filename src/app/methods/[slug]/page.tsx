import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Method {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  when_to_use: string | null;
  how_it_works: string | null;
  duration_range: string | null;
  group_size_range: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: { title: string; description: string }[];
  tips: string[];
  variations: string[];
  keywords: string[];
  source_url: string | null;
  attribution: string | null;
  is_published: boolean;
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
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
): 'easy' | 'medium' | 'hard' {
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

type Props = {
  params: Promise<{ slug: string }>;
};

async function getMethod(slug: string): Promise<Method | null> {
  // First try education_methods table
  const { data: educationMethod, error: educationError } = await supabase
    .from('education_methods')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!educationError && educationMethod) {
    return educationMethod as Method;
  }

  // Fallback to curated_methods table
  const { data: curatedMethod, error: curatedError } = await supabase
    .from('curated_methods')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (curatedError || !curatedMethod) {
    return null;
  }

  // Map curated_method to our Method interface
  return {
    id: curatedMethod.id,
    slug: curatedMethod.slug,
    name: curatedMethod.name,
    category: normalizeCategory(curatedMethod.category),
    description: curatedMethod.description,
    when_to_use: curatedMethod.purpose,
    how_it_works: curatedMethod.pain_point ? `Solves: ${curatedMethod.pain_point}` : null,
    duration_range: curatedMethod.duration_label,
    group_size_range: curatedMethod.group_size_label,
    difficulty: inferDifficulty(
      curatedMethod.duration_label,
      Array.isArray(curatedMethod.tags) ? curatedMethod.tags : [],
      curatedMethod.name
    ),
    steps: curatedMethod.steps || [],
    tips: curatedMethod.facilitator_tips || [],
    variations: curatedMethod.variations || [],
    keywords: curatedMethod.tags || [],
    source_url: curatedMethod.source_url,
    attribution: curatedMethod.source_framework,
    is_published: true,
  };
}

async function getRelatedChallenges(category: string): Promise<Challenge[]> {
  // Get challenges that might be related based on category mapping
  const categoryMap: Record<string, string[]> = {
    engagement: ['participation'],
    decision: ['decision'],
    ideation: ['innovation', 'collaboration'],
    retrospective: ['alignment', 'collaboration'],
    alignment: ['alignment'],
    energizer: ['participation', 'efficiency'],
    'problem-solving': ['decision', 'innovation'],
  };

  const challengeCategories = categoryMap[category] || ['participation'];

  const { data, error } = await supabase
    .from('education_challenges')
    .select('id, slug, title')
    .in('category', challengeCategories)
    .eq('is_published', true)
    .limit(4);

  if (error || !data) {
    return [];
  }

  return data as Challenge[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const method = await getMethod(slug);

  if (!method) {
    return { title: 'Method Not Found | METODIC learn' };
  }

  return {
    title: `${method.name} - Facilitation Method | METODIC learn`,
    description: method.description || `Learn how to use ${method.name} in your workshops and meetings.`,
    openGraph: {
      title: `${method.name} - How to Facilitate | METODIC learn`,
      description: method.description || `Learn how to use ${method.name} in your workshops and meetings.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  // Get education_methods slugs
  const { data: educationMethods } = await supabase
    .from('education_methods')
    .select('slug')
    .eq('is_published', true);

  // Get curated_methods slugs
  const { data: curatedMethods } = await supabase
    .from('curated_methods')
    .select('slug')
    .eq('is_active', true);

  const allSlugs = new Set<string>();

  (educationMethods || []).forEach(m => allSlugs.add(m.slug));
  (curatedMethods || []).forEach(m => allSlugs.add(m.slug));

  return Array.from(allSlugs).map(slug => ({ slug }));
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export default async function MethodPage({ params }: Props) {
  const { slug } = await params;
  const method = await getMethod(slug);

  if (!method) {
    notFound();
  }

  const relatedChallenges = await getRelatedChallenges(method.category);

  // Parse steps - handle both array of objects and array of strings
  const steps = Array.isArray(method.steps)
    ? method.steps.map((step: string | { title?: string; description?: string }) =>
        typeof step === 'string'
          ? step
          : `${step.title}: ${step.description}`
      )
    : [];

  return (
    <div className="container py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Icon icon="carbon:chevron-right" className="h-4 w-4" />
        <Link href="/methods" className="hover:text-foreground transition-colors">
          Methods
        </Link>
        <Icon icon="carbon:chevron-right" className="h-4 w-4" />
        <span className="text-foreground">{method.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon icon="carbon:catalog" className="h-8 w-8 text-primary" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">{method.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{method.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{method.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          {method.duration_range && (
            <Badge variant="outline" className="text-sm py-1 px-3">
              <Icon icon="carbon:time" className="h-4 w-4 mr-1" />
              {method.duration_range}
            </Badge>
          )}
          {method.group_size_range && (
            <Badge variant="outline" className="text-sm py-1 px-3">
              <Icon icon="carbon:group" className="h-4 w-4 mr-1" />
              {method.group_size_range}
            </Badge>
          )}
          {method.difficulty && (
            <Badge className={`${difficultyColors[method.difficulty]} text-sm py-1 px-3`}>
              {method.difficulty.charAt(0).toUpperCase() + method.difficulty.slice(1)}
            </Badge>
          )}
          {method.keywords && method.keywords.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* When to Use */}
          {method.when_to_use && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:calendar" className="h-5 w-5" />
                  When to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{method.when_to_use}</p>
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          {method.how_it_works && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:flow" className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{method.how_it_works}</p>
              </CardContent>
            </Card>
          )}

          {/* Step by Step */}
          {steps.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:list-numbered" className="h-5 w-5 text-primary" />
                  Step-by-Step Instructions
                </CardTitle>
                <CardDescription>
                  Follow these steps to facilitate this method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                        {i + 1}
                      </span>
                      <p className="pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {method.tips && method.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:idea" className="h-5 w-5" />
                  Facilitator Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {method.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:checkmark-filled" className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Variations */}
          {method.variations && method.variations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:transform-01" className="h-5 w-5" />
                  Variations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {method.variations.map((variation, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:arrow-right" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{variation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Source */}
          {method.attribution && (
            <div className="text-sm text-muted-foreground">
              <Icon icon="carbon:book" className="inline h-4 w-4 mr-1" />
              Source: {method.attribution}
              {method.source_url && (
                <a href={method.source_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">
                  Learn more
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Use This Method</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Metodic can build a complete session using this method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <a
                  href={`https://metodic.io?method=${method.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:rocket" className="mr-2 h-4 w-4" />
                  Build a Session
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Related Challenges */}
          {relatedChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Solves These Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedChallenges.map((challenge) => (
                  <Link
                    key={challenge.slug}
                    href={`/challenges/${challenge.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon icon="carbon:warning-alt" className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{challenge.title}</span>
                    <Icon icon="carbon:arrow-right" className="h-3 w-3 ml-auto text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share This Method</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=How to use ${encodeURIComponent(method.name)} for better meetings&url=${encodeURIComponent(`https://metodic.education/methods/${method.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:logo-x" className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://metodic.education/methods/${method.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:logo-linkedin" className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
