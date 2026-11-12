import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { applyEmailVerificationCode, resendVerificationEmail } from '../services/authService';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RotateCw } from 'lucide-react';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const oobCode = searchParams.get('oobCode') || '';
  const initialNotice = location.state?.message;

  const [isVerifying, setIsVerifying] = useState(Boolean(oobCode));
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (oobCode) {
      handleApplyCode(oobCode);
    }
  }, [oobCode]);

  const handleApplyCode = async (code: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      await applyEmailVerificationCode(code);
      setIsSuccess(true);
      await refreshProfile();
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError('This verification link is invalid or has expired.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    setError(null);
    try {
      await resendVerificationEmail();
      setResendStatus('A fresh verification link has been sent to your email address.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    await refreshProfile();
    if (user?.emailVerified) {
      setIsSuccess(true);
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
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="font-space font-bold text-2xl uppercase tracking-tight text-black dark:text-white">
              Email Verification
            </h1>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              {user ? `Verifying ${user.email}` : 'Firebase cryptographic email verification'}
            </p>
          </div>

          {initialNotice && !isSuccess && (
            <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar text-xs text-light-text dark:text-dark-text leading-relaxed">
              {initialNotice}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs text-light-text dark:text-dark-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resendStatus && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar text-xs text-light-text dark:text-dark-text">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{resendStatus}</span>
            </div>
          )}

          {isVerifying ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
              <div className="text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Validating Authorization Code...
              </div>
            </div>
          ) : isSuccess || user?.emailVerified ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-space font-semibold text-base text-black dark:text-white uppercase">
                  Email Confirmed
                </h3>
                <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
                  Your identity has been verified. You have unrestricted access to 2KAI intelligence.
                </p>
              </div>

              <Link
                to="/chat"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity"
              >
                <span>Launch 2KAI Chat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed font-inter">
                Please check your inbox and click the verification link sent by Firebase to confirm your account.
              </p>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <button
                  type="button"
                  onClick={handleRefreshStatus}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>I've Verified, Check Status</span>
                </button>

                <Link
                  to="/chat"
                  className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity text-center"
                >
                  Continue to Chat Anyway
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 text-center text-[10px] font-mono text-light-muted dark:text-dark-muted">
        2KAI VERIFICATION GATEWAY
      </footer>
    </div>
  );
};

