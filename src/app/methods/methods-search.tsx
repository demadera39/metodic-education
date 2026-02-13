'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Method {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  duration_range: string | null;
  difficulty: Difficulty;
  keywords: string[];
}

interface CategoryGroup {
  category: string;
  icon: string;
  description: string;
  methods: Method[];
}

interface MethodsSearchProps {
  categoryGroups: CategoryGroup[];
  totalMethods: number;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-100',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100',
};

export function MethodsSearch({ categoryGroups, totalMethods }: MethodsSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | Difficulty>('all');
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long' | 'unknown'>('all');

  const categoryOptions = useMemo(
    () => ['all', ...categoryGroups.map((category) => category.category)],
    [categoryGroups]
  );

  const parseMaxMinutes = (durationRange: string | null): number | null => {
    if (!durationRange) return null;
    const matches = durationRange.match(/\d+/g);
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
        methods: category.methods.filter(method =>
          (!hasQuery ||
            method.name.toLowerCase().includes(query) ||
            (method.description && method.description.toLowerCase().includes(query)) ||
            (method.keywords && method.keywords.some(kw => kw.toLowerCase().includes(query)))) &&
          (selectedDifficulty === 'all' || method.difficulty === selectedDifficulty) &&
          (() => {
            if (selectedDuration === 'all') return true;
            const maxMinutes = parseMaxMinutes(method.duration_range);
            if (selectedDuration === 'unknown') return maxMinutes === null;
            if (maxMinutes === null) return false;
            if (selectedDuration === 'short') return maxMinutes <= 15;
            if (selectedDuration === 'medium') return maxMinutes > 15 && maxMinutes <= 60;
            return maxMinutes > 60;
          })()
        ),
      }))
      .filter(category => category.methods.length > 0);
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDuration, categoryGroups]);

  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.methods.length, 0);
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedDuration !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
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
            placeholder="Search methods... (e.g., 'voting', 'brainstorm', 'retro')"
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
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | Difficulty)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All difficulty levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value as 'all' | 'short' | 'medium' | 'long' | 'unknown')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All durations</option>
            <option value="short">Short (up to 15 min)</option>
            <option value="medium">Medium (16 to 60 min)</option>
            <option value="long">Long (60+ min)</option>
            <option value="unknown">Duration unknown</option>
          </select>
        </div>
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {filteredCount} of {totalMethods} methods
            <button onClick={clearAllFilters} className="ml-3 text-primary hover:underline">
              Clear all filters
            </button>
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
                    <Card className="h-full hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-start justify-between gap-2 min-w-0">
                          <span className="line-clamp-2 break-words min-w-0">{method.name}</span>
                          <Icon
                            icon="carbon:arrow-right"
                            className="h-4 w-4 flex-shrink-0 mt-1 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                          />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                          {method.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                          {method.duration_range && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              <Icon icon="carbon:time" className="h-3 w-3 mr-1" />
                              {method.duration_range}
                            </Badge>
                          )}
                          {method.difficulty && (
                            <Badge className={`text-xs whitespace-nowrap ${difficultyColors[method.difficulty]}`}>
                              {method.difficulty.charAt(0).toUpperCase() + method.difficulty.slice(1)}
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
          <h3 className="text-lg font-medium mb-2">No methods found</h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term or browse all methods
          </p>
          <button onClick={clearAllFilters} className="text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
