'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/metodic-logo.png"
            alt="Metodic"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-bold text-xl">
            METODIC <span className="text-muted-foreground font-normal">| learn</span>
          </span>
        </Link>

        <div className="hidden md:flex flex-1 justify-center pl-8 lg:pl-16">
          <nav className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/challenges"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Challenges
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
            <Link
              href="/playbooks"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Playbooks
            </Link>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-4">
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
