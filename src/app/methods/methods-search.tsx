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

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryGroups;
    }

    const query = searchQuery.toLowerCase();

    return categoryGroups
      .map(category => ({
        ...category,
        methods: category.methods.filter(method =>
          method.name.toLowerCase().includes(query) ||
          (method.description && method.description.toLowerCase().includes(query)) ||
          (method.keywords && method.keywords.some(kw => kw.toLowerCase().includes(query)))
        ),
      }))
      .filter(category => category.methods.length > 0);
  }, [searchQuery, categoryGroups]);

  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.methods.length, 0);

  return (
    <>
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
                              {method.difficulty}
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
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
