'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Icon icon="carbon:education" className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">metodic.education</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/problems"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Problems
            </Link>
            <Link
              href="/methods"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Methods
            </Link>
            <Link
              href="/frameworks"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Frameworks
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <a
              href={process.env.NEXT_PUBLIC_METODIC_APP_URL || 'https://metodic.io'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Icon icon="carbon:rocket" className="h-4 w-4" />
              Build a Session
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
