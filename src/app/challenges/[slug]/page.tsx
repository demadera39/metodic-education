import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

// Helper to render inline markdown (bold, italic, quotes)
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Replace **text** with bold, *text* with italic, and clean up quotes
  const parts: React.ReactNode[] = [];
  let remaining = text.replace(/"/g, '"').replace(/"/g, '"').replace(/'/g, "'").replace(/'/g, "'");
  let key = 0;

  // Process bold (**text**)
  while (remaining.includes('**')) {
    const startIdx = remaining.indexOf('**');
    const endIdx = remaining.indexOf('**', startIdx + 2);

    if (endIdx === -1) break;

    // Add text before bold
    if (startIdx > 0) {
      parts.push(remaining.substring(0, startIdx));
    }

    // Add bold text
    const boldText = remaining.substring(startIdx + 2, endIdx);
    parts.push(<strong key={key++}>{boldText}</strong>);

    remaining = remaining.substring(endIdx + 2);
  }

  // Add any remaining text
  if (remaining) {
    parts.push(remaining);
  }

  return parts.length > 0 ? parts : text;
}

interface Challenge {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  symptoms: string[];
  causes: string[];
  panic_script: string | null;
  keywords: string[];
  solution_count: number;
  is_published: boolean;
}

interface Method {
  id: string;
  slug: string;
  name: string;
}

type Props = {
  params: Promise<{ slug: string }>;
};

async function getChallenge(slug: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('education_challenges')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Challenge;
}

async function getRelatedMethods(category: string): Promise<Method[]> {
  // Get methods that might be related based on category mapping
  const categoryMethodMap: Record<string, string[]> = {
    participation: ['engagement', 'energizer'],
    decision: ['decision'],
    alignment: ['alignment'],
    collaboration: ['engagement', 'ideation'],
    efficiency: ['decision', 'alignment'],
    innovation: ['ideation', 'problem-solving'],
  };

  const methodCategories = categoryMethodMap[category] || ['engagement'];

  const { data, error } = await supabase
    .from('education_methods')
    .select('id, slug, name')
    .in('category', methodCategories)
    .eq('is_published', true)
    .limit(4);

  if (error || !data) {
    return [];
  }

  return data as Method[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getChallenge(slug);

  if (!challenge) {
    return {
      title: 'Challenge Not Found | METODIC learn',
    };
  }

  return {
    title: `${challenge.title} - How to Address It | METODIC learn`,
    description: challenge.description || `Learn how to address ${challenge.title} in your meetings and workshops.`,
    openGraph: {
      title: `${challenge.title} - How to Address It | METODIC learn`,
      description: challenge.description || `Learn how to address ${challenge.title} in your meetings and workshops.`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('education_challenges')
    .select('slug')
    .eq('is_published', true);

  return (data || []).map((challenge) => ({ slug: challenge.slug }));
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const challenge = await getChallenge(slug);

  if (!challenge) {
    notFound();
  }

  const relatedMethods = await getRelatedMethods(challenge.category);

  return (
    <div className="container py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Icon icon="carbon:chevron-right" className="h-4 w-4" />
        <Link href="/challenges" className="hover:text-foreground transition-colors">
          Challenges
        </Link>
        <Icon icon="carbon:chevron-right" className="h-4 w-4" />
        <span className="text-foreground">{challenge.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-lg bg-orange-500/10">
            <Icon icon="carbon:warning-alt" className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">{challenge.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{challenge.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{challenge.description}</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Panic Script - The Copy-Paste Solution */}
          {challenge.panic_script && (
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
                <div className="space-y-4">
                  {challenge.panic_script.split('\n\n').map((block, i) => {
                    // Check if it's a header (starts and ends with **)
                    if (block.startsWith('**') && block.includes(':**')) {
                      const headerText = block.replace(/\*\*/g, '');
                      return <h4 key={i} className="font-semibold text-base mt-4 first:mt-0">{headerText}</h4>;
                    }
                    // Check if it's a numbered list
                    if (block.match(/^\d+\./)) {
                      return (
                        <div key={i} className="space-y-3">
                          {block.split('\n').filter(line => line.trim()).map((line, j) => {
                            // Parse the line: "1. **Action:** Description" or "1. **Action**: Description"
                            const match = line.match(/^(\d+)\.\s*\*\*([^*]+)\*\*:?\s*(.*)$/);
                            if (match) {
                              const [, num, action, description] = match;
                              return (
                                <div key={j} className="flex gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center text-sm">
                                    {num}
                                  </span>
                                  <div>
                                    <span className="font-medium">{action.replace(/:$/, '')}:</span>{' '}
                                    <span className="text-muted-foreground">{renderInlineMarkdown(description)}</span>
                                  </div>
                                </div>
                              );
                            }
                            // Fallback: render line with markdown stripped
                            return <p key={j} className="ml-9 text-muted-foreground">{renderInlineMarkdown(line)}</p>;
                          })}
                        </div>
                      );
                    }
                    // Regular paragraph - render with inline markdown
                    return block.trim() ? <p key={i} className="text-muted-foreground">{renderInlineMarkdown(block)}</p> : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Symptoms */}
          {challenge.symptoms && challenge.symptoms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:stethoscope" className="h-5 w-5" />
                  How to Recognize This Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {challenge.symptoms.map((symptom, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:checkmark-filled" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Root Causes */}
          {challenge.causes && challenge.causes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:tree-view" className="h-5 w-5" />
                  Why This Happens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {challenge.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="carbon:circle-dash" className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Methods to Try */}
          {relatedMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon icon="carbon:tools" className="h-5 w-5" />
                  Methods That Help
                </CardTitle>
                <CardDescription>
                  Proven facilitation techniques for this challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedMethods.map((method) => (
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
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA Card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Want a Complete Solution?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Metodic builds full session agendas based on your challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <a
                  href={`https://metodic.io/recipes?challenge=${challenge.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:rocket" className="mr-2 h-4 w-4" />
                  Build a Session
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Keywords */}
          {challenge.keywords && challenge.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Topics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {challenge.keywords.map((keyword, i) => (
                  <Badge key={i} variant="outline">{keyword}</Badge>
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
                  href={`https://twitter.com/intent/tweet?text=How to address ${encodeURIComponent(challenge.title)} in your meetings&url=${encodeURIComponent(`https://metodic.education/challenges/${challenge.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon="carbon:logo-x" className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://metodic.education/challenges/${challenge.slug}`)}`}
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
