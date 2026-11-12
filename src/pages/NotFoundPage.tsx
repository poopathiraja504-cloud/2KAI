import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { ArrowLeft, Terminal } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Logo size="md" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
            <Terminal className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-space font-bold text-7xl sm:text-8xl text-black dark:text-white tracking-tighter">
              404
            </h1>
            <h2 className="font-space font-semibold text-xl uppercase tracking-tight text-black dark:text-white">
              Coordinate Not Found
            </h2>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter leading-relaxed max-w-xs mx-auto">
              The requested vector does not exist within the 2KAI namespace.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity"
            >
              <span>Launch Chat</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-[10px] font-mono text-light-muted dark:text-dark-muted">
        2KAI PROTOCOL • SYSTEM EXCEPTION 404
      </footer>
    </div>
  );
};

