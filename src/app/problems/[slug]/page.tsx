import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This would come from Supabase in production
// For now, using static data that matches your DB structure
const problems: Record<string, {
  title: string;
  slug: string;
  description: string;
  symptoms: string[];
  causes: string[];
  panic_script: string;
  related_methods: { name: string; slug: string }[];
  related_recipes: { title: string; slug: string; duration: number }[];
}> = {
  'silent-meetings': {
    title: 'Silent Meetings',
    slug: 'silent-meetings',
    description: 'Your team sits quietly while you desperately try to spark discussion. The same 2-3 people speak while everyone else checks their phones.',
    symptoms: [
      'Only a few people ever contribute',
      'Awkward silences after questions',
      'People seem checked out or distracted',
      'Decisions feel imposed, not collaborative',
      'You hear feedback after the meeting, not during',
    ],
    causes: [
      'Psychological safety issues - people fear judgment',
      'Dominant voices intimidate quieter team members',
      'No clear invitation to participate',
      'Questions are too broad or abstract',
      'Remote meetings amplify existing dynamics',
    ],
    panic_script: `**Right now, try this:**

1. **Pause and acknowledge it**: "I notice we're pretty quiet. That's okay - let me try something different."

2. **Use silent brainstorming**: "Take 2 minutes to write down your thoughts on sticky notes (or in chat). No need to share out loud yet."

3. **Round-robin with permission to pass**: "Let's go around. Share one thought, or say 'pass' - both are fine."

4. **Smaller groups**: "Break into pairs for 3 minutes, then we'll reconvene."

**After the meeting**: Consider if your meeting actually needs to be a meeting, or if async input would work better.`,
    related_methods: [
      { name: '1-2-4-All', slug: '1-2-4-all' },
      { name: 'Brainwriting', slug: 'brainwriting' },
      { name: 'Round Robin', slug: 'round-robin' },
      { name: 'Think-Pair-Share', slug: 'think-pair-share' },
    ],
    related_recipes: [
      { title: 'Inclusive Brainstorm Session', slug: 'inclusive-brainstorm', duration: 60 },
      { title: 'Team Feedback Workshop', slug: 'team-feedback', duration: 90 },
    ],
  },
  'decision-deadlock': {
    title: 'Decision Deadlock',
    slug: 'decision-deadlock',
    description: 'Your team keeps discussing the same issue without reaching a decision. Meetings end with "let\'s think about it more" and nothing changes.',
    symptoms: [
      'The same topics come up meeting after meeting',
      'Analysis paralysis - endless data requests',
      'Decisions get made but then reopened',
      'Nobody wants to make the final call',
      'Stakeholders keep adding new considerations',
    ],
    causes: [
      'Unclear decision rights (who actually decides?)',
      'Fear of making the wrong choice',
      'Lack of clear criteria for the decision',
      'Hidden disagreements that never surface',
      'Consensus culture without clear process',
    ],
    panic_script: `**Right now, try this:**

1. **Name what you're deciding**: "Let me make sure we're aligned - we're deciding [X], correct?"

2. **Clarify the decision maker**: "Who is making this decision? Is it consensus, majority, or does someone have final call?"

3. **Set a constraint**: "We have 15 minutes to decide. If we can't, we'll go with [default option]."

4. **Make it reversible**: "Let's decide for now, try it for 2 weeks, and revisit if needed."

5. **Separate concerns**: "What would need to be true for you to be okay with this decision?"

**After the meeting**: Document who decided, what was decided, and when it can be revisited.`,
    related_methods: [
      { name: 'Gradients of Agreement', slug: 'gradients-of-agreement' },
      { name: 'Fist of Five', slug: 'fist-of-five' },
      { name: 'Decision Matrix', slug: 'decision-matrix' },
      { name: 'RAPID', slug: 'rapid' },
    ],
    related_recipes: [
      { title: 'Decision-Making Workshop', slug: 'decision-making', duration: 90 },
      { title: 'Prioritization Session', slug: 'prioritization', duration: 120 },
    ],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const problem = problems[slug];

  if (!problem) {
    return {
      title: 'Problem Not Found',
    };
  }

  return {
    title: `${problem.title} - How to Fix It`,
    description: problem.description,
    openGraph: {
      title: `${problem.title} - How to Fix It | metodic.education`,
      description: problem.description,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(problems).map((slug) => ({ slug }));
}

export default async function ProblemPage({ params }: Props) {
  const { slug } = await params;
  const problem = problems[slug];

  if (!problem) {
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
        <Link href="/problems" className="hover:text-foreground transition-colors">
          Problems
        </Link>
        <Icon icon="carbon:chevron-right" className="h-4 w-4" />
        <span className="text-foreground">{problem.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-lg bg-destructive/10">
            <Icon icon="carbon:warning-alt" className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{problem.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{problem.description}</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Panic Script - The Copy-Paste Solution */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:lightning" className="h-5 w-5 text-primary" />
                What to Do Right Now
              </CardTitle>
              <CardDescription>
                Copy-paste script for when you&apos;re in the middle of a meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {problem.panic_script.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={i} className="font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <p key={i} className="ml-4 mb-2">{line}</p>;
                  }
                  return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:stethoscope" className="h-5 w-5" />
                How to Recognize This Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {problem.symptoms.map((symptom, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon icon="carbon:checkmark-filled" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Root Causes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:tree-view" className="h-5 w-5" />
                Why This Happens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {problem.causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon icon="carbon:circle-dash" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Methods to Try */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="carbon:tools" className="h-5 w-5" />
                Methods That Help
              </CardTitle>
              <CardDescription>
                Proven facilitation techniques for this problem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {problem.related_methods.map((method) => (
                  <Link
                    key={method.slug}
                    href={`/methods/${method.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Icon icon="carbon:catalog" className="h-5 w-5 text-primary" />
                    <span className="font-medium">{method.name}</span>
                    <Icon icon="carbon:arrow-right" className="h-4 w-4 ml-auto text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Want a Complete Solution?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Metodic builds full session agendas based on your problem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <a
                  href={`https://metodic.io/recipes?problem=${problem.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:rocket" className="mr-2 h-4 w-4" />
                  Build a Session
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Related Recipes */}
          {problem.related_recipes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Session Recipes</CardTitle>
                <CardDescription>
                  Pre-built sessions that solve this problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {problem.related_recipes.map((recipe) => (
                  <a
                    key={recipe.slug}
                    href={`https://metodic.io/recipes/${recipe.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium mb-1">{recipe.title}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon icon="carbon:time" className="h-4 w-4" />
                      <span>{recipe.duration} min</span>
                      <Icon icon="carbon:arrow-up-right" className="h-3 w-3 ml-auto" />
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share This</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=How to fix ${encodeURIComponent(problem.title)} in your meetings&url=${encodeURIComponent(`https://metodic.education/problems/${problem.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:logo-x" className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://metodic.education/problems/${problem.slug}`)}`}
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
