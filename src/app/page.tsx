import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { EmailSignupCta } from '@/components/marketing/EmailSignupCta';

// Category icons mapping
const categoryIcons: Record<string, string> = {
  participation: 'carbon:user-speaker',
  decision: 'carbon:decision-tree',
  alignment: 'carbon:arrows-horizontal',
  collaboration: 'carbon:group',
  efficiency: 'carbon:time',
  innovation: 'carbon:idea',
  conflict: 'carbon:warning-alt',
  accountability: 'carbon:task',
  communication: 'carbon:chat',
  leadership: 'carbon:user-admin',
  remote: 'carbon:laptop',
  culture: 'carbon:group-presentation',
};

async function getFeaturedChallenges() {
  const { data } = await supabase
    .from('education_challenges')
    .select('slug, title, description, category, solution_count')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6);

  return data || [];
}

async function getPopularMethods() {
  // First try education_methods (editorial set)
  const { data: educationMethods, error: educationError } = await supabase
    .from('education_methods')
    .select('slug, name, category')
    .eq('is_published', true)
    .order('name')
    .limit(4);

  if (!educationError && educationMethods && educationMethods.length > 0) {
    return educationMethods;
  }

  // Fallback to curated_methods so homepage never appears empty
  const { data: curatedMethods } = await supabase
    .from('curated_methods')
    .select('slug, name, category')
    .eq('is_active', true)
    .order('name')
    .limit(4);

  return curatedMethods || [];
}

async function getFeaturedPlaybooks() {
  const { data } = await supabase
    .from('education_playbooks')
    .select('slug, title, summary, category, estimated_duration, sequence, generated_from')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(2);

  return (data || []).map((playbook) => ({
    ...playbook,
    step_count: Array.isArray(playbook.sequence) ? playbook.sequence.length : 0,
  }));
}

// Method category icons
const methodCategoryIcons: Record<string, string> = {
  engagement: 'carbon:group',
  decision: 'carbon:thumbs-up',
  ideation: 'carbon:idea',
  retrospective: 'carbon:review',
  alignment: 'carbon:arrows-horizontal',
  energizer: 'carbon:flash',
  'problem-solving': 'carbon:analytics',
};

export default async function HomePage() {
  const [featuredChallenges, popularMethods, featuredPlaybooks] = await Promise.all([
    getFeaturedChallenges(),
    getPopularMethods(),
    getFeaturedPlaybooks(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Free facilitation knowledge
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Run better meetings and sessions.
              <br />
              <span className="text-muted-foreground">Starting today.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find your challenge, copy a script, and lead your next meeting or session with confidence.
              No signup required.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/challenges">
                  <Icon icon="carbon:search" className="mr-2 h-5 w-5" />
                  Find Your Challenge
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/methods">
                  <Icon icon="carbon:catalog" className="mr-2 h-5 w-5" />
                  Browse Methods
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <Badge variant="outline">Start with challenges</Badge>
              <Badge variant="outline">Or browse methods</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="container py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Common Challenges</h2>
            <p className="text-muted-foreground">
              Click on your challenge to get a copy-paste solution
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/challenges" className="flex items-center gap-2">
              See all challenges
              <Icon icon="carbon:arrow-right" className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredChallenges.map((challenge) => (
            <Link key={challenge.slug} href={`/challenges/${challenge.slug}`}>
              <Card className="h-full hover:bg-muted/50 hover:border-foreground/20 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors flex-shrink-0">
                      <Icon
                        icon={categoryIcons[challenge.category] || 'carbon:help'}
                        className="h-5 w-5 text-orange-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between gap-2">
                        <span>{challenge.title}</span>
                        <Icon
                          icon="carbon:arrow-right"
                          className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                        />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {challenge.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.solution_count || 3} solutions
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Methods Quick Access */}
      <section className="bg-muted/30 border-y">
        <div className="container py-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Popular Methods</h2>
              <p className="text-muted-foreground">
                Tried-and-tested facilitation techniques
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/methods" className="flex items-center gap-2">
                See all methods
                <Icon icon="carbon:arrow-right" className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularMethods.map((method) => (
              <Link key={method.slug} href={`/methods/${method.slug}`}>
                <Card className="hover:bg-background hover:border-foreground/20 transition-all cursor-pointer group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Icon
                        icon={methodCategoryIcons[method.category] || 'carbon:catalog'}
                        className="h-6 w-6 text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {method.name}
                      </h3>
                    </div>
                    <Icon
                      icon="carbon:arrow-right"
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Playbooks Section */}
      <section className="container py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Example Playbooks</h2>
            <p className="text-muted-foreground">
              End-to-end sequences that combine challenges, interventions, and facilitator scripts
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/playbooks" className="flex items-center gap-2">
              See all playbooks
              <Icon icon="carbon:arrow-right" className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {featuredPlaybooks.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  Playbooks are being prepared. Check back soon for sequenced guides you can run as-is.
                </p>
              </CardContent>
            </Card>
          )}
          {featuredPlaybooks.map((playbook) => (
            <Link key={playbook.slug} href={`/playbooks/${playbook.slug}`}>
              <Card className="h-full hover:bg-muted/50 hover:border-foreground/20 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between gap-2">
                    <span>{playbook.title}</span>
                    <Icon
                      icon="carbon:arrow-right"
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {playbook.summary || 'A practical sequence to solve recurring meeting and session problems.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{playbook.step_count || 0} steps</Badge>
                  {playbook.generated_from?.transformation_horizon && (
                    <Badge variant="outline">{playbook.generated_from.transformation_horizon}</Badge>
                  )}
                  {playbook.estimated_duration && (
                    <Badge variant="outline">{playbook.estimated_duration}</Badge>
                  )}
                  {playbook.category && (
                    <Badge variant="outline">{playbook.category}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          How METODIC | learn helps you
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:search" className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">1. Find Your Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Browse common challenges or search for what you&apos;re facing
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:document" className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">2. Get a Script</h3>
            <p className="text-muted-foreground text-sm">
              Copy-paste solutions you can use in your next meeting
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:rocket" className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">3. Go Deeper</h3>
            <p className="text-muted-foreground text-sm">
              Use Metodic to build full session agendas when you need more
            </p>
          </div>
        </div>
      </section>

      {/* Audience Positioning */}
      <section className="border-y bg-muted/20">
        <div className="container py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">
              Built for both session leaders and facilitators
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="carbon:user-follow" className="h-5 w-5 text-primary" />
                    If facilitation is not your core job
                  </CardTitle>
                  <CardDescription>
                    Use challenge pages and copy-paste scripts to run better meetings immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                    <li>Start from a real problem, not a blank agenda</li>
                    <li>Use ready-to-say prompts in your next meeting</li>
                    <li>Get a practical next step in under 10 minutes</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="carbon:skill-level-advanced" className="h-5 w-5 text-primary" />
                    If you are a professional facilitator
                  </CardTitle>
                  <CardDescription>
                    Use METODIC learn as a pattern bank and quick prep library for high-quality interventions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                    <li>Find method variants faster for context-specific constraints</li>
                    <li>Refresh scripts and framing language before sessions</li>
                    <li>Pair methods into stronger sequences with Metodic</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Icon icon="carbon:flash" className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">
              Need more than a script?
            </h2>
            <p className="text-muted-foreground mb-8">
              METODIC learn stays free as your method and challenge library.
              Metodic helps you turn that knowledge into complete session agendas with materials, slides, and facilitator notes.
            </p>
            <Button asChild size="lg">
              <a
                href="https://metodic.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Icon icon="carbon:rocket" className="h-5 w-5" />
                Build a complete session in Metodic
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <EmailSignupCta
            source="homepage"
            title="Want updates and news?"
            description="Get updates and news about new methods, frameworks, and playbooks on METODIC learn."
          />
        </div>
      </section>
    </div>
  );
}
