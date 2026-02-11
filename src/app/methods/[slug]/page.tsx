import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample methods data - would come from Supabase
const methods: Record<string, {
  name: string;
  slug: string;
  description: string;
  when_to_use: string;
  how_it_works: string;
  duration_range: string;
  group_size_range: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  steps: string[];
  tips: string[];
  variations: string[];
  related_problems: { title: string; slug: string }[];
  source?: string;
}> = {
  '1-2-4-all': {
    name: '1-2-4-All',
    slug: '1-2-4-all',
    description: 'A structured method to engage everyone by gradually building from individual reflection to full group discussion.',
    when_to_use: 'When you need to hear from everyone, not just the loudest voices. Perfect for generating ideas, gathering feedback, or building consensus.',
    how_it_works: 'Participants first think individually (1), then discuss in pairs (2), then in groups of four (4), before sharing with the whole group (All). This structure ensures everyone contributes.',
    duration_range: '12-20 minutes',
    group_size_range: '4-100+ people',
    difficulty: 'easy',
    tags: ['participation', 'ideation', 'engagement', 'liberating structures'],
    steps: [
      'Present the question or topic to the group',
      '1 minute: Silent self-reflection (everyone writes their thoughts)',
      '2 minutes: Share in pairs, build on each other\'s ideas',
      '4 minutes: Pairs join to form groups of 4, discuss patterns and insights',
      '5 minutes: Each group shares one key insight with everyone',
    ],
    tips: [
      'Keep time strictly - use a visible timer',
      'The question should be open-ended, not yes/no',
      'Encourage building on ideas, not just sharing',
      'In the "All" phase, ask for what emerged, not a report of everything said',
    ],
    variations: [
      '1-2-All: Skip the groups of 4 for faster rounds',
      '1-4-All: Skip pairs, go straight to groups of 4',
      'Written 1-2-4-All: Use sticky notes throughout for visual synthesis',
    ],
    related_problems: [
      { title: 'Silent Meetings', slug: 'silent-meetings' },
      { title: 'Dominant Voices', slug: 'dominant-voices' },
    ],
    source: 'Liberating Structures by Henri Lipmanowicz and Keith McCandless',
  },
  'brainwriting': {
    name: 'Brainwriting',
    slug: 'brainwriting',
    description: 'Silent idea generation where participants write ideas on paper and pass them around for others to build upon.',
    when_to_use: 'When brainstorming sessions are dominated by a few voices, or when you need to generate many ideas quickly. Also works well for introverts or remote teams.',
    how_it_works: 'Each person writes ideas on a sheet, then passes it to the next person who adds to or builds on those ideas. This continues until sheets return to their origin.',
    duration_range: '10-20 minutes',
    group_size_range: '4-20 people',
    difficulty: 'easy',
    tags: ['ideation', 'brainstorming', 'silent', 'written'],
    steps: [
      'Give each participant a sheet with the prompt at the top',
      '3 minutes: Everyone writes 3 ideas silently',
      'Pass sheets to the left',
      '3 minutes: Read the existing ideas, add 3 new or build on existing',
      'Repeat passing 3-4 times',
      'Review all sheets together, cluster similar ideas',
    ],
    tips: [
      'Encourage building on others\' ideas, not just adding new ones',
      'Use numbered rows to track rounds',
      'Works great with digital collaboration tools (Miro, FigJam)',
      'Keep prompt visible throughout',
    ],
    variations: [
      '6-3-5 Method: 6 people, 3 ideas per round, 5 minutes per round',
      'Brain-netting: Online version using shared documents',
      'Gallery Walk: Post sheets on walls, people walk and add',
    ],
    related_problems: [
      { title: 'Silent Meetings', slug: 'silent-meetings' },
      { title: 'Low Energy', slug: 'low-energy' },
    ],
    source: 'Developed by Bernd Rohrbach in 1969',
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const method = methods[slug];

  if (!method) {
    return { title: 'Method Not Found' };
  }

  return {
    title: `${method.name} - Facilitation Method`,
    description: method.description,
    openGraph: {
      title: `${method.name} - How to Facilitate | metodic.education`,
      description: method.description,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(methods).map((slug) => ({ slug }));
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export default async function MethodPage({ params }: Props) {
  const { slug } = await params;
  const method = methods[slug];

  if (!method) {
    notFound();
  }

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
            <h1 className="text-4xl font-bold tracking-tight mb-2">{method.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{method.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Icon icon="carbon:time" className="h-4 w-4 mr-1" />
            {method.duration_range}
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Icon icon="carbon:group" className="h-4 w-4 mr-1" />
            {method.group_size_range}
          </Badge>
          <Badge className={`${difficultyColors[method.difficulty]} text-sm py-1 px-3`}>
            {method.difficulty.charAt(0).toUpperCase() + method.difficulty.slice(1)}
          </Badge>
          {method.tags.map((tag) => (
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

          {/* How It Works */}
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

          {/* Step by Step */}
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
                {method.steps.map((step, i) => (
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

          {/* Tips */}
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

          {/* Variations */}
          {method.variations.length > 0 && (
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
          {method.source && (
            <div className="text-sm text-muted-foreground">
              <Icon icon="carbon:book" className="inline h-4 w-4 mr-1" />
              Source: {method.source}
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

          {/* Related Problems */}
          {method.related_problems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Solves These Problems</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {method.related_problems.map((problem) => (
                  <Link
                    key={problem.slug}
                    href={`/problems/${problem.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon icon="carbon:warning-alt" className="h-4 w-4 text-destructive" />
                    <span className="text-sm">{problem.title}</span>
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
