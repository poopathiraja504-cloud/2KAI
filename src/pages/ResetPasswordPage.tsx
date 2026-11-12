import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { verifyResetCode, confirmPasswordResetAction } from '../services/authService';
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Firebase email action links usually contain: ?mode=resetPassword&oobCode=...
  const oobCodeFromUrl = searchParams.get('oobCode') || searchParams.get('code') || '';

  const [oobCode, setOobCode] = useState(oobCodeFromUrl);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (oobCodeFromUrl) {
      verifyCode(oobCodeFromUrl);
    }
  }, [oobCodeFromUrl]);

  const verifyCode = async (code: string) => {
    setIsVerifyingCode(true);
    setError(null);
    try {
      const email = await verifyResetCode(code);
      setVerifiedEmail(email);
    } catch (err: any) {
      console.error('Code verification error:', err);
      setError('This password reset link is invalid or has expired. Please request a new one.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode.trim()) {
      setError('Please provide a reset code.');
      return;
    }
    verifyCode(oobCode.trim());
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await confirmPasswordResetAction(oobCode, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Logo size="md" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-space font-bold text-2xl uppercase tracking-tight text-black dark:text-white">
              Set New Password
            </h1>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              {verifiedEmail ? `Resetting password for ${verifiedEmail}` : 'Enter your reset code and choose a new password'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs text-light-text dark:text-dark-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-space font-semibold text-base text-black dark:text-white uppercase">
                  Password Updated
                </h3>
                <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
                  Your credentials have been securely updated in Firebase Authentication.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : !verifiedEmail && !oobCodeFromUrl ? (
            /* Manual Code Input Form */
            <form onSubmit={handleManualVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  Reset Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={oobCode}
                  onChange={(e) => setOobCode(e.target.value)}
                  placeholder="Paste code from email link"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                    bg-light-input border-light-border text-light-text placeholder-light-muted
                    dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                    focus:border-black dark:focus:border-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingCode}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                  bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 disabled:opacity-50"
              >
                <span>{isVerifyingCode ? 'Verifying Code...' : 'Verify Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* New Password Input Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                    bg-light-input border-light-border text-light-text placeholder-light-muted
                    dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                    focus:border-black dark:focus:border-white font-inter"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all
                  bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white underline underline-offset-4"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-[10px] font-mono text-light-muted dark:text-dark-muted">
        2KAI CRYPTOGRAPHIC AUTHORIZATION
      </footer>
    </div>
  );
};

