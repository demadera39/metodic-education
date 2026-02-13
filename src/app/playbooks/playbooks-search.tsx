'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface PlaybookStep {
  phase?: string;
  time_window?: string;
  challenge_title?: string;
  method_name?: string;
  intervention?: string;
  script_template?: string;
}

interface PlaybookRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  organizational_challenge: string;
  summary: string | null;
  target_audience: string | null;
  estimated_duration: string | null;
  sequence: PlaybookStep[];
  generated_from: {
    transformation_horizon?: string;
    cadence?: string;
    review_checkpoint?: string;
  } | null;
}

interface PlaybooksSearchProps {
  playbooks: PlaybookRow[];
}

export function PlaybooksSearch({ playbooks }: PlaybooksSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHorizon, setSelectedHorizon] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');

  const categoryOptions = useMemo(
    () => ['all', ...Array.from(new Set(playbooks.map((p) => p.category).filter(Boolean))).sort()],
    [playbooks]
  );

  const horizonOptions = useMemo(
    () => [
      'all',
      ...Array.from(
        new Set(
          playbooks
            .map((p) => p.generated_from?.transformation_horizon)
            .filter((h): h is string => Boolean(h && h.trim()))
        )
      ).sort(),
    ],
    [playbooks]
  );

  const phaseOptions = useMemo(
    () => [
      'all',
      ...Array.from(
        new Set(
          playbooks.flatMap((p) =>
            (Array.isArray(p.sequence) ? p.sequence : [])
              .map((s) => s.phase)
              .filter((phase): phase is string => Boolean(phase && phase.trim()))
          )
        )
      ).sort(),
    ],
    [playbooks]
  );

  const filteredPlaybooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasQuery = Boolean(query);

    return playbooks.filter((playbook) => {
      if (selectedCategory !== 'all' && playbook.category !== selectedCategory) return false;

      const horizon = playbook.generated_from?.transformation_horizon || '';
      if (selectedHorizon !== 'all' && horizon !== selectedHorizon) return false;

      if (
        selectedPhase !== 'all' &&
        !(Array.isArray(playbook.sequence) ? playbook.sequence : []).some((step) => step.phase === selectedPhase)
      ) {
        return false;
      }

      if (!hasQuery) return true;

      const stepText = (Array.isArray(playbook.sequence) ? playbook.sequence : [])
        .map((step) =>
          [step.phase, step.time_window, step.challenge_title, step.method_name, step.intervention, step.script_template]
            .filter(Boolean)
            .join(' ')
        )
        .join(' ');

      const haystack = [
        playbook.title,
        playbook.summary,
        playbook.organizational_challenge,
        playbook.category,
        playbook.estimated_duration,
        playbook.target_audience,
        playbook.generated_from?.transformation_horizon,
        playbook.generated_from?.cadence,
        playbook.generated_from?.review_checkpoint,
        stepText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [playbooks, searchQuery, selectedCategory, selectedHorizon, selectedPhase]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || selectedCategory !== 'all' || selectedHorizon !== 'all' || selectedPhase !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedHorizon('all');
    setSelectedPhase('all');
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Icon
            icon="carbon:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search playbooks, phases, methods, outcomes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All categories' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedHorizon}
            onChange={(e) => setSelectedHorizon(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {horizonOptions.map((horizon) => (
              <option key={horizon} value={horizon}>
                {horizon === 'all' ? 'Any transformation horizon' : horizon}
              </option>
            ))}
          </select>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {phaseOptions.map((phase) => (
              <option key={phase} value={phase}>
                {phase === 'all' ? 'Any phase focus' : phase}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredPlaybooks.length} of {playbooks.length} playbooks
            <button onClick={clearAllFilters} className="ml-3 text-primary hover:underline">
              Clear all filters
            </button>
          </p>
        )}
      </div>

      {filteredPlaybooks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon icon="carbon:search" className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">No playbooks found</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Try a different search or filter combination.
            </p>
            <button onClick={clearAllFilters} className="text-sm text-primary hover:underline">
              Clear filters
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredPlaybooks.map((playbook) => {
            const stepCount = Array.isArray(playbook.sequence) ? playbook.sequence.length : 0;
            const horizon = playbook.generated_from?.transformation_horizon || null;
            const phases = Array.from(
              new Set(
                (Array.isArray(playbook.sequence) ? playbook.sequence : [])
                  .map((step) => step.phase)
                  .filter((phase): phase is string => Boolean(phase && phase.trim()))
              )
            );

            return (
              <Link key={playbook.id} href={`/playbooks/${playbook.slug}`}>
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
                      {playbook.summary || playbook.organizational_challenge}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{stepCount} steps</Badge>
                    {horizon && <Badge variant="outline">{horizon}</Badge>}
                    {playbook.category && <Badge variant="outline">{playbook.category}</Badge>}
                    {phases.slice(0, 2).map((phase) => (
                      <Badge key={phase} variant="outline">{phase}</Badge>
                    ))}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
