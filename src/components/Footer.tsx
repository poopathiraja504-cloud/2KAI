import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Logo size="md" showTagline={true} />
            <p className="mt-2 text-xs text-light-muted dark:text-dark-muted max-w-sm font-inter">
              Unrestricted high-reasoning intelligence platform built for precision, speed, and architectural clarity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-light-muted dark:text-dark-muted font-inter">
            <span>© {new Date().getFullYear()} 2KAI Inc.</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white inline-block"></span>
              All Systems Operational
            </span>
            <span>•</span>
            <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">
              Privacy Protocol
            </span>
            <span>•</span>
            <span className="hover:text-black dark:hover:text-white cursor-pointer transition-colors">
              Terms of Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

