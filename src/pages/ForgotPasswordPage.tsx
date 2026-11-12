import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { sendResetPasswordEmail } from '../services/authService';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendResetPasswordEmail(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Password reset email error:', err);
      let friendly = 'Could not send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        friendly = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        friendly = 'Invalid email address provided.';
      } else if (err.message) {
        friendly = err.message;
      }
      setError(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="font-space font-bold text-2xl uppercase tracking-tight text-black dark:text-white">
              Password Recovery
            </h1>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              Receive a cryptographic reset link directly to your inbox
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs text-light-text dark:text-dark-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-space font-semibold text-base text-black dark:text-white uppercase">
                  Reset Link Dispatched
                </h3>
                <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed font-inter">
                  We sent a verified Firebase password reset email to:
                  <br />
                  <span className="font-mono text-black dark:text-white font-medium">{email}</span>
                </p>
                <p className="text-[11px] text-light-muted dark:text-dark-muted pt-2 font-inter">
                  Click the link in the email to set your new password. Remember to check your spam/junk folder.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
                >
                  Resend Email
                </button>
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity text-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-xs outline-none transition-colors
                      bg-light-input border-light-border text-light-text placeholder-light-muted
                      dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                      focus:border-black dark:focus:border-white font-inter"
                  />
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-light-muted dark:text-dark-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                  bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 disabled:opacity-50"
              >
                <span>{isLoading ? 'Sending Link...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="p-6 text-center text-[10px] font-mono text-light-muted dark:text-dark-muted">
        2KAI IDENTITY MANAGEMENT • SECURE RESET FLOW
      </footer>
    </div>
  );
};

