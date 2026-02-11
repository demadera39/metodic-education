import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Common Workshop & Meeting Problems',
  description: 'Browse common team and meeting problems with practical solutions. Find methods and techniques to fix silent meetings, decision deadlock, scope creep, and more.',
};

// Problem categories with SEO-rich structure
const problemCategories = [
  {
    category: 'Participation & Engagement',
    icon: 'carbon:user-speaker',
    problems: [
      {
        slug: 'silent-meetings',
        title: 'Silent Meetings',
        description: 'Only a few people speak while others stay quiet',
        solutionCount: 4,
      },
      {
        slug: 'dominant-voices',
        title: 'Dominant Voices',
        description: 'One or two people take over every discussion',
        solutionCount: 3,
      },
      {
        slug: 'low-energy',
        title: 'Low Energy',
        description: 'Team seems checked out and disengaged',
        solutionCount: 5,
      },
    ],
  },
  {
    category: 'Decision Making',
    icon: 'carbon:decision-tree',
    problems: [
      {
        slug: 'decision-deadlock',
        title: 'Decision Deadlock',
        description: 'Same discussions repeat without resolution',
        solutionCount: 4,
      },
      {
        slug: 'analysis-paralysis',
        title: 'Analysis Paralysis',
        description: 'Endless research instead of deciding',
        solutionCount: 3,
      },
      {
        slug: 'decisions-dont-stick',
        title: "Decisions Don't Stick",
        description: 'Agreed decisions keep getting reopened',
        solutionCount: 4,
      },
    ],
  },
  {
    category: 'Alignment & Strategy',
    icon: 'carbon:connect',
    problems: [
      {
        slug: 'team-misalignment',
        title: 'Team Misalignment',
        description: 'Everyone has different understanding of goals',
        solutionCount: 5,
      },
      {
        slug: 'scope-creep',
        title: 'Scope Creep',
        description: 'Projects keep expanding beyond original plan',
        solutionCount: 3,
      },
      {
        slug: 'conflicting-priorities',
        title: 'Conflicting Priorities',
        description: "Teams can't agree on what matters most",
        solutionCount: 4,
      },
    ],
  },
  {
    category: 'Collaboration & Trust',
    icon: 'carbon:group',
    problems: [
      {
        slug: 'silos',
        title: 'Team Silos',
        description: 'Groups work in isolation without sharing',
        solutionCount: 4,
      },
      {
        slug: 'lack-of-trust',
        title: 'Lack of Trust',
        description: 'People hold back or protect themselves',
        solutionCount: 5,
      },
      {
        slug: 'remote-disconnect',
        title: 'Remote Disconnect',
        description: 'Distributed teams feel disconnected',
        solutionCount: 4,
      },
    ],
  },
];

export default function ProblemsPage() {
  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Common Workshop & Meeting Problems
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Find practical solutions for the challenges you face in meetings, workshops, and team sessions.
          Each problem includes copy-paste scripts for immediate use.
        </p>
      </header>

      {/* Search hint */}
      <div className="bg-muted/50 rounded-lg p-4 mb-8 flex items-center gap-3">
        <Icon icon="carbon:search" className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Looking for something specific? Try searching Google for &quot;metodic.education [your problem]&quot;
        </span>
      </div>

      {/* Problem Categories */}
      <div className="space-y-12">
        {problemCategories.map((category) => (
          <section key={category.category}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-muted">
                <Icon icon={category.icon} className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold">{category.category}</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.problems.map((problem) => (
                <Link key={problem.slug} href={`/problems/${problem.slug}`}>
                  <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {problem.title}
                        </CardTitle>
                        <Icon
                          icon="carbon:arrow-right"
                          className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <CardDescription>{problem.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="text-xs">
                        {problem.solutionCount} solutions
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
        <Icon icon="carbon:idea" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Don&apos;t See Your Problem?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Metodic can help you design a custom session for any challenge.
          Just describe your situation and get a tailored agenda.
        </p>
        <a
          href="https://metodic.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon icon="carbon:chat-bot" className="h-5 w-5" />
          Describe Your Challenge
        </a>
      </section>
    </div>
  );
}
