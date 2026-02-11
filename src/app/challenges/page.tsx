'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Challenge categories with SEO-rich structure
const challengeCategories = [
  {
    category: 'Participation & Engagement',
    icon: 'carbon:user-speaker',
    challenges: [
      {
        slug: 'silent-meetings',
        title: 'Silent Meetings',
        description: 'Only a few people speak while others stay quiet',
        solutionCount: 4,
        keywords: ['quiet', 'participation', 'engagement', 'speaking'],
      },
      {
        slug: 'dominant-voices',
        title: 'Dominant Voices',
        description: 'One or two people take over every discussion',
        solutionCount: 3,
        keywords: ['loud', 'dominant', 'takeover', 'interrupting'],
      },
      {
        slug: 'low-energy',
        title: 'Low Energy',
        description: 'Team seems checked out and disengaged',
        solutionCount: 5,
        keywords: ['tired', 'bored', 'disengaged', 'motivation'],
      },
      {
        slug: 'late-arrivals',
        title: 'Late Arrivals',
        description: 'People constantly join meetings late',
        solutionCount: 3,
        keywords: ['late', 'punctuality', 'time', 'start'],
      },
      {
        slug: 'phone-distraction',
        title: 'Phone Distraction',
        description: 'Participants are distracted by devices',
        solutionCount: 3,
        keywords: ['phones', 'distracted', 'multitasking', 'attention'],
      },
    ],
  },
  {
    category: 'Decision Making',
    icon: 'carbon:decision-tree',
    challenges: [
      {
        slug: 'decision-deadlock',
        title: 'Decision Deadlock',
        description: 'Same discussions repeat without resolution',
        solutionCount: 4,
        keywords: ['stuck', 'deadlock', 'no progress', 'repeat'],
      },
      {
        slug: 'analysis-paralysis',
        title: 'Analysis Paralysis',
        description: 'Endless research instead of deciding',
        solutionCount: 3,
        keywords: ['overthinking', 'data', 'research', 'paralysis'],
      },
      {
        slug: 'decisions-dont-stick',
        title: "Decisions Don't Stick",
        description: 'Agreed decisions keep getting reopened',
        solutionCount: 4,
        keywords: ['revisit', 'change', 'commitment', 'follow-through'],
      },
      {
        slug: 'consensus-trap',
        title: 'Consensus Trap',
        description: 'Trying to make everyone happy delays progress',
        solutionCount: 3,
        keywords: ['consensus', 'agreement', 'compromise', 'delay'],
      },
      {
        slug: 'hippo-effect',
        title: 'HiPPO Effect',
        description: 'Highest paid person always wins the argument',
        solutionCount: 4,
        keywords: ['boss', 'authority', 'hierarchy', 'power'],
      },
    ],
  },
  {
    category: 'Alignment & Strategy',
    icon: 'carbon:connect',
    challenges: [
      {
        slug: 'team-misalignment',
        title: 'Team Misalignment',
        description: 'Everyone has different understanding of goals',
        solutionCount: 5,
        keywords: ['goals', 'vision', 'direction', 'understanding'],
      },
      {
        slug: 'scope-creep',
        title: 'Scope Creep',
        description: 'Projects keep expanding beyond original plan',
        solutionCount: 3,
        keywords: ['scope', 'features', 'expanding', 'boundaries'],
      },
      {
        slug: 'conflicting-priorities',
        title: 'Conflicting Priorities',
        description: "Teams can't agree on what matters most",
        solutionCount: 4,
        keywords: ['priorities', 'conflict', 'important', 'focus'],
      },
      {
        slug: 'unclear-ownership',
        title: 'Unclear Ownership',
        description: 'Nobody knows who is responsible for what',
        solutionCount: 4,
        keywords: ['ownership', 'responsibility', 'accountability', 'roles'],
      },
      {
        slug: 'strategy-disconnect',
        title: 'Strategy Disconnect',
        description: 'Daily work feels disconnected from company goals',
        solutionCount: 3,
        keywords: ['strategy', 'purpose', 'meaning', 'connection'],
      },
    ],
  },
  {
    category: 'Collaboration & Trust',
    icon: 'carbon:group',
    challenges: [
      {
        slug: 'silos',
        title: 'Team Silos',
        description: 'Groups work in isolation without sharing',
        solutionCount: 4,
        keywords: ['silos', 'isolation', 'communication', 'sharing'],
      },
      {
        slug: 'lack-of-trust',
        title: 'Lack of Trust',
        description: 'People hold back or protect themselves',
        solutionCount: 5,
        keywords: ['trust', 'safety', 'vulnerability', 'openness'],
      },
      {
        slug: 'remote-disconnect',
        title: 'Remote Disconnect',
        description: 'Distributed teams feel disconnected',
        solutionCount: 4,
        keywords: ['remote', 'virtual', 'hybrid', 'distance'],
      },
      {
        slug: 'blame-culture',
        title: 'Blame Culture',
        description: 'People point fingers instead of solving problems',
        solutionCount: 3,
        keywords: ['blame', 'fault', 'accountability', 'defensiveness'],
      },
      {
        slug: 'conflict-avoidance',
        title: 'Conflict Avoidance',
        description: 'Important issues never get addressed',
        solutionCount: 4,
        keywords: ['conflict', 'avoidance', 'difficult', 'conversations'],
      },
    ],
  },
  {
    category: 'Meeting Efficiency',
    icon: 'carbon:time',
    challenges: [
      {
        slug: 'meetings-run-long',
        title: 'Meetings Run Long',
        description: 'Discussions always exceed scheduled time',
        solutionCount: 4,
        keywords: ['time', 'overtime', 'long', 'schedule'],
      },
      {
        slug: 'no-agenda',
        title: 'No Clear Agenda',
        description: 'Meetings lack structure and purpose',
        solutionCount: 3,
        keywords: ['agenda', 'structure', 'purpose', 'planning'],
      },
      {
        slug: 'too-many-meetings',
        title: 'Too Many Meetings',
        description: 'Calendar is full but nothing gets done',
        solutionCount: 4,
        keywords: ['overload', 'calendar', 'productivity', 'time'],
      },
      {
        slug: 'no-follow-through',
        title: 'No Follow-Through',
        description: 'Action items from meetings never happen',
        solutionCount: 4,
        keywords: ['actions', 'follow-up', 'accountability', 'tasks'],
      },
      {
        slug: 'wrong-people',
        title: 'Wrong People in Room',
        description: 'Key stakeholders missing or irrelevant attendees present',
        solutionCount: 3,
        keywords: ['attendees', 'stakeholders', 'participants', 'invite'],
      },
    ],
  },
  {
    category: 'Innovation & Creativity',
    icon: 'carbon:idea',
    challenges: [
      {
        slug: 'idea-drought',
        title: 'Idea Drought',
        description: 'Team struggles to generate new ideas',
        solutionCount: 5,
        keywords: ['ideas', 'creativity', 'innovation', 'brainstorm'],
      },
      {
        slug: 'groupthink',
        title: 'Groupthink',
        description: 'Everyone agrees too quickly without challenge',
        solutionCount: 4,
        keywords: ['groupthink', 'conformity', 'challenge', 'diversity'],
      },
      {
        slug: 'fear-of-failure',
        title: 'Fear of Failure',
        description: 'People avoid risks and stick to safe options',
        solutionCount: 4,
        keywords: ['fear', 'risk', 'failure', 'experimentation'],
      },
      {
        slug: 'idea-killers',
        title: 'Idea Killers',
        description: 'New ideas get shut down immediately',
        solutionCount: 3,
        keywords: ['criticism', 'negativity', 'rejection', 'dismissive'],
      },
    ],
  },
];

// Flatten all challenges for search
const allChallenges = challengeCategories.flatMap(cat =>
  cat.challenges.map(ch => ({ ...ch, category: cat.category, categoryIcon: cat.icon }))
);

export default function ChallengesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return challengeCategories;
    }

    const query = searchQuery.toLowerCase();

    return challengeCategories
      .map(category => ({
        ...category,
        challenges: category.challenges.filter(challenge =>
          challenge.title.toLowerCase().includes(query) ||
          challenge.description.toLowerCase().includes(query) ||
          challenge.keywords.some(kw => kw.toLowerCase().includes(query))
        ),
      }))
      .filter(category => category.challenges.length > 0);
  }, [searchQuery]);

  const totalChallenges = allChallenges.length;
  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.challenges.length, 0);

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Common Workshop & Meeting Challenges
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Find practical solutions for the challenges you face in meetings, workshops, and team sessions.
          Each challenge includes copy-paste scripts for immediate use.
        </p>
      </header>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Icon
            icon="carbon:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search challenges... (e.g., 'quiet meetings', 'decisions')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredCount} of {totalChallenges} challenges
          </p>
        )}
      </div>

      {/* Challenge Categories */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <section key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-muted">
                  <Icon icon={category.icon} className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold">{category.category}</h2>
                <Badge variant="secondary" className="ml-2">
                  {category.challenges.length}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.challenges.map((challenge) => (
                  <Link key={challenge.slug} href={`/challenges/${challenge.slug}`}>
                    <Card className="h-full hover:bg-muted/50 hover:border-orange-500/30 transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="group-hover:text-orange-600 transition-colors">
                            {challenge.title}
                          </CardTitle>
                          <Icon
                            icon="carbon:arrow-right"
                            className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all"
                          />
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
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
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon icon="carbon:search" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No challenges found</h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term or browse all challenges
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* CTA Section */}
      <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
        <Icon icon="carbon:idea" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Don&apos;t See Your Challenge?
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
