import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/metodic-logo.png"
                alt="Metodic"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-bold">
                METODIC <span className="text-muted-foreground font-normal">| learn</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free facilitation knowledge for professionals. Learn methods, solve challenges, run better sessions.
            </p>
          </div>

          {/* Browse */}
          <div className="space-y-4">
            <h4 className="font-semibold">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/challenges" className="hover:text-foreground transition-colors">
                  Common Challenges
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
              <li>
                <Link href="/playbooks" className="hover:text-foreground transition-colors">
                  Playbooks
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Challenges */}
          <div className="space-y-4">
            <h4 className="font-semibold">Popular Challenges</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/challenges/silent-meetings" className="hover:text-foreground transition-colors">
                  Silent Meetings
                </Link>
              </li>
              <li>
                <Link href="/challenges/decision-deadlock" className="hover:text-foreground transition-colors">
                  Decision Deadlock
                </Link>
              </li>
              <li>
                <Link href="/challenges/scope-creep" className="hover:text-foreground transition-colors">
                  Scope Creep
                </Link>
              </li>
              <li>
                <Link href="/challenges/team-misalignment" className="hover:text-foreground transition-colors">
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
                  href="https://metodic.io/templates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Templates
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
            {new Date().getFullYear()} Metodic. Free facilitation knowledge for professionals.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/metodic-session-design/"
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
