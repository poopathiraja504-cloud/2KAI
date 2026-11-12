import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { loginWithEmail, signInWithGoogle } from '../services/authService';
import { Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/chat';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginWithEmail(email.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      let friendlyMsg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMsg = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMsg = 'Access temporarily restricted due to many failed attempts. Try again later or reset password.';
      } else if (err.message) {
        friendlyMsg = err.message;
      }
      setError(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="font-space font-bold text-2xl uppercase tracking-tight text-black dark:text-white">
              Sign In To 2KAI
            </h1>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              Access your persistent intelligence dashboard
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs text-light-text dark:text-dark-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input hover:bg-mono-200 dark:hover:bg-mono-850 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-light-border dark:border-dark-border w-full" />
            <span className="bg-light-card dark:bg-dark-card px-3 text-[10px] font-mono uppercase tracking-widest text-light-muted dark:text-dark-muted">
              or continue with email
            </span>
          </div>

          {/* Email Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                  bg-light-input border-light-border text-light-text placeholder-light-muted
                  dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                  focus:border-black dark:focus:border-white font-inter"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-xs outline-none transition-colors
                    bg-light-input border-light-border text-light-text placeholder-light-muted
                    dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                    focus:border-black dark:focus:border-white font-inter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-light-border dark:border-dark-border accent-black dark:accent-white"
              />
              <label htmlFor="remember-me" className="ml-2 text-xs text-light-muted dark:text-dark-muted cursor-pointer select-none">
                Remember authentication session
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-black dark:text-white underline underline-offset-4 hover:opacity-80"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="p-6 text-center text-[10px] font-mono text-light-muted dark:text-dark-muted">
        2KAI SECURE AUTH PROTOCOL • END-TO-END ISOLATION
      </footer>
    </div>
  );
};

