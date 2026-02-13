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

  // Replace **text** with bold and clean up common quote artifacts
  const parts: React.ReactNode[] = [];
  let remaining = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\*\*/g, '')
    .trim();
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

interface ParsedScriptBlock {
  heading?: string;
  paragraph?: string;
  steps?: Array<{ number: string; title: string; description: string }>;
}

interface RenderScriptBlock extends ParsedScriptBlock {
  isAfterMeeting: boolean;
}

function parsePanicScript(script: string): ParsedScriptBlock[] {
  if (!script) return [];

  const normalized = script
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    // Force section split if "After the meeting" appears inline
    .replace(/\s+(?:\*\*)?\s*(After the meeting\s*:?\s*)(?:\*\*)?/gi, '\n\n$1')
    .trim();

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const parsed: ParsedScriptBlock[] = [];

  for (const block of rawBlocks) {
    const afterMeetingPrefixMatch = block.match(
      /^(?:\*\*)?\s*after the meeting\s*:?\s*(?:\*\*)?\s*([\s\S]*)$/i
    );
    const forcedHeading = afterMeetingPrefixMatch ? 'After the meeting' : undefined;
    const blockBody = afterMeetingPrefixMatch ? afterMeetingPrefixMatch[1].trim() : block;

    // Handle bullet lists quickly
    if (blockBody.startsWith('* ') || blockBody.includes(' * ')) {
      const bullets = blockBody
        .replace(/^\*\s*/, '')
        .split(/\n\*\s*|\s\*\s+/)
        .map((line) => line.replace(/^\*\s*/, '').trim())
        .filter(Boolean);

      if (forcedHeading) {
        parsed.push({
          heading: forcedHeading,
          steps: bullets.map((bullet, idx) => ({
            number: String(idx + 1),
            title: 'Action',
            description: bullet,
          })),
        });
      } else {
        bullets.forEach((bullet) => parsed.push({ paragraph: `• ${bullet}` }));
      }
      continue;
    }

    // Handle "Section Name: 1. ... 2. ..." including markdown variants like
    // "**After the meeting:** 1. ... 2. ..."
    const inlineSectionMatch = blockBody.match(
      /^(?:\*\*)?\s*([^:\n*][^:\n]{1,100}?)(?::)?(?:\*\*)?\s*:\s*(\d+[\s\S]*)$/
    );
    const sectionHeading = forcedHeading || inlineSectionMatch?.[1]?.replace(/\*\*/g, '').trim();
    const listSource = inlineSectionMatch ? inlineSectionMatch[2] : blockBody;

    // Extract numbered steps even if they are on one line
    const stepMatches = Array.from(
      listSource.matchAll(/(\d+)\.\s*([\s\S]*?)(?=(?:\s+\d+\.\s)|$)/g)
    );

    if (stepMatches.length > 0) {
      const steps = stepMatches
        .map((m) => {
          const number = m[1];
          const rawContent = m[2].trim();
          const titleMatch = rawContent.match(/^([^:]{2,90}):\s*([\s\S]*)$/);
          return {
            number,
            title: titleMatch ? titleMatch[1].trim() : 'Action',
            description: titleMatch ? titleMatch[2].trim() : rawContent,
          };
        })
        .filter((s) => s.description || s.title);

      parsed.push({
        heading: sectionHeading,
        steps,
      });
      continue;
    }

    // Handle simple heading-only line like "**After the meeting:**"
    if (blockBody.startsWith('**') && blockBody.includes(':**')) {
      parsed.push({ heading: blockBody.replace(/\*\*/g, '').replace(/:$/, '') });
      continue;
    }

    parsed.push({ heading: forcedHeading, paragraph: forcedHeading ? blockBody : block });
  }

  return parsed;
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
  const parsedScriptBlocks = challenge.panic_script
    ? parsePanicScript(challenge.panic_script)
    : [];
  const renderScriptBlocks: RenderScriptBlock[] = parsedScriptBlocks
    .map((block, i, arr) => {
      const markerText = `${block.heading || ''} ${block.paragraph || ''}`.toLowerCase();
      const explicitAfterMeeting = markerText.includes('after the meeting');
      const previousBlock = i > 0 ? arr[i - 1] : undefined;
      const firstStepNumber = block.steps?.[0]?.number;
      const previousLastStepNumber = previousBlock?.steps?.[previousBlock.steps.length - 1]?.number;
      const implicitAfterMeeting =
        !explicitAfterMeeting &&
        !block.heading &&
        Boolean(block.steps?.length) &&
        firstStepNumber === '1' &&
        Boolean(previousBlock?.steps?.length) &&
        previousLastStepNumber !== '1';

      return {
        ...block,
        isAfterMeeting: explicitAfterMeeting || implicitAfterMeeting,
      };
    })
    .reduce<RenderScriptBlock[]>((acc, block) => {
      const previous = acc[acc.length - 1];
      if (previous && previous.isAfterMeeting && block.isAfterMeeting) {
        // Merge consecutive "After the meeting" blocks into one section
        acc[acc.length - 1] = {
          ...previous,
          heading: 'After the meeting',
          paragraph: [previous.paragraph, block.paragraph].filter(Boolean).join('\n\n') || undefined,
          steps: [...(previous.steps || []), ...(block.steps || [])],
          isAfterMeeting: true,
        };
        return acc;
      }
      acc.push(block);
      return acc;
    }, []);

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
            {challenge.solution_count > 0 && (
              <div className="mt-4">
                <Badge variant="outline" className="text-sm">
                  <Icon icon="carbon:list" className="h-4 w-4 mr-1" />
                  {challenge.solution_count} ready-to-use solutions in this guide
                </Badge>
              </div>
            )}
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
                  Copy-paste actions for when you&apos;re in the middle of a meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {renderScriptBlocks.map((block, i) => {
                    if (block.steps && block.steps.length > 0) {
                      return (
                        <div
                          key={i}
                          className={`space-y-3 rounded-xl p-3 ${
                            block.isAfterMeeting
                              ? 'border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20'
                              : ''
                          }`}
                        >
                          {block.isAfterMeeting && (
                            <Badge variant="outline" className="mb-1 w-fit border-amber-400/60 text-amber-700 dark:text-amber-300">
                              After the meeting
                            </Badge>
                          )}
                          {block.heading && block.heading.toLowerCase() !== 'after the meeting' && (
                            <h4 className="font-semibold text-base">{block.heading}</h4>
                          )}
                          {block.steps.map((step, j) => (
                            <div key={`${i}-${j}`} className="flex gap-3 rounded-lg border border-primary/20 bg-background/60 p-3">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center text-sm">
                                {step.number}
                              </span>
                              <div className="space-y-1">
                                <p className="font-medium">{renderInlineMarkdown(step.title)}</p>
                                <p className="text-muted-foreground">{renderInlineMarkdown(step.description)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    if (block.heading) {
                      return (
                        <div
                          key={i}
                          className={`rounded-lg p-2 ${block.isAfterMeeting ? 'border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20' : ''}`}
                        >
                          {block.isAfterMeeting && (
                            <Badge variant="outline" className="mb-1 w-fit border-amber-400/60 text-amber-700 dark:text-amber-300">
                              After the meeting
                            </Badge>
                          )}
                          {block.heading.toLowerCase() !== 'after the meeting' && (
                            <h4 className="font-semibold text-base mt-2 first:mt-0">{block.heading}</h4>
                          )}
                        </div>
                      );
                    }

                    if (block.paragraph) {
                      return (
                        <p key={i} className="text-muted-foreground leading-relaxed">
                          {renderInlineMarkdown(block.paragraph)}
                        </p>
                      );
                    }

                    return null;
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
