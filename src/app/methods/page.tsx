'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Method {
  slug: string;
  name: string;
  description: string;
  duration: string;
  difficulty: Difficulty;
  keywords: string[];
}

const methodCategories = [
  {
    category: 'Engagement & Participation',
    icon: 'carbon:user-speaker',
    description: 'Get everyone involved, not just the loud voices',
    methods: [
      { slug: '1-2-4-all', name: '1-2-4-All', description: 'Build from individual to group discussion', duration: '12-20 min', difficulty: 'easy' as Difficulty, keywords: ['liberating structures', 'participation', 'inclusion'] },
      { slug: 'brainwriting', name: 'Brainwriting', description: 'Silent idea generation on paper', duration: '10-20 min', difficulty: 'easy' as Difficulty, keywords: ['silent', 'ideation', 'written'] },
      { slug: 'round-robin', name: 'Round Robin', description: 'Everyone speaks in turn', duration: '10-30 min', difficulty: 'easy' as Difficulty, keywords: ['turn-taking', 'equal voice', 'structured'] },
      { slug: 'think-pair-share', name: 'Think-Pair-Share', description: 'Individual reflection, then paired discussion', duration: '10-15 min', difficulty: 'easy' as Difficulty, keywords: ['reflection', 'pairing', 'discussion'] },
      { slug: 'fishbowl', name: 'Fishbowl', description: 'Inner circle discusses, outer circle observes', duration: '30-45 min', difficulty: 'medium' as Difficulty, keywords: ['observation', 'discussion', 'listening'] },
      { slug: 'gallery-walk', name: 'Gallery Walk', description: 'Post ideas on walls for everyone to review', duration: '20-40 min', difficulty: 'easy' as Difficulty, keywords: ['visual', 'movement', 'feedback'] },
      { slug: 'popcorn', name: 'Popcorn Sharing', description: 'Anyone can share anytime', duration: '10-20 min', difficulty: 'easy' as Difficulty, keywords: ['spontaneous', 'informal', 'organic'] },
      { slug: 'world-cafe', name: 'World Café', description: 'Rotating small group conversations', duration: '45-90 min', difficulty: 'medium' as Difficulty, keywords: ['rotation', 'conversation', 'cafe'] },
    ],
  },
  {
    category: 'Decision Making',
    icon: 'carbon:decision-tree',
    description: 'Move from discussion to decision',
    methods: [
      { slug: 'dot-voting', name: 'Dot Voting', description: 'Vote with dots to prioritize options', duration: '5-10 min', difficulty: 'easy' as Difficulty, keywords: ['voting', 'prioritization', 'quick'] },
      { slug: 'fist-of-five', name: 'Fist of Five', description: 'Show agreement level with fingers', duration: '5 min', difficulty: 'easy' as Difficulty, keywords: ['consensus', 'quick check', 'visual'] },
      { slug: 'gradients-of-agreement', name: 'Gradients of Agreement', description: 'Nuanced consent scale from 1-8', duration: '10-15 min', difficulty: 'medium' as Difficulty, keywords: ['consent', 'nuance', 'alignment'] },
      { slug: 'decision-matrix', name: 'Decision Matrix', description: 'Score options against criteria', duration: '30-60 min', difficulty: 'medium' as Difficulty, keywords: ['criteria', 'scoring', 'analysis'] },
      { slug: 'roman-voting', name: 'Roman Voting', description: 'Thumbs up/down/sideways for quick polling', duration: '2-5 min', difficulty: 'easy' as Difficulty, keywords: ['thumbs', 'polling', 'instant'] },
      { slug: 'weighted-voting', name: 'Weighted Voting', description: 'Distribute points among options', duration: '10-15 min', difficulty: 'easy' as Difficulty, keywords: ['points', 'distribution', 'prioritize'] },
      { slug: 'decider-protocol', name: 'Decider Protocol', description: 'Binary yes/no with resolution process', duration: '5-10 min', difficulty: 'medium' as Difficulty, keywords: ['protocol', 'binary', 'core protocols'] },
      { slug: 'consent-decision', name: 'Consent Decision Making', description: 'No one has a paramount objection', duration: '15-30 min', difficulty: 'medium' as Difficulty, keywords: ['consent', 'sociocracy', 'objections'] },
    ],
  },
  {
    category: 'Ideation & Brainstorming',
    icon: 'carbon:idea',
    description: 'Generate creative ideas and solutions',
    methods: [
      { slug: 'crazy-eights', name: 'Crazy Eights', description: '8 ideas in 8 minutes sketching', duration: '8 min', difficulty: 'easy' as Difficulty, keywords: ['sketching', 'rapid', 'design sprint'] },
      { slug: 'how-might-we', name: 'How Might We', description: 'Reframe problems as opportunities', duration: '15-30 min', difficulty: 'easy' as Difficulty, keywords: ['reframing', 'questions', 'opportunity'] },
      { slug: 'scamper', name: 'SCAMPER', description: 'Systematic creative prompts', duration: '30-45 min', difficulty: 'medium' as Difficulty, keywords: ['prompts', 'systematic', 'substitute combine'] },
      { slug: 'six-thinking-hats', name: 'Six Thinking Hats', description: 'Different thinking modes for perspectives', duration: '30-60 min', difficulty: 'medium' as Difficulty, keywords: ['perspectives', 'de bono', 'hats'] },
      { slug: 'reverse-brainstorm', name: 'Reverse Brainstorm', description: 'How to make the problem worse', duration: '20-30 min', difficulty: 'easy' as Difficulty, keywords: ['reverse', 'negative', 'flip'] },
      { slug: 'worst-idea', name: 'Worst Possible Idea', description: 'Generate terrible ideas to spark good ones', duration: '15-20 min', difficulty: 'easy' as Difficulty, keywords: ['bad ideas', 'fun', 'creative'] },
      { slug: 'mind-mapping', name: 'Mind Mapping', description: 'Visual branching of connected ideas', duration: '15-30 min', difficulty: 'easy' as Difficulty, keywords: ['visual', 'connections', 'branches'] },
      { slug: 'random-input', name: 'Random Input', description: 'Use random stimuli to spark ideas', duration: '15-30 min', difficulty: 'medium' as Difficulty, keywords: ['random', 'stimuli', 'lateral thinking'] },
    ],
  },
  {
    category: 'Feedback & Retrospective',
    icon: 'carbon:review',
    description: 'Reflect, learn, and improve together',
    methods: [
      { slug: 'start-stop-continue', name: 'Start-Stop-Continue', description: 'What to start, stop, and keep doing', duration: '15-30 min', difficulty: 'easy' as Difficulty, keywords: ['retro', 'simple', 'action'] },
      { slug: 'sailboat-retro', name: 'Sailboat Retrospective', description: 'Wind, anchors, rocks, and island', duration: '45-60 min', difficulty: 'easy' as Difficulty, keywords: ['metaphor', 'visual', 'agile'] },
      { slug: 'four-ls', name: '4Ls Retrospective', description: 'Liked, Learned, Lacked, Longed For', duration: '30-45 min', difficulty: 'easy' as Difficulty, keywords: ['reflection', 'learning', 'comprehensive'] },
      { slug: 'rose-thorn-bud', name: 'Rose, Thorn, Bud', description: 'Positives, negatives, and potential', duration: '15-30 min', difficulty: 'easy' as Difficulty, keywords: ['nature', 'balance', 'growth'] },
      { slug: 'mad-sad-glad', name: 'Mad, Sad, Glad', description: 'Emotional check-in retrospective', duration: '20-30 min', difficulty: 'easy' as Difficulty, keywords: ['emotions', 'feelings', 'simple'] },
      { slug: 'starfish', name: 'Starfish Retrospective', description: 'Keep, more of, less of, stop, start', duration: '30-45 min', difficulty: 'easy' as Difficulty, keywords: ['five categories', 'nuanced', 'detailed'] },
      { slug: 'timeline-retro', name: 'Timeline Retrospective', description: 'Map events and emotions over time', duration: '45-60 min', difficulty: 'medium' as Difficulty, keywords: ['timeline', 'history', 'journey'] },
      { slug: 'lean-coffee', name: 'Lean Coffee', description: 'Participant-driven agenda discussion', duration: '30-60 min', difficulty: 'easy' as Difficulty, keywords: ['agenda', 'democratic', 'flexible'] },
    ],
  },
  {
    category: 'Alignment & Vision',
    icon: 'carbon:compass',
    description: 'Get everyone on the same page',
    methods: [
      { slug: 'impact-effort-matrix', name: 'Impact-Effort Matrix', description: 'Plot options by impact vs effort', duration: '20-30 min', difficulty: 'easy' as Difficulty, keywords: ['prioritization', '2x2', 'matrix'] },
      { slug: 'moscow', name: 'MoSCoW Prioritization', description: 'Must, Should, Could, Won\'t', duration: '30-45 min', difficulty: 'easy' as Difficulty, keywords: ['prioritization', 'requirements', 'categories'] },
      { slug: 'swot', name: 'SWOT Analysis', description: 'Strengths, Weaknesses, Opportunities, Threats', duration: '45-60 min', difficulty: 'medium' as Difficulty, keywords: ['analysis', 'strategic', 'classic'] },
      { slug: 'product-box', name: 'Product Box', description: 'Design packaging for your vision', duration: '30-45 min', difficulty: 'medium' as Difficulty, keywords: ['vision', 'creative', 'marketing'] },
      { slug: 'vision-statement', name: 'Vision Statement Workshop', description: 'Craft a compelling vision together', duration: '60-90 min', difficulty: 'medium' as Difficulty, keywords: ['vision', 'future', 'inspiring'] },
      { slug: 'team-charter', name: 'Team Charter', description: 'Define team purpose and agreements', duration: '60-90 min', difficulty: 'medium' as Difficulty, keywords: ['charter', 'agreements', 'team'] },
      { slug: 'okrs', name: 'OKR Setting Workshop', description: 'Define Objectives and Key Results', duration: '90-120 min', difficulty: 'hard' as Difficulty, keywords: ['okr', 'goals', 'metrics'] },
      { slug: 'pre-mortem', name: 'Pre-Mortem', description: 'Imagine failure to prevent it', duration: '30-45 min', difficulty: 'easy' as Difficulty, keywords: ['risk', 'failure', 'prevention'] },
    ],
  },
  {
    category: 'Energizers & Icebreakers',
    icon: 'carbon:lightning',
    description: 'Build energy and connection',
    methods: [
      { slug: 'two-truths-lie', name: 'Two Truths and a Lie', description: 'Guess which statement is false', duration: '10-15 min', difficulty: 'easy' as Difficulty, keywords: ['icebreaker', 'fun', 'getting to know'] },
      { slug: 'check-in-question', name: 'Check-in Questions', description: 'Personal questions to start meetings', duration: '5-15 min', difficulty: 'easy' as Difficulty, keywords: ['opening', 'personal', 'connection'] },
      { slug: 'energizer-movement', name: 'Movement Energizer', description: 'Physical activities to boost energy', duration: '5-10 min', difficulty: 'easy' as Difficulty, keywords: ['physical', 'energy', 'break'] },
      { slug: 'one-word', name: 'One Word Check-in', description: 'Share mood in single word', duration: '3-5 min', difficulty: 'easy' as Difficulty, keywords: ['quick', 'mood', 'simple'] },
      { slug: 'show-and-tell', name: 'Show and Tell', description: 'Share something personal on camera', duration: '15-30 min', difficulty: 'easy' as Difficulty, keywords: ['remote', 'personal', 'sharing'] },
      { slug: 'would-you-rather', name: 'Would You Rather', description: 'Fun hypothetical choices', duration: '5-10 min', difficulty: 'easy' as Difficulty, keywords: ['fun', 'choices', 'light'] },
    ],
  },
  {
    category: 'Problem Solving',
    icon: 'carbon:analytics',
    description: 'Analyze and solve complex problems',
    methods: [
      { slug: 'five-whys', name: 'Five Whys', description: 'Dig to the root cause', duration: '15-30 min', difficulty: 'easy' as Difficulty, keywords: ['root cause', 'analysis', 'depth'] },
      { slug: 'fishbone', name: 'Fishbone Diagram', description: 'Map causes of a problem visually', duration: '30-45 min', difficulty: 'medium' as Difficulty, keywords: ['ishikawa', 'causes', 'visual'] },
      { slug: 'affinity-mapping', name: 'Affinity Mapping', description: 'Group related ideas together', duration: '20-40 min', difficulty: 'easy' as Difficulty, keywords: ['clustering', 'grouping', 'synthesis'] },
      { slug: 'empathy-map', name: 'Empathy Map', description: 'Understand user thoughts and feelings', duration: '30-45 min', difficulty: 'medium' as Difficulty, keywords: ['user', 'empathy', 'design thinking'] },
      { slug: 'journey-map', name: 'Journey Mapping', description: 'Map the user experience over time', duration: '60-90 min', difficulty: 'hard' as Difficulty, keywords: ['journey', 'experience', 'touchpoints'] },
      { slug: 'problem-statement', name: 'Problem Statement', description: 'Define the problem clearly', duration: '20-30 min', difficulty: 'medium' as Difficulty, keywords: ['define', 'clarity', 'scope'] },
    ],
  },
];

// Flatten all methods for search
const allMethods = methodCategories.flatMap(cat =>
  cat.methods.map(method => ({ ...method, category: cat.category, categoryIcon: cat.icon }))
);

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100',
};

export default function MethodsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return methodCategories;
    }

    const query = searchQuery.toLowerCase();

    return methodCategories
      .map(category => ({
        ...category,
        methods: category.methods.filter(method =>
          method.name.toLowerCase().includes(query) ||
          method.description.toLowerCase().includes(query) ||
          method.keywords.some(kw => kw.toLowerCase().includes(query))
        ),
      }))
      .filter(category => category.methods.length > 0);
  }, [searchQuery]);

  const totalMethods = allMethods.length;
  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.methods.length, 0);

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Facilitation Methods
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Step-by-step instructions for running effective workshops and meetings.
          Each method includes timing, tips, and variations.
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
            placeholder="Search methods... (e.g., 'voting', 'brainstorm', 'retro')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredCount} of {totalMethods} methods
          </p>
        )}
      </div>

      {/* Method Categories */}
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
                    <Badge variant="secondary">{category.methods.length}</Badge>
                  </div>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.methods.map((method) => (
                  <Link key={method.slug} href={`/methods/${method.slug}`}>
                    <Card className="h-full hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between">
                          <span className="truncate">{method.name}</span>
                          <Icon
                            icon="carbon:arrow-right"
                            className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                          />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {method.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Icon icon="carbon:time" className="h-3 w-3 mr-1" />
                            {method.duration}
                          </Badge>
                          <Badge className={`text-xs ${difficultyColors[method.difficulty]}`}>
                            {method.difficulty}
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
          <h3 className="text-lg font-medium mb-2">No methods found</h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term or browse all methods
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
        <Icon icon="carbon:catalog" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Want a Complete Method Library?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Metodic includes 100+ methods as building blocks. Mix and match to create custom sessions.
        </p>
        <a
          href="https://metodic.io/methods"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon icon="carbon:catalog" className="h-5 w-5" />
          Explore Full Library
        </a>
      </section>
    </div>
  );
}
