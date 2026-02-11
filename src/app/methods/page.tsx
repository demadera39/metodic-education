import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Facilitation Methods',
  description: 'Browse facilitation methods and techniques for workshops, meetings, and team sessions. Step-by-step instructions for each method.',
};

const methodCategories = [
  {
    category: 'Engagement & Participation',
    icon: 'carbon:user-speaker',
    description: 'Get everyone involved, not just the loud voices',
    methods: [
      { slug: '1-2-4-all', name: '1-2-4-All', duration: '12-20 min', difficulty: 'easy' },
      { slug: 'brainwriting', name: 'Brainwriting', duration: '10-20 min', difficulty: 'easy' },
      { slug: 'round-robin', name: 'Round Robin', duration: '10-30 min', difficulty: 'easy' },
      { slug: 'think-pair-share', name: 'Think-Pair-Share', duration: '10-15 min', difficulty: 'easy' },
    ],
  },
  {
    category: 'Decision Making',
    icon: 'carbon:decision-tree',
    description: 'Move from discussion to decision',
    methods: [
      { slug: 'dot-voting', name: 'Dot Voting', duration: '5-10 min', difficulty: 'easy' },
      { slug: 'fist-of-five', name: 'Fist of Five', duration: '5 min', difficulty: 'easy' },
      { slug: 'gradients-of-agreement', name: 'Gradients of Agreement', duration: '10-15 min', difficulty: 'medium' },
      { slug: 'decision-matrix', name: 'Decision Matrix', duration: '30-60 min', difficulty: 'medium' },
    ],
  },
  {
    category: 'Ideation & Brainstorming',
    icon: 'carbon:idea',
    description: 'Generate creative ideas and solutions',
    methods: [
      { slug: 'crazy-eights', name: 'Crazy Eights', duration: '8 min', difficulty: 'easy' },
      { slug: 'how-might-we', name: 'How Might We', duration: '15-30 min', difficulty: 'easy' },
      { slug: 'scamper', name: 'SCAMPER', duration: '30-45 min', difficulty: 'medium' },
      { slug: 'six-thinking-hats', name: 'Six Thinking Hats', duration: '30-60 min', difficulty: 'medium' },
    ],
  },
  {
    category: 'Feedback & Retrospective',
    icon: 'carbon:review',
    description: 'Reflect, learn, and improve together',
    methods: [
      { slug: 'start-stop-continue', name: 'Start-Stop-Continue', duration: '15-30 min', difficulty: 'easy' },
      { slug: 'sailboat-retro', name: 'Sailboat Retrospective', duration: '45-60 min', difficulty: 'easy' },
      { slug: 'four-ls', name: '4Ls (Liked, Learned, Lacked, Longed For)', duration: '30-45 min', difficulty: 'easy' },
      { slug: 'rose-thorn-bud', name: 'Rose, Thorn, Bud', duration: '15-30 min', difficulty: 'easy' },
    ],
  },
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100',
};

export default function MethodsPage() {
  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Facilitation Methods
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Step-by-step instructions for running effective workshops and meetings.
          Each method includes timing, tips, and variations.
        </p>
      </header>

      {/* Method Categories */}
      <div className="space-y-12">
        {methodCategories.map((category) => (
          <section key={category.category}>
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 rounded-lg bg-muted">
                <Icon icon={category.icon} className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{category.category}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.methods.map((method) => (
                <Link key={method.slug} href={`/methods/${method.slug}`}>
                  <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between">
                        {method.name}
                        <Icon
                          icon="carbon:arrow-right"
                          className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Icon icon="carbon:time" className="h-3 w-3 mr-1" />
                          {method.duration}
                        </Badge>
                        <Badge className={`text-xs ${difficultyColors[method.difficulty as keyof typeof difficultyColors]}`}>
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
