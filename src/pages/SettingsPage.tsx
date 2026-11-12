import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserConversations, clearAllConversations } from '../services/chatService';
import { sendResetPasswordEmail } from '../services/authService';
import {
  ArrowLeft,
  Moon,
  Sun,
  Key,
  Cpu,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem('2kai_selected_model') || 'gemini-1.5-flash'
  );
  const [customApiKey, setCustomApiKey] = useState(
    () => localStorage.getItem('2kai_custom_api_key') || ''
  );
  const [systemPrompt, setSystemPrompt] = useState(
    () =>
      localStorage.getItem('2kai_system_prompt') ||
      'You are 2KAI, an elite, minimalist AI platform. Your answers are authoritative, deep, accurate, concise, and structured. Always respond with high precision and clarity.'
  );

  const [showApiKey, setShowApiKey] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('2kai_selected_model', selectedModel);
    localStorage.setItem('2kai_custom_api_key', customApiKey.trim());
    localStorage.setItem('2kai_system_prompt', systemPrompt.trim());

    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const convs = await getUserConversations(user.uid);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(convs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `2kai-conversations-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    if (
      window.confirm(
        'Are you sure you want to delete ALL conversations permanently? This action cannot be undone.'
      )
    ) {
      setIsClearing(true);
      try {
        await clearAllConversations(user.uid);
        alert('All conversations have been permanently cleared.');
      } catch (err) {
        console.error('Failed to clear conversations:', err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      await sendResetPasswordEmail(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.error('Reset email error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <header className="border-b border-light-border dark:border-dark-border px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Chat
          </Link>
          <span className="text-light-border dark:text-dark-border">/</span>
          <Logo size="sm" />
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="font-space font-bold text-3xl uppercase tracking-tight text-black dark:text-white">
            System Settings
          </h1>
          <p className="text-xs text-light-muted dark:text-dark-muted font-inter mt-1">
            Configure AI models, API keys, appearance, and memory controls
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar text-xs text-black dark:text-white font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Configuration saved successfully.
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Section: Appearance */}
          <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 sm:p-8 space-y-4">
            <h2 className="font-space font-semibold text-lg uppercase text-black dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Interface Theme
            </h2>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              2KAI strictly complies with a monochrome palette. Switch between Dark Mode and Light Mode.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                  theme === 'dark'
                    ? 'border-white bg-dark-input text-white'
                    : 'border-light-border dark:border-dark-border bg-light-input text-light-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black border border-white/20 flex items-center justify-center text-white">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-space font-semibold text-xs uppercase">Dark Mode (Default)</div>
                    <div className="text-[10px] opacity-70 font-mono">#080808 Surface</div>
                  </div>
                </div>
                {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                  theme === 'light'
                    ? 'border-black bg-light-input text-black'
                    : 'border-light-border dark:border-dark-border bg-dark-input text-dark-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-black/20 flex items-center justify-center text-black">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-space font-semibold text-xs uppercase">Light Mode</div>
                    <div className="text-[10px] opacity-70 font-mono">#FFFFFF Surface</div>
                  </div>
                </div>
                {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-black" />}
              </button>
            </div>
          </div>

          {/* Section: AI Intelligence Engine */}
          <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 sm:p-8 space-y-4">
            <h2 className="font-space font-semibold text-lg uppercase text-black dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Intelligence Engine Configuration
            </h2>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
              Select your reasoning model and customize API authorization.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  Model Variant
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                    bg-light-input border-light-border text-light-text
                    dark:bg-dark-input dark:border-dark-border dark:text-dark-text
                    focus:border-black dark:focus:border-white font-mono"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-fast, High Context)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Architecture & Reasoning)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen Multimodal Logic)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                    Custom Gemini API Key (Optional)
                  </label>
                  <span className="text-[10px] font-mono text-light-muted dark:text-dark-muted">
                    Never transmitted to third parties
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy... (Leave empty to use server default key)"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-xs outline-none transition-colors
                      bg-light-input border-light-border text-light-text placeholder-light-muted
                      dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                      focus:border-black dark:focus:border-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-light-muted dark:text-dark-muted pt-1">
                  You can get a free API key at{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-black dark:hover:text-white"
                  >
                    Google AI Studio
                  </a>
                  . If configured, 2KAI uses this key directly for your queries.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  System Persona & Operational Directive
                </label>
                <textarea
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                    bg-light-input border-light-border text-light-text
                    dark:bg-dark-input dark:border-dark-border dark:text-dark-text
                    focus:border-black dark:focus:border-white font-inter leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity"
              >
                Save Engine Configuration
              </button>
            </div>
          </div>
        </form>

        {/* Section: Data & Memory Management */}
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 sm:p-8 space-y-4">
          <h2 className="font-space font-semibold text-lg uppercase text-black dark:text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Memory & Persistence
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted font-inter">
            Export or erase your conversation history stored in Cloud Firestore.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export Chat History (JSON)'}</span>
            </button>

            <button
              type="button"
              onClick={handleClearAllHistory}
              disabled={isClearing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearing ? 'Clearing...' : 'Wipe All Conversations'}</span>
            </button>
          </div>
        </div>

        {/* Section: Security & Password */}
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 sm:p-8 space-y-4">
          <h2 className="font-space font-semibold text-lg uppercase text-black dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account Security
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <div className="text-xs font-semibold text-black dark:text-white uppercase font-space">
                Password Reset
              </div>
              <div className="text-[11px] text-light-muted dark:text-dark-muted font-inter">
                Send an official Firebase password reset email to {user?.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendResetEmail}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
            >
              {resetSent ? 'Email Dispatched!' : 'Trigger Reset Email'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

