import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

// Phases can be either simple strings or objects with details
interface PhaseObject {
  name: string;
  description?: string;
  duration?: string;
  activities?: string[];
}

type Phase = string | PhaseObject;

// Helper to normalize phases to a consistent format
function normalizePhase(phase: Phase): { name: string; description?: string; duration?: string; activities?: string[] } {
  if (typeof phase === 'string') {
    return { name: phase };
  }
  return phase;
}

interface Framework {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  typical_duration: string | null;
  when_to_use: string | null;
  best_for: string[] | null;
  key_principles: string[] | null;
  considerations: string[] | null;
  phases: Phase[];
  attribution: string | null;
  source_url: string | null;
  integration: string | null;
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
}

type Props = {
  params: Promise<{ slug: string }>;
};

// Rich category content for contextual help
const categoryContent: Record<string, {
  challenge: string;
  icon: string;
  color: string;
  situation: string;
  benefit: string;
  tips: string[];
}> = {
  'Macro-Design': {
    challenge: 'When you need to design a complete learning experience from scratch',
    icon: 'carbon:chart-relationship',
    color: 'blue',
    situation: 'You\'re planning a workshop, training, or learning session and need a proven structure to organize your content and activities.',
    benefit: 'Ensures your session has clear goals, logical flow, and measurable outcomes.',
    tips: [
      'Start by defining what success looks like at the end',
      'Work backwards from outcomes to activities',
      'Build in checkpoints to verify learning',
      'Allow time for practice and application'
    ]
  },
  'Session Flow': {
    challenge: 'When your sessions feel disjointed or participants lose focus',
    icon: 'carbon:flow',
    color: 'green',
    situation: 'Your meetings or sessions need better pacing, clearer transitions, or more engaging sequences to keep participants engaged.',
    benefit: 'Creates natural rhythm and momentum that keeps energy high throughout.',
    tips: [
      'Vary the pace between high and low energy activities',
      'Use clear transitions between sections',
      'Build complexity gradually throughout',
      'End with actionable takeaways'
    ]
  },
  'Psychology': {
    challenge: 'When participants seem unmotivated or disengaged',
    icon: 'carbon:user-favorite',
    color: 'purple',
    situation: 'You need to understand what drives adult learners and how to create conditions for genuine engagement and retention.',
    benefit: 'Taps into intrinsic motivation so participants actually want to participate.',
    tips: [
      'Give participants autonomy over how they engage',
      'Connect content to their real challenges',
      'Build confidence through early wins',
      'Create psychological safety for sharing'
    ]
  },
  'Facilitation': {
    challenge: 'When a few voices dominate or quieter people don\'t contribute',
    icon: 'carbon:group',
    color: 'orange',
    situation: 'Your group discussions aren\'t balanced, you need better ways to include everyone, or conversations go in circles.',
    benefit: 'Ensures every voice is heard and the group\'s collective intelligence is unlocked.',
    tips: [
      'Use structured turn-taking to balance voices',
      'Start with individual reflection before group discussion',
      'Create safe spaces for minority opinions',
      'Summarize and synthesize regularly'
    ]
  },
  'Evaluation': {
    challenge: 'When you can\'t tell if your sessions are actually working',
    icon: 'carbon:analytics',
    color: 'teal',
    situation: 'You need to measure impact beyond satisfaction surveys and understand if learning is actually being applied.',
    benefit: 'Shows real ROI and helps you continuously improve your sessions.',
    tips: [
      'Define success metrics before the session',
      'Build in micro-assessments throughout',
      'Follow up after to measure behavior change',
      'Use data to iterate on your design'
    ]
  },
  'Constructivism': {
    challenge: 'When participants need to deeply understand, not just memorize',
    icon: 'carbon:build',
    color: 'indigo',
    situation: 'Your content requires participants to build new mental models and construct their own understanding through experience.',
    benefit: 'Creates lasting understanding that participants can apply in new situations.',
    tips: [
      'Let participants discover insights themselves',
      'Build on what they already know',
      'Use concrete experiences before abstract concepts',
      'Encourage questions and exploration'
    ]
  },
  'Social Learning': {
    challenge: 'When learning happens best through collaboration and community',
    icon: 'carbon:collaboration',
    color: 'pink',
    situation: 'Your team learns best from each other and you want to leverage peer knowledge and social dynamics for better outcomes.',
    benefit: 'Multiplies learning by tapping into the group\'s collective experience.',
    tips: [
      'Create opportunities for peer teaching',
      'Use small groups for deeper discussion',
      'Celebrate shared discoveries',
      'Build learning communities that last beyond sessions'
    ]
  },
  'Transformative': {
    challenge: 'When you need to shift mindsets, not just teach skills',
    icon: 'carbon:transform-binary',
    color: 'red',
    situation: 'Your goal is deep change in how participants see themselves or their work, not just surface-level skill building.',
    benefit: 'Creates genuine perspective shifts that change behavior long-term.',
    tips: [
      'Create safe disorienting experiences',
      'Allow time for deep reflection',
      'Support participants through discomfort',
      'Connect insights to action planning'
    ]
  },
  'Differentiation': {
    challenge: 'When your group has diverse learning styles and needs',
    icon: 'carbon:user-multiple',
    color: 'amber',
    situation: 'Participants have different backgrounds, preferences, and ways of processing information that a one-size-fits-all approach misses.',
    benefit: 'Reaches everyone by providing multiple pathways to understanding.',
    tips: [
      'Offer visual, auditory, and hands-on options',
      'Let participants choose their entry point',
      'Provide stretch challenges for advanced learners',
      'Support those who need more scaffolding'
    ]
  }
};

// Default content for unknown categories
const defaultCategoryContent = {
  challenge: 'When you need a proven structure for your session',
  icon: 'carbon:model-alt',
  color: 'gray',
  situation: 'You want to use research-backed approaches to make your sessions more effective.',
  benefit: 'Gives you a tested template to build from.',
  tips: [
    'Start with the phase that resonates most',
    'Adapt the framework to your specific context',
    'Don\'t try to use everything at once',
    'Iterate based on what works for your group'
  ]
};

async function getFramework(slug: string): Promise<Framework | null> {
  const { data, error } = await supabase
    .from('learning_frameworks')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Framework;
}

async function getRelatedFrameworks(category: string, currentSlug: string): Promise<Framework[]> {
  const { data, error } = await supabase
    .from('learning_frameworks')
    .select('id, slug, name, description, typical_duration, phases, category')
    .eq('category', category)
    .eq('is_active', true)
    .neq('slug', currentSlug)
    .limit(3);

  if (error || !data) {
    return [];
  }

  return data as Framework[];
}

async function getRelatedChallenges(category: string): Promise<Challenge[]> {
  // Map framework category to challenge category
  const categoryMapping: Record<string, string> = {
    'Macro-Design': 'alignment',
    'Session Flow': 'efficiency',
    'Psychology': 'participation',
    'Facilitation': 'participation',
    'Evaluation': 'efficiency',
    'Constructivism': 'innovation',
    'Social Learning': 'collaboration',
    'Transformative': 'alignment',
    'Differentiation': 'participation',
  };

  const challengeCategory = categoryMapping[category] || 'participation';

  const { data, error } = await supabase
    .from('education_challenges')
    .select('id, slug, title')
    .eq('category', challengeCategory)
    .eq('is_published', true)
    .limit(4);

  if (error || !data) {
    return [];
  }

  return data as Challenge[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const framework = await getFramework(slug);

  if (!framework) {
    return { title: 'Framework Not Found | METODIC learn' };
  }

  const content = categoryContent[framework.category] || defaultCategoryContent;

  return {
    title: `${framework.name} - ${framework.category} Framework | METODIC learn`,
    description: framework.description || `Use the ${framework.name} framework: ${content.challenge.toLowerCase()}.`,
    openGraph: {
      title: `${framework.name} - ${framework.category} Framework | METODIC learn`,
      description: framework.description || `Use the ${framework.name} framework: ${content.challenge.toLowerCase()}.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('learning_frameworks')
    .select('slug')
    .eq('is_active', true);

  return (data || []).map((framework) => ({ slug: framework.slug }));
}

export default async function FrameworkPage({ params }: Props) {
  const { slug } = await params;
  const framework = await getFramework(slug);

  if (!framework) {
    notFound();
  }

  const relatedFrameworks = await getRelatedFrameworks(framework.category, framework.slug);
  const relatedChallenges = await getRelatedChallenges(framework.category);
  const content = categoryContent[framework.category] || defaultCategoryContent;

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
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon icon={content.icon} className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">{framework.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{framework.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{framework.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3">
          {framework.phases && framework.phases.length > 0 && (
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <Icon icon="carbon:flow" className="h-4 w-4 mr-1.5" />
              {framework.phases.length} phases
            </Badge>
          )}
          <Badge variant="outline" className="text-sm py-1.5 px-3">
            <Icon icon={content.icon} className="h-4 w-4 mr-1.5" />
            {framework.category}
          </Badge>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* When to Use This - Always Show */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:help" className="h-5 w-5 text-primary" />
                When to Use This Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground font-medium">{content.challenge}</p>
              <p className="text-muted-foreground">{content.situation}</p>
              {framework.when_to_use && (
                <p className="text-muted-foreground">{framework.when_to_use}</p>
              )}
            </CardContent>
          </Card>

          {/* The Framework Steps - Always Show */}
          {framework.phases && framework.phases.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:list-numbered" className="h-5 w-5 text-primary" />
                  The {framework.phases.length} Steps
                </CardTitle>
                <CardDescription>
                  Follow this sequence to apply {framework.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {framework.phases.map((phase, index) => {
                    const normalizedPhase = normalizePhase(phase);
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className="font-semibold text-lg">{normalizedPhase.name}</h4>
                          {normalizedPhase.description && (
                            <p className="text-muted-foreground mt-1">{normalizedPhase.description}</p>
                          )}
                          {normalizedPhase.duration && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <Icon icon="carbon:time" className="h-3 w-3 mr-1" />
                              {normalizedPhase.duration}
                            </Badge>
                          )}
                          {normalizedPhase.activities && normalizedPhase.activities.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {normalizedPhase.activities.map((activity, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <Icon icon="carbon:checkmark" className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* What You'll Achieve */}
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Icon icon="carbon:checkmark-filled" className="h-5 w-5" />
                What You'll Achieve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{content.benefit}</p>
              {framework.integration && (
                <p className="text-muted-foreground mt-3">{framework.integration}</p>
              )}
            </CardContent>
          </Card>

          {/* Practical Tips - Always Show */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:lightbulb" className="h-5 w-5" />
                Practical Tips
              </CardTitle>
              <CardDescription>
                How to get the most out of this framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {content.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Best For - if available */}
          {framework.best_for && framework.best_for.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:target" className="h-5 w-5" />
                  Best For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {framework.best_for.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:checkmark-filled" className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key Principles - if available */}
          {framework.key_principles && framework.key_principles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:idea" className="h-5 w-5" />
                  Key Principles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {framework.key_principles.map((principle, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:idea" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Watch Out For - if available */}
          {framework.considerations && framework.considerations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:warning" className="h-5 w-5" />
                  Watch Out For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {framework.considerations.map((consideration, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:warning-alt" className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{consideration}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Related Frameworks */}
          {relatedFrameworks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:model-alt" className="h-5 w-5" />
                  Related Frameworks
                </CardTitle>
                <CardDescription>
                  Other {framework.category} frameworks you might find useful
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedFrameworks.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/frameworks/${related.slug}`}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/30 transition-all"
                    >
                      <Icon icon="carbon:model-alt" className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block">{related.name}</span>
                        {related.description && (
                          <span className="text-sm text-muted-foreground line-clamp-2 mt-1">{related.description}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Primary CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Build a Session With This</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Let Metodic create a complete session agenda using {framework.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full" size="lg">
                <a
                  href={`https://metodic.io?framework=${framework.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:rocket" className="mr-2 h-5 w-5" />
                  Create Session
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {framework.phases && framework.phases.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Steps at a Glance</p>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    {framework.phases.map((phase, i) => {
                      const normalizedPhase = normalizePhase(phase);
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted text-foreground text-xs flex items-center justify-center font-medium">
                            {i + 1}
                          </span>
                          <span>{normalizedPhase.name}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground">{framework.category}</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Challenges */}
          {relatedChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Challenges</CardTitle>
                <CardDescription>
                  Common problems this framework helps solve
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedChallenges.map((ch) => (
                  <Link
                    key={ch.slug}
                    href={`/challenges/${ch.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Icon icon="carbon:warning-alt" className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm flex-1">{ch.title}</span>
                    <Icon icon="carbon:arrow-right" className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Attribution */}
          {framework.attribution && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{framework.attribution}</p>
                {framework.source_url && (
                  <a
                    href={framework.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    Learn more
                    <Icon icon="carbon:launch" className="h-3 w-3" />
                  </a>
                )}
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
                  href={`https://twitter.com/intent/tweet?text=Check out the ${encodeURIComponent(framework.name)} framework for better meetings&url=${encodeURIComponent(`https://metodic.education/frameworks/${framework.slug}`)}`}
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
