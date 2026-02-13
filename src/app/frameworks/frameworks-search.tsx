'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  challenge: string;
  frameworks: Framework[];
}

interface FrameworksSearchProps {
  categoryGroups: CategoryGroup[];
  totalFrameworks: number;
}

export function FrameworksSearch({ categoryGroups, totalFrameworks }: FrameworksSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhases, setSelectedPhases] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long' | 'unknown'>('all');

  const categoryOptions = useMemo(
    () => ['all', ...categoryGroups.map((category) => category.category)],
    [categoryGroups]
  );

  const parseMaxMinutes = (durationText: string | null): number | null => {
    if (!durationText) return null;
    const matches = durationText.match(/\d+/g);
    if (!matches || matches.length === 0) return null;
    const values = matches.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
    if (values.length === 0) return null;
    return Math.max(...values);
  };

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const hasQuery = Boolean(searchQuery.trim());

    return categoryGroups
      .filter((category) => selectedCategory === 'all' || category.category === selectedCategory)
      .map(category => ({
        ...category,
        frameworks: category.frameworks.filter(framework =>
          (!hasQuery ||
            framework.name.toLowerCase().includes(query) ||
            (framework.description && framework.description.toLowerCase().includes(query)) ||
            (framework.when_to_use && framework.when_to_use.toLowerCase().includes(query)) ||
            (framework.best_for && framework.best_for.some(bf => bf.toLowerCase().includes(query))) ||
            category.category.toLowerCase().includes(query) ||
            category.challenge.toLowerCase().includes(query)) &&
          (() => {
            if (selectedPhases === 'all') return true;
            const count = framework.phases?.length || 0;
            if (selectedPhases === 'short') return count > 0 && count <= 3;
            if (selectedPhases === 'medium') return count >= 4 && count <= 5;
            return count >= 6;
          })() &&
          (() => {
            if (selectedDuration === 'all') return true;
            const maxMinutes = parseMaxMinutes(framework.typical_duration);
            if (selectedDuration === 'unknown') return maxMinutes === null;
            if (maxMinutes === null) return false;
            if (selectedDuration === 'short') return maxMinutes <= 60;
            if (selectedDuration === 'medium') return maxMinutes > 60 && maxMinutes <= 180;
            return maxMinutes > 180;
          })()
        ),
      }))
      .filter(category => category.frameworks.length > 0);
  }, [searchQuery, selectedCategory, selectedPhases, selectedDuration, categoryGroups]);

  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.frameworks.length, 0);
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'all' ||
    selectedPhases !== 'all' ||
    selectedDuration !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPhases('all');
    setSelectedDuration('all');
  };

  return (
    <>
      {/* Search */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Icon
            icon="carbon:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search by challenge... (e.g., 'can't decide', 'alignment', 'retro')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 max-w-3xl">
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
            value={selectedPhases}
            onChange={(e) => setSelectedPhases(e.target.value as 'all' | 'short' | 'medium' | 'long')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Any phase count</option>
            <option value="short">Up to 3 phases</option>
            <option value="medium">4 to 5 phases</option>
            <option value="long">6+ phases</option>
          </select>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value as 'all' | 'short' | 'medium' | 'long' | 'unknown')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Any duration</option>
            <option value="short">Short (up to 60 min)</option>
            <option value="medium">Medium (61 to 180 min)</option>
            <option value="long">Long (180+ min)</option>
            <option value="unknown">Duration unknown</option>
          </select>
        </div>
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredCount} of {totalFrameworks} frameworks
            <button onClick={clearAllFilters} className="ml-3 text-primary hover:underline">
              Clear all filters
            </button>
          </p>
        )}
      </div>

      {/* Framework Categories */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <section key={category.category}>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon icon={category.icon} className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-semibold">{category.category}</h2>
                    <Badge variant="secondary">{category.frameworks.length}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{category.challenge}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.frameworks.map((framework) => (
                  <Link key={framework.slug} href={`/frameworks/${framework.slug}`}>
                    <Card className="h-full hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1 break-words min-w-0">
                            {framework.name}
                          </CardTitle>
                          <Icon
                            icon="carbon:arrow-right"
                            className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="overflow-hidden">
                        {framework.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 break-words">
                            {framework.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {framework.typical_duration && (
                            <Badge variant="outline" className="text-xs truncate max-w-full">
                              <Icon icon="carbon:time" className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{framework.typical_duration}</span>
                            </Badge>
                          )}
                          {framework.phases && framework.phases.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Icon icon="carbon:flow" className="h-3 w-3 mr-1 flex-shrink-0" />
                              {framework.phases.length} phases
                            </Badge>
                          )}
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
            Try describing your challenge differently or browse all frameworks
          </p>
          <button onClick={clearAllFilters} className="text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
