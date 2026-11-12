import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { registerWithEmail, signInWithGoogle } from '../services/authService';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password validation
  const isLengthValid = password.length >= 8;
  const isMatchValid = password.length > 0 && password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (!isLengthValid) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (!isMatchValid) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerWithEmail(fullName.trim(), email.trim(), password);
      // Navigate to email verification with welcome indicator
      navigate('/verify-email', {
        state: { message: 'Account created successfully! We sent a verification email to your address.' },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      let friendlyMsg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMsg = 'Password is too weak. Please use a stronger password.';
      } else if (err.message) {
        friendlyMsg = err.message;
      }
      setError(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate('/chat');
    } catch (err: any) {
      console.error('Google Sign-Up error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      {/* Header */}
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

      {/* Main Registration Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="font-space font-bold text-2xl uppercase tracking-tight text-black dark:text-white">
              Initialize Account
            </h1>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              Join 2KAI for unlimited high-order reasoning
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
            onClick={handleGoogleSignup}
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
            <span>Sign Up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-light-border dark:border-dark-border w-full" />
            <span className="bg-light-card dark:bg-dark-card px-3 text-[10px] font-mono uppercase tracking-widest text-light-muted dark:text-dark-muted">
              or register with email
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                  bg-light-input border-light-border text-light-text placeholder-light-muted
                  dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                  focus:border-black dark:focus:border-white font-inter"
              />
            </div>

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
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                  bg-light-input border-light-border text-light-text placeholder-light-muted
                  dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                  focus:border-black dark:focus:border-white font-inter"
              />
            </div>

            {/* Live Requirements Indicator */}
            <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                {isLengthValid ? (
                  <CheckCircle className="w-3.5 h-3.5 text-black dark:text-white" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-light-border dark:border-dark-border" />
                )}
                <span className={isLengthValid ? 'text-black dark:text-white font-medium' : 'text-light-muted dark:text-dark-muted'}>
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isMatchValid ? (
                  <CheckCircle className="w-3.5 h-3.5 text-black dark:text-white" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-light-border dark:border-dark-border" />
                )}
                <span className={isMatchValid ? 'text-black dark:text-white font-medium' : 'text-light-muted dark:text-dark-muted'}>
                  Passwords match exactly
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLengthValid || !isMatchValid}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-black dark:text-white underline underline-offset-4 hover:opacity-80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-[10px] font-mono text-light-muted dark:text-dark-muted">
        2KAI • STRICT ISOLATION • CLOUD FIRESTORE SYNCHRONIZATION
      </footer>
    </div>
  );
};

