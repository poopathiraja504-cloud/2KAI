import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowRight, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-border dark:border-dark-border bg-light-bg/90 dark:bg-dark-bg/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
          >
            Overview
          </Link>
          <a
            href="#capabilities"
            className="text-sm font-medium text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
          >
            Capabilities
          </a>
          <a
            href="#security"
            className="text-sm font-medium text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
          >
            Security
          </a>
          <Link
            to="/chat"
            className="text-sm font-medium text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
          >
            Chat
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity"
              >
                Launch Chat
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full border border-light-border dark:border-dark-border flex items-center justify-center bg-light-card dark:bg-dark-card overflow-hidden hover:opacity-80 transition-opacity"
                title="Profile"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-black dark:text-white" />
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-light-text dark:text-dark-text hover:text-light-muted dark:hover:text-dark-muted transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-black dark:text-white hover:bg-mono-200 dark:hover:bg-mono-850"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg px-4 pt-3 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-light-text dark:text-dark-text py-2"
          >
            Overview
          </Link>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-light-text dark:text-dark-text py-2"
          >
            Capabilities
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-light-text dark:text-dark-text py-2"
          >
            Security
          </a>
          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-light-text dark:text-dark-text py-2"
          >
            Chat
          </Link>

          <div className="pt-4 border-t border-light-border dark:border-dark-border flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText"
                >
                  Launch Chat
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border border-light-border dark:border-dark-border"
                >
                  View Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border border-light-border dark:border-dark-border"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

