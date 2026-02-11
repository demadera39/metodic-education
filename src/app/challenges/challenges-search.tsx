'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Challenge {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  solution_count: number;
  keywords: string[];
}

interface CategoryGroup {
  category: string;
  icon: string;
  challenges: Challenge[];
}

interface ChallengesSearchProps {
  categoryGroups: CategoryGroup[];
  totalChallenges: number;
}

export function ChallengesSearch({ categoryGroups, totalChallenges }: ChallengesSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryGroups;
    }

    const query = searchQuery.toLowerCase();

    return categoryGroups
      .map(category => ({
        ...category,
        challenges: category.challenges.filter(challenge =>
          challenge.title.toLowerCase().includes(query) ||
          (challenge.description && challenge.description.toLowerCase().includes(query)) ||
          (challenge.keywords && challenge.keywords.some(kw => kw.toLowerCase().includes(query)))
        ),
      }))
      .filter(category => category.challenges.length > 0);
  }, [searchQuery, categoryGroups]);

  const filteredCount = filteredCategories.reduce((acc, cat) => acc + cat.challenges.length, 0);

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
                          {challenge.solution_count || 0} solutions
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
    </>
  );
}
