import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Featured challenges for the homepage grid
const featuredChallenges = [
  {
    slug: 'silent-meetings',
    title: 'Silent Meetings',
    description: 'Only a few people speak while others stay quiet',
    icon: 'carbon:user-speaker',
    solutionCount: 4,
  },
  {
    slug: 'decision-deadlock',
    title: 'Decision Deadlock',
    description: 'Same discussions repeat without resolution',
    icon: 'carbon:decision-tree',
    solutionCount: 4,
  },
  {
    slug: 'scope-creep',
    title: 'Scope Creep',
    description: 'Projects keep expanding beyond plan',
    icon: 'carbon:growth',
    solutionCount: 3,
  },
  {
    slug: 'team-misalignment',
    title: 'Team Misalignment',
    description: 'Everyone has different understanding of goals',
    icon: 'carbon:arrows-horizontal',
    solutionCount: 5,
  },
  {
    slug: 'dominant-voices',
    title: 'Dominant Voices',
    description: 'One or two people take over discussions',
    icon: 'carbon:volume-up-filled',
    solutionCount: 3,
  },
  {
    slug: 'low-energy',
    title: 'Low Energy',
    description: 'Team seems checked out and disengaged',
    icon: 'carbon:battery-low',
    solutionCount: 5,
  },
];

// Quick-access methods
const popularMethods = [
  { slug: '1-2-4-all', name: '1-2-4-All', icon: 'carbon:group' },
  { slug: 'dot-voting', name: 'Dot Voting', icon: 'carbon:thumbs-up' },
  { slug: 'brainwriting', name: 'Brainwriting', icon: 'carbon:pen' },
  { slug: 'sailboat-retro', name: 'Sailboat Retro', icon: 'carbon:sailboat-offshore' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              Free knowledge for professionals
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Solve your meeting challenges.
              <br />
              <span className="text-muted-foreground">For free.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Practical scripts, methods, and techniques to transform your workshops and meetings.
              No signup required. Just solutions.
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
                      <Icon icon={challenge.icon} className="h-5 w-5 text-orange-600" />
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
                    {challenge.solutionCount} solutions
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
                      <Icon icon={method.icon} className="h-6 w-6 text-primary" />
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

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Icon icon="carbon:flash" className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">
              Need a Full Session, Not Just a Quick Fix?
            </h2>
            <p className="text-muted-foreground mb-8">
              Metodic builds complete workshop agendas with materials, slides, and facilitator notes.
              Describe your challenge, get a ready-to-run session.
            </p>
            <Button asChild size="lg">
              <a
                href="https://metodic.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Icon icon="carbon:rocket" className="h-5 w-5" />
                Build a Session with Metodic
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
