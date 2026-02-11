import Link from 'next/link';
import { Icon } from '@iconify/react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Icon icon="carbon:education" className="h-6 w-6 text-primary" />
              <span className="font-bold">metodic.education</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free resources for session leaders. Learn methods, solve problems, design better workshops.
            </p>
          </div>

          {/* Browse */}
          <div className="space-y-4">
            <h4 className="font-semibold">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/problems" className="hover:text-foreground transition-colors">
                  Common Problems
                </Link>
              </li>
              <li>
                <Link href="/methods" className="hover:text-foreground transition-colors">
                  Facilitation Methods
                </Link>
              </li>
              <li>
                <Link href="/frameworks" className="hover:text-foreground transition-colors">
                  Learning Frameworks
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Problems */}
          <div className="space-y-4">
            <h4 className="font-semibold">Popular Problems</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/problems/silent-meetings" className="hover:text-foreground transition-colors">
                  Silent Meetings
                </Link>
              </li>
              <li>
                <Link href="/problems/decision-deadlock" className="hover:text-foreground transition-colors">
                  Decision Deadlock
                </Link>
              </li>
              <li>
                <Link href="/problems/scope-creep" className="hover:text-foreground transition-colors">
                  Scope Creep
                </Link>
              </li>
              <li>
                <Link href="/problems/team-misalignment" className="hover:text-foreground transition-colors">
                  Team Misalignment
                </Link>
              </li>
            </ul>
          </div>

          {/* Metodic */}
          <div className="space-y-4">
            <h4 className="font-semibold">Metodic</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://metodic.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Build Sessions
                  <Icon icon="carbon:arrow-up-right" className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://metodic.io/recipes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Session Recipes
                  <Icon icon="carbon:arrow-up-right" className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://metodic.io/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  About
                  <Icon icon="carbon:arrow-up-right" className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Metodic. Free educational resources for session leaders.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/metodic_io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon icon="carbon:logo-x" className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/company/metodic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon icon="carbon:logo-linkedin" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
