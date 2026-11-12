import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Shield,
  Zap,
  Database,
  Cpu,
  Lock,
  Terminal,
  CheckCircle2,
  ChevronRight,
  Compass
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 border-b border-light-border dark:border-dark-border">
        {/* Subtle monochrome geometric background grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-xs font-mono uppercase tracking-wider mb-8 text-light-muted dark:text-dark-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
            2KAI Intelligence Release 1.0
          </div>

          {/* Main Title */}
          <h1 className="font-space font-bold text-5xl sm:text-6xl md:text-8xl tracking-tighter text-black dark:text-white uppercase leading-none mb-6">
            Your Intelligence.<br />Without Limits.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-light-muted dark:text-dark-muted font-inter font-normal leading-relaxed mb-10">
            A high-reasoning AI chat platform engineered with zero distractions. Built for deep synthesis, complex code architecture, and uninhibited cognition.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/chat" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-all shadow-sm"
            >
              <span>{user ? "Enter 2KAI Chat" : "Get Started Without Limits"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
            >
              <span>Explore Interactive Interface</span>
            </Link>
          </div>

          {/* Interactive Interface Preview Mockup */}
          <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card overflow-hidden shadow-2xl text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-mono-400 dark:bg-mono-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-mono-400 dark:bg-mono-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-mono-400 dark:bg-mono-700" />
                <span className="ml-2 text-xs font-mono text-light-muted dark:text-dark-muted">2kai.ai/chat/active-session</span>
              </div>
              <div className="text-[11px] font-mono text-light-muted dark:text-dark-muted">
                MONOCHROME AI v1.0
              </div>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="p-6 space-y-6">
              {/* User message */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-xl rounded-2xl p-4 bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText text-xs font-inter leading-relaxed">
                  Analyze the concurrency limits of distributed event loops under heavy backpressure and give me an optimal architectural pattern.
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-space font-bold text-xs select-none flex-shrink-0">
                  2K
                </div>
                <div className="max-w-2xl rounded-2xl p-5 border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs font-inter leading-relaxed space-y-3">
                  <div className="font-space font-semibold text-black dark:text-white uppercase tracking-wider text-[11px]">
                    Analysis & Recommendation
                  </div>
                  <p>
                    When event loops saturate under unbounded ingestion, starvation cascades across I/O polling queues. Mitigating this requires decoupling ingestion from compute via a reactive token-bucket backpressure ring buffer.
                  </p>
                  <div className="border border-light-border dark:border-dark-border rounded-lg p-3 bg-light-sidebar dark:bg-dark-sidebar font-mono text-[11px] overflow-x-auto">
                    <code>{`// Zero-copy queue orchestration\nconst queue = new RingBuffer({ capacity: 65536, dropPolicy: 'backpressure-pause' });\nawait queue.pipeThrough(new ConcurrencyGate(32));`}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-24 border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-space font-bold text-3xl sm:text-5xl uppercase tracking-tight text-black dark:text-white mb-4">
              Engineered For Pure Depth
            </h2>
            <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted font-inter">
              Eliminating visual noise to accelerate pure reasoning. 2KAI strips away distractions to provide unbroken mental focus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card space-y-4">
              <div className="w-10 h-10 rounded-xl border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-space font-semibold text-lg text-black dark:text-white uppercase">
                High-Order Synthesis
              </h3>
              <p className="text-xs text-light-muted dark:text-dark-muted font-inter leading-relaxed">
                Connects complex logical primitives, writes robust software, and processes deep analytical queries without token truncation or superficial summaries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card space-y-4">
              <div className="w-10 h-10 rounded-xl border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-space font-semibold text-lg text-black dark:text-white uppercase">
                Persistent Firestore State
              </h3>
              <p className="text-xs text-light-muted dark:text-dark-muted font-inter leading-relaxed">
                Every thread, decision tree, and conversation is securely synchronized to Firestore with sub-second retrieval across every authenticated session.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card space-y-4">
              <div className="w-10 h-10 rounded-xl border border-black dark:border-white flex items-center justify-center text-black dark:text-white">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-space font-semibold text-lg text-black dark:text-white uppercase">
                Zero Data Cross-Talk
              </h3>
              <p className="text-xs text-light-muted dark:text-dark-muted font-inter leading-relaxed">
                Strict granular security rules verify that your data, prompts, and memory partitions belong exclusively to your cryptographic Firebase UID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Protocol */}
      <section id="security" className="py-24 border-b border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-xs font-mono uppercase text-light-muted dark:text-dark-muted">
                <Shield className="w-3.5 h-3.5" />
                Guaranteed Isolation
              </div>
              <h2 className="font-space font-bold text-3xl sm:text-5xl uppercase tracking-tight text-black dark:text-white">
                Cryptographic Security & Verification
              </h2>
              <p className="text-sm text-light-muted dark:text-dark-muted font-inter leading-relaxed">
                2KAI isolates frontend client execution from backend intelligence endpoints. Private keys are never bundled into client packages, and every database query is gated behind Firebase security rules.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
                  <span>Firebase OAuth2 & Email Verification Standard</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
                  <span>Granular Firestore access rule evaluation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
                  <span>Zero password exposure — Argon2 / Scrypt hashing via Google Auth</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
                  <span>Real-time SSE proxy with no client-side API key exposure</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card space-y-4 font-mono text-xs">
              <div className="text-[11px] text-light-muted dark:text-dark-muted uppercase tracking-widest border-b border-light-border dark:border-dark-border pb-2">
                Firestore Access Policy
              </div>
              <pre className="text-light-text dark:text-dark-text overflow-x-auto leading-relaxed">
{`service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /conversations/{conversationId} {
        allow read, write: if request.auth.uid == userId;
        
        match /messages/{messageId} {
          allow read, write: if request.auth.uid == userId;
        }
      }
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="font-space font-bold text-4xl sm:text-6xl uppercase tracking-tighter text-black dark:text-white">
            Experience 2KAI Now
          </h2>
          <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted font-inter max-w-xl mx-auto">
            Step into the next standard of minimalist AI interaction. No noise. No colors. Pure intelligence.
          </p>
          <div className="pt-4">
            <Link
              to={user ? "/chat" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-all shadow-md"
            >
              <span>{user ? "Launch 2KAI Chat" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

