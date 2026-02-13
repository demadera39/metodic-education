import { Metadata } from 'next';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { FrameworksSearch } from './frameworks-search';
import { EmailSignupCta } from '@/components/marketing/EmailSignupCta';

export const metadata: Metadata = {
  title: 'Session Frameworks - Proven Structures for Better Outcomes | METODIC learn',
  description: 'Battle-tested frameworks that help teams make decisions, solve problems, and align on goals. Each framework addresses specific meeting challenges with proven step-by-step structures.',
  openGraph: {
    title: 'Session Frameworks - Proven Structures for Better Outcomes | METODIC learn',
    description: 'Battle-tested frameworks that help teams make decisions, solve problems, and align on goals.',
  },
};

interface Framework {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  typical_duration: string | null;
  when_to_use: string | null;
  best_for: string[] | null;
  phases: { name: string; description?: string; duration?: string }[];
}

interface CategoryGroup {
  category: string;
  icon: string;
  description: string;
  challenge: string; // What challenge this category addresses
  frameworks: Framework[];
}

// Map categories to challenge-focused messaging
const categoryConfig: Record<string, { icon: string; description: string; challenge: string }> = {
  decision: {
    icon: 'carbon:decision-tree',
    description: 'Make better decisions together',
    challenge: 'When your team struggles to reach consensus or decisions keep getting revisited'
  },
  'problem-solving': {
    icon: 'carbon:analytics',
    description: 'Tackle complex challenges systematically',
    challenge: 'When problems feel overwhelming or solutions don\'t stick'
  },
  retrospective: {
    icon: 'carbon:renew',
    description: 'Learn from experience and improve',
    challenge: 'When the team keeps making the same mistakes or needs to reflect'
  },
  alignment: {
    icon: 'carbon:compass',
    description: 'Get everyone moving together',
    challenge: 'When team members have different understandings of goals or priorities'
  },
  ideation: {
    icon: 'carbon:idea',
    description: 'Generate breakthrough ideas',
    challenge: 'When you need fresh thinking or creativity feels stuck'
  },
  strategic: {
    icon: 'carbon:chart-relationship',
    description: 'Plan for the future',
    challenge: 'When you need to set direction or make long-term plans'
  },
  learning: {
    icon: 'carbon:education',
    description: 'Help teams learn and grow',
    challenge: 'When knowledge needs to be shared or skills developed'
  },
  engagement: {
    icon: 'carbon:group',
    description: 'Get everyone participating',
    challenge: 'When meetings are dominated by a few voices or energy is low'
  },
  feedback: {
    icon: 'carbon:chat',
    description: 'Share perspectives constructively',
    challenge: 'When honest feedback is needed but conversations feel risky'
  },
  prioritization: {
    icon: 'carbon:list-numbered',
    description: 'Focus on what matters most',
    challenge: 'When everything seems urgent or the team can\'t agree on priorities'
  },
};

async function getFrameworks(): Promise<Framework[]> {
  const { data, error } = await supabase
    .from('learning_frameworks')
    .select('id, slug, name, category, description, typical_duration, when_to_use, best_for, phases')
    .eq('is_active', true)
    .order('name');

  if (error || !data) {
    console.error('Error fetching frameworks:', error);
    return [];
  }

  return data as Framework[];
}

function groupByCategory(frameworks: Framework[]): CategoryGroup[] {
  const groups: Record<string, Framework[]> = {};

  frameworks.forEach(framework => {
    const category = framework.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(framework);
  });

  // Sort by number of frameworks (most popular categories first)
  return Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([category, frameworks]) => {
      const config = categoryConfig[category] || {
        icon: 'carbon:folder',
        description: 'Structured approaches',
        challenge: 'When you need a proven structure'
      };
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
        icon: config.icon,
        description: config.description,
        challenge: config.challenge,
        frameworks,
      };
    });
}

export default async function FrameworksPage() {
  const frameworks = await getFrameworks();
  const categoryGroups = groupByCategory(frameworks);
  const totalFrameworks = frameworks.length;

  if (totalFrameworks === 0) {
    return (
      <div className="container py-12">
        <header className="mb-8">
          <Badge variant="secondary" className="mb-4">108+ proven structures</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Session Frameworks
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Battle-tested structures that guarantee your meetings produce real outcomes.
          </p>
        </header>

        <div className="text-center py-12">
          <Icon icon="carbon:model-alt" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Loading frameworks...</h3>
          <p className="text-muted-foreground mb-4">
            Check back in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <header className="mb-8">
        <Badge variant="secondary" className="mb-4">{totalFrameworks} proven structures</Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Session Frameworks
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Stop winging your meetings. These battle-tested structures have been refined by thousands of teams
          to guarantee outcomes — not just discussions.
        </p>
      </header>

      {/* Search - Client Component */}
      <FrameworksSearch
        categoryGroups={categoryGroups}
        totalFrameworks={totalFrameworks}
      />

      {/* Why Frameworks Matter - Challenge focused */}
      <section className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Why Structure Beats Winging It
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          The difference between a meeting that produces outcomes and one that wastes time? A proven framework.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:checkmark-outline" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Predictable Outcomes</h3>
            <p className="text-sm text-muted-foreground">
              Know exactly what you&apos;ll walk away with before the meeting starts. No more &quot;that could have been an email.&quot;
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:user-multiple" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Everyone Contributes</h3>
            <p className="text-sm text-muted-foreground">
              Good frameworks create space for all voices — not just the loudest. Structure creates psychological safety.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="carbon:time" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Respect Time</h3>
            <p className="text-sm text-muted-foreground">
              Frameworks keep discussions focused and on-track. Get to decisions faster without sacrificing quality.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 text-center">
        <Icon icon="carbon:build" className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">
          Don&apos;t Know Which Framework to Use?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          Tell Metodic your challenge and it will automatically select the right framework,
          combine it with proven methods, and build you a complete session agenda.
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

      <section className="mt-8 max-w-3xl">
        <EmailSignupCta
          compact
          source="frameworks-page"
          title="Get framework updates and news"
          description="Get updates and news about newly added session frameworks and application guides."
        />
      </section>
    </div>
  );
}
