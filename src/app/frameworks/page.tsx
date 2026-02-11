'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Frameworks - proven structures for better meeting outcomes
const frameworkCategories = [
  {
    category: 'Decision Frameworks',
    icon: 'carbon:decision-tree',
    description: 'Structures that help teams make better decisions together',
    frameworks: [
      {
        slug: 'consent-based-decision',
        name: 'Consent-Based Decision Making',
        description: 'Move forward when no one has a paramount objection. Faster than consensus, more inclusive than top-down.',
        bestFor: 'Team decisions where buy-in matters',
        duration: '15-30 min',
        keywords: ['sociocracy', 'consent', 'governance', 'inclusive'],
      },
      {
        slug: 'rapid-framework',
        name: 'RAPID Framework',
        description: 'Clarify who Recommends, Agrees, Performs, Inputs, and Decides. Eliminate confusion about decision rights.',
        bestFor: 'Complex decisions with multiple stakeholders',
        duration: '30-45 min',
        keywords: ['roles', 'accountability', 'bain', 'clarity'],
      },
      {
        slug: 'six-thinking-hats',
        name: 'Six Thinking Hats',
        description: 'Explore decisions from six perspectives: facts, feelings, caution, benefits, creativity, and process.',
        bestFor: 'Important decisions needing thorough analysis',
        duration: '45-60 min',
        keywords: ['de bono', 'perspectives', 'parallel thinking'],
      },
      {
        slug: 'gradients-of-agreement',
        name: 'Gradients of Agreement',
        description: 'Eight-point scale from "Wholehearted Yes" to "Veto". Surface nuance instead of binary votes.',
        bestFor: 'Finding alignment on controversial topics',
        duration: '10-20 min',
        keywords: ['voting', 'alignment', 'nuance', 'scale'],
      },
    ],
  },
  {
    category: 'Meeting Structures',
    icon: 'carbon:group',
    description: 'Proven formats for different types of meetings',
    frameworks: [
      {
        slug: 'lean-coffee',
        name: 'Lean Coffee',
        description: 'Participant-driven agenda where topics are proposed, voted, and timeboxed. Democratic and efficient.',
        bestFor: 'Regular team syncs without preset agenda',
        duration: '30-60 min',
        keywords: ['agenda-less', 'democratic', 'timebox'],
      },
      {
        slug: 'stand-up-meeting',
        name: 'Daily Stand-up',
        description: 'Quick sync: what I did, what I\'ll do, what\'s blocking me. Keep it under 15 minutes.',
        bestFor: 'Daily team coordination',
        duration: '10-15 min',
        keywords: ['agile', 'scrum', 'daily', 'sync'],
      },
      {
        slug: 'liberating-structures',
        name: 'Liberating Structures',
        description: '33 microstructures to replace or enhance conventional meetings. Include and unleash everyone.',
        bestFor: 'Any meeting needing more engagement',
        duration: 'Varies',
        keywords: ['inclusion', 'engagement', 'patterns'],
      },
      {
        slug: 'world-cafe',
        name: 'World Café',
        description: 'Rotating small-group conversations around tables. Cross-pollinate ideas across the whole group.',
        bestFor: 'Large group discussions (20+)',
        duration: '60-120 min',
        keywords: ['large group', 'conversation', 'rotation'],
      },
      {
        slug: 'open-space',
        name: 'Open Space Technology',
        description: 'Self-organizing conference where participants create the agenda and choose sessions.',
        bestFor: 'Complex issues with diverse stakeholders',
        duration: 'Half-day to multi-day',
        keywords: ['unconference', 'self-organizing', 'emergence'],
      },
    ],
  },
  {
    category: 'Problem-Solving Frameworks',
    icon: 'carbon:analytics',
    description: 'Systematic approaches to tackle complex challenges',
    frameworks: [
      {
        slug: 'design-thinking',
        name: 'Design Thinking',
        description: 'Empathize, Define, Ideate, Prototype, Test. Human-centered approach to innovation.',
        bestFor: 'Creating solutions for user needs',
        duration: 'Multi-session',
        keywords: ['ideo', 'stanford', 'human-centered', 'innovation'],
      },
      {
        slug: 'a3-problem-solving',
        name: 'A3 Problem Solving',
        description: 'Toyota\'s structured approach: background, current state, goals, root cause, countermeasures, plan.',
        bestFor: 'Operational problems needing deep analysis',
        duration: '60-90 min per session',
        keywords: ['toyota', 'lean', 'root cause', 'pdca'],
      },
      {
        slug: 'five-whys',
        name: 'Five Whys',
        description: 'Ask "why" repeatedly to dig past symptoms to root causes. Simple but powerful.',
        bestFor: 'Quick root cause analysis',
        duration: '15-30 min',
        keywords: ['root cause', 'analysis', 'depth'],
      },
      {
        slug: 'cynefin',
        name: 'Cynefin Framework',
        description: 'Categorize situations as Clear, Complicated, Complex, or Chaotic. Match your approach to the context.',
        bestFor: 'Understanding what type of problem you face',
        duration: '30-45 min',
        keywords: ['complexity', 'sense-making', 'context'],
      },
    ],
  },
  {
    category: 'Retrospective Frameworks',
    icon: 'carbon:renew',
    description: 'Learn from the past to improve the future',
    frameworks: [
      {
        slug: 'sailboat-retrospective',
        name: 'Sailboat Retrospective',
        description: 'Map what pushes you forward (wind), holds you back (anchors), and threatens (rocks) toward your goal (island).',
        bestFor: 'Team retrospectives with visual thinkers',
        duration: '45-60 min',
        keywords: ['visual', 'metaphor', 'agile', 'retro'],
      },
      {
        slug: 'four-ls',
        name: '4Ls Retrospective',
        description: 'What we Liked, Learned, Lacked, and Longed For. Comprehensive reflection framework.',
        bestFor: 'Project wrap-ups and milestone reviews',
        duration: '30-45 min',
        keywords: ['reflection', 'comprehensive', 'learning'],
      },
      {
        slug: 'start-stop-continue',
        name: 'Start-Stop-Continue',
        description: 'Simple and actionable: what should we start, stop, and continue doing?',
        bestFor: 'Quick retrospectives focused on action',
        duration: '15-30 min',
        keywords: ['simple', 'actionable', 'change'],
      },
      {
        slug: 'prime-directive',
        name: 'Retrospective Prime Directive',
        description: 'Mindset: everyone did the best they could with what they knew. Create safety for honest reflection.',
        bestFor: 'Setting the right tone for retros',
        duration: '5 min',
        keywords: ['safety', 'mindset', 'norm kerth'],
      },
    ],
  },
  {
    category: 'Alignment Frameworks',
    icon: 'carbon:compass',
    description: 'Get everyone moving in the same direction',
    frameworks: [
      {
        slug: 'okrs',
        name: 'OKRs (Objectives & Key Results)',
        description: 'Set ambitious Objectives with measurable Key Results. Align teams around outcomes, not activities.',
        bestFor: 'Quarterly planning and alignment',
        duration: '90-120 min',
        keywords: ['goals', 'intel', 'google', 'outcomes'],
      },
      {
        slug: 'team-canvas',
        name: 'Team Canvas',
        description: 'Visual template covering purpose, values, goals, roles, and rules. Align a new or struggling team.',
        bestFor: 'New team formation or team reset',
        duration: '60-90 min',
        keywords: ['team building', 'visual', 'charter'],
      },
      {
        slug: 'delegation-poker',
        name: 'Delegation Poker',
        description: 'Seven levels from "Tell" to "Delegate". Clarify decision authority between managers and teams.',
        bestFor: 'Clarifying autonomy and accountability',
        duration: '30-45 min',
        keywords: ['management 3.0', 'autonomy', 'empowerment'],
      },
      {
        slug: 'working-agreements',
        name: 'Working Agreements',
        description: 'Co-create explicit norms for how the team works together. Review and update regularly.',
        bestFor: 'Establishing team norms',
        duration: '30-45 min',
        keywords: ['norms', 'agreements', 'expectations'],
      },
    ],
  },
  {
    category: 'Ideation Frameworks',
    icon: 'carbon:idea',
    description: 'Generate creative ideas and solutions',
    frameworks: [
      {
        slug: 'design-sprint',
        name: 'Design Sprint',
        description: 'Five-day process: Map, Sketch, Decide, Prototype, Test. Rapid validation of ideas.',
        bestFor: 'New product/feature development',
        duration: '5 days',
        keywords: ['google ventures', 'rapid', 'prototype'],
      },
      {
        slug: 'diverge-converge',
        name: 'Diverge-Converge (Diamond)',
        description: 'First generate many options (diverge), then narrow down (converge). The fundamental creative pattern.',
        bestFor: 'Any creative or problem-solving session',
        duration: 'Varies',
        keywords: ['double diamond', 'creative', 'pattern'],
      },
      {
        slug: 'scamper',
        name: 'SCAMPER',
        description: 'Systematic prompts: Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.',
        bestFor: 'Improving existing products or processes',
        duration: '30-45 min',
        keywords: ['creativity', 'prompts', 'improvement'],
      },
      {
        slug: 'how-might-we',
        name: 'How Might We',
        description: 'Reframe problems as opportunities with "How might we...?" questions. Open up solution space.',
        bestFor: 'Transitioning from problem to solution',
        duration: '15-30 min',
        keywords: ['reframing', 'opportunity', 'questions'],
      },
    ],
  },
];

// Flatten all frameworks for search
const allFrameworks = frameworkCategories.flatMap(cat =>
  cat.frameworks.map(fw => ({ ...fw, category: cat.category, categoryIcon: cat.icon }))
);

export default function FrameworksPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return frameworkCategories;
    }

    const query = searchQuery.toLowerCase();

    return frameworkCategories
      .map(category => ({
        ...category,
        frameworks: category.frameworks.filter(framework =>
          framework.name.toLowerCase().includes(query) ||
          framework.description.toLowerCase().includes(query) ||
          framework.bestFor.toLowerCase().includes(query) ||
          framework.keywords.some(kw => kw.toLowerCase().includes(query))
        ),
      }))
      .filter(category => category.frameworks.length > 0);
  }, [searchQuery]);

  const totalFrameworks = allFrameworks.length;
  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.frameworks.length, 0);

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Meeting & Session Frameworks
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Proven structures that help teams make decisions, solve problems, and align on goals.
          Use these frameworks to transform your meetings into sessions that actually produce outcomes.
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
            placeholder="Search frameworks... (e.g., 'decision', 'retro', 'alignment')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredCount} of {totalFrameworks} frameworks
          </p>
        )}
      </div>

      {/* Framework Categories */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <section key={category.category}>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-muted">
                  <Icon icon={category.icon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold">{category.category}</h2>
                    <Badge variant="secondary">{category.frameworks.length}</Badge>
                  </div>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {category.frameworks.map((framework) => (
                  <Link key={framework.slug} href={`/frameworks/${framework.slug}`}>
                    <Card className="h-full hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {framework.name}
                          </CardTitle>
                          <Icon
                            icon="carbon:arrow-right"
                            className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                          />
                        </div>
                        <CardDescription className="line-clamp-2">
                          {framework.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Icon icon="carbon:time" className="h-3 w-3 mr-1" />
                            {framework.duration}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {framework.bestFor}
                          </Badge>
                        </div>
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
          <h3 className="text-lg font-medium mb-2">No frameworks found</h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term or browse all frameworks
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Why Frameworks Matter */}
      <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Why Use Frameworks?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:checkmark-outline" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Predictable Outcomes</h3>
            <p className="text-sm text-muted-foreground">
              Frameworks are battle-tested patterns. They work because thousands of teams have refined them.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:user-multiple" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Equal Participation</h3>
            <p className="text-sm text-muted-foreground">
              Good frameworks include everyone, not just the loudest voices. Structure creates safety.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:time" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Time Well Spent</h3>
            <p className="text-sm text-muted-foreground">
              No more meetings that could have been emails. Frameworks ensure you achieve what you set out to do.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 text-center">
        <Icon icon="carbon:build" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Ready to Apply These Frameworks?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Metodic automatically combines frameworks and methods into complete session agendas.
          Tell us your challenge, get a ready-to-run session.
        </p>
        <a
          href="https://metodic.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon icon="carbon:rocket" className="h-5 w-5" />
          Build a Session with Metodic
        </a>
      </section>
    </div>
  );
}
