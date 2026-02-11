import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Framework data - would come from Supabase in production
const frameworks: Record<string, {
  name: string;
  slug: string;
  description: string;
  origin: string;
  when_to_use: string;
  how_it_works: string;
  duration: string;
  group_size: string;
  steps: { title: string; description: string }[];
  principles: string[];
  benefits: string[];
  pitfalls: string[];
  related_challenges: { title: string; slug: string }[];
  related_methods: { name: string; slug: string }[];
}> = {
  'consent-based-decision': {
    name: 'Consent-Based Decision Making',
    slug: 'consent-based-decision',
    description: 'A governance method where decisions move forward when no team member has a reasoned, paramount objection. Unlike consensus (everyone agrees), consent asks "Can you live with this decision?"',
    origin: 'Developed in Sociocracy, refined by Holacracy and other self-management frameworks.',
    when_to_use: 'Use when you need team buy-in but consensus takes too long. Perfect for policies, role definitions, and decisions that affect everyone.',
    how_it_works: 'A proposal is presented, clarifying questions are asked, reactions are heard, and the proposal is amended if needed. Then each person is asked if they have any paramount objections. An objection must be reasoned - it\'s about what\'s safe to try, not preferences.',
    duration: '15-30 min',
    group_size: '3-15 people',
    steps: [
      { title: 'Present Proposal', description: 'The proposer presents the idea clearly and concisely. No discussion yet.' },
      { title: 'Clarifying Questions', description: 'Anyone can ask questions to understand the proposal. This is not the time for reactions or opinions.' },
      { title: 'Reactions Round', description: 'Each person shares their reaction - what they like, concerns, suggestions. The proposer listens without responding.' },
      { title: 'Amend Proposal', description: 'Based on reactions, the proposer can amend the proposal. This is optional.' },
      { title: 'Objection Round', description: 'Ask each person: "Do you have a paramount objection?" Objections must be reasoned - about harm to the team, not preferences.' },
      { title: 'Integration', description: 'If there are objections, work together to integrate them into an amended proposal. Then check for objections again.' },
    ],
    principles: [
      'Good enough for now, safe enough to try',
      'Objections are gifts - they make proposals better',
      'Silence means consent',
      'Anyone can make a proposal',
      'Focus on "workable", not "perfect"',
    ],
    benefits: [
      'Much faster than consensus',
      'Everyone has equal voice through the objection mechanism',
      'Prevents both tyranny of the majority and minority veto',
      'Decisions can be revisited if they don\'t work',
      'Builds shared ownership of decisions',
    ],
    pitfalls: [
      'People confusing preferences with objections',
      'Skipping the clarifying questions round',
      'The proposer defending instead of listening during reactions',
      'Not having clear criteria for what counts as an objection',
    ],
    related_challenges: [
      { title: 'Decision Deadlock', slug: 'decision-deadlock' },
      { title: 'Consensus Trap', slug: 'consensus-trap' },
      { title: 'HiPPO Effect', slug: 'hippo-effect' },
    ],
    related_methods: [
      { name: 'Fist of Five', slug: 'fist-of-five' },
      { name: 'Gradients of Agreement', slug: 'gradients-of-agreement' },
      { name: 'Round Robin', slug: 'round-robin' },
    ],
  },
  'sailboat-retrospective': {
    name: 'Sailboat Retrospective',
    slug: 'sailboat-retrospective',
    description: 'A visual retrospective format using a sailing metaphor. The team maps what pushes them forward (wind), holds them back (anchors), threatens them (rocks), and where they want to go (island).',
    origin: 'Popular in Agile teams, evolved from various visual retrospective formats.',
    when_to_use: 'Use for sprint retrospectives, project reviews, or any team reflection. Especially effective with visual thinkers and teams tired of the same old retro format.',
    how_it_works: 'Draw a sailboat on the water with an island ahead and rocks beneath. Team members add sticky notes to represent winds (positive forces), anchors (negative forces), rocks (risks), and the island (goals). Discuss patterns and create action items.',
    duration: '45-60 min',
    group_size: '3-12 people',
    steps: [
      { title: 'Set the Scene', description: 'Draw the sailboat visual: boat, water, island in the distance, and rocks below the surface. Explain each element.' },
      { title: 'Silent Brainstorm', description: '5-7 minutes: Everyone writes sticky notes for each category (wind, anchors, rocks, island).' },
      { title: 'Share and Cluster', description: 'Take turns placing notes on the board. Group similar items together. Read them aloud as you place them.' },
      { title: 'Discuss Patterns', description: 'What themes emerge? Which anchors are biggest? Which rocks are most dangerous? What winds can we amplify?' },
      { title: 'Create Actions', description: 'For the top 2-3 issues, create specific action items with owners and due dates.' },
      { title: 'Check Out', description: 'Each person shares one word for how they feel about the session or the path ahead.' },
    ],
    principles: [
      'The island represents shared vision - where we want to go',
      'Winds and anchors coexist - acknowledge both',
      'Rocks are hidden dangers we need to surface',
      'Focus on what we can control',
      'Actions should be specific and owned',
    ],
    benefits: [
      'Visual format engages different thinking styles',
      'Metaphor makes abstract concepts concrete',
      'Balances positive and negative reflection',
      'Surfaces risks that might otherwise stay hidden',
      'Fun and memorable - teams actually enjoy it',
    ],
    pitfalls: [
      'Spending too long on the visual setup',
      'Not timeboxing the discussion phase',
      'Creating too many action items (pick top 2-3)',
      'Anchors becoming a venting session without action focus',
    ],
    related_challenges: [
      { title: 'Low Energy', slug: 'low-energy' },
      { title: 'Team Misalignment', slug: 'team-misalignment' },
      { title: 'No Follow-Through', slug: 'no-follow-through' },
    ],
    related_methods: [
      { name: 'Start-Stop-Continue', slug: 'start-stop-continue' },
      { name: '4Ls Retrospective', slug: 'four-ls' },
      { name: 'Dot Voting', slug: 'dot-voting' },
    ],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const framework = frameworks[slug];

  if (!framework) {
    return { title: 'Framework Not Found' };
  }

  return {
    title: `${framework.name} - Meeting Framework`,
    description: framework.description,
    openGraph: {
      title: `${framework.name} - How to Use | METODIC learn`,
      description: framework.description,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(frameworks).map((slug) => ({ slug }));
}

export default async function FrameworkPage({ params }: Props) {
  const { slug } = await params;
  const framework = frameworks[slug];

  if (!framework) {
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
        <Link href="/frameworks" className="hover:text-foreground transition-colors">
          Frameworks
        </Link>
        <Icon icon="carbon:chevron-right" className="h-4 w-4" />
        <span className="text-foreground">{framework.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon icon="carbon:flow" className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{framework.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{framework.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Icon icon="carbon:time" className="h-4 w-4 mr-1" />
            {framework.duration}
          </Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Icon icon="carbon:group" className="h-4 w-4 mr-1" />
            {framework.group_size}
          </Badge>
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
                When to Use This Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{framework.when_to_use}</p>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:information" className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{framework.how_it_works}</p>
            </CardContent>
          </Card>

          {/* Step by Step */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:list-numbered" className="h-5 w-5 text-primary" />
                Step-by-Step Process
              </CardTitle>
              <CardDescription>
                Follow these steps to facilitate this framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6">
                {framework.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-medium mb-1">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Key Principles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:bookmark" className="h-5 w-5" />
                Key Principles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {framework.principles.map((principle, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon icon="carbon:checkmark-filled" className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Benefits & Pitfalls */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Icon icon="carbon:thumbs-up" className="h-5 w-5" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {framework.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Icon icon="carbon:add" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Icon icon="carbon:warning" className="h-5 w-5" />
                  Common Pitfalls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {framework.pitfalls.map((pitfall, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Icon icon="carbon:close" className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Origin */}
          <div className="text-sm text-muted-foreground">
            <Icon icon="carbon:book" className="inline h-4 w-4 mr-1" />
            Origin: {framework.origin}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Use This Framework</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Metodic can build a complete session using this framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <a
                  href={`https://metodic.io?framework=${framework.slug}`}
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
          {framework.related_challenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Solves These Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {framework.related_challenges.map((challenge) => (
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

          {/* Related Methods */}
          {framework.related_methods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Methods Used</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {framework.related_methods.map((method) => (
                  <Link
                    key={method.slug}
                    href={`/methods/${method.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon icon="carbon:catalog" className="h-4 w-4 text-primary" />
                    <span className="text-sm">{method.name}</span>
                    <Icon icon="carbon:arrow-right" className="h-3 w-3 ml-auto text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share This Framework</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=Learn how to use ${encodeURIComponent(framework.name)} for better meetings&url=${encodeURIComponent(`https://metodic.education/frameworks/${framework.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:logo-x" className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://metodic.education/frameworks/${framework.slug}`)}`}
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
