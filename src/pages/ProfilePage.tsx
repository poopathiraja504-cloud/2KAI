import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateUserProfileData, logoutUser } from '../services/authService';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Key,
  CheckCircle2,
  XCircle,
  Save,
  LogOut,
  ArrowLeft,
  Camera,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [language, setLanguage] = useState(userProfile?.language || 'en');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateUserProfileData(user.uid, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
        language,
        preferredTheme: theme,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const registrationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString()
    : 'Active Member';

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
            User Profile
          </h1>
          <p className="text-xs text-light-muted dark:text-dark-muted font-inter mt-1">
            Cryptographic identity & session settings
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs text-light-text dark:text-dark-text">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar text-xs text-black dark:text-white font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Profile attributes synchronized to Firestore successfully.
          </div>
        )}

        {/* Identity Overview Card */}
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input flex items-center justify-center overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-light-muted dark:text-dark-muted" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-space font-bold text-xl text-black dark:text-white">
                {userProfile?.fullName || user?.displayName || 'Authenticated User'}
              </div>
              <div className="text-xs text-light-muted dark:text-dark-muted font-mono">
                {user?.email}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-light-border dark:border-dark-border text-[11px] font-mono uppercase mt-1">
                {user?.emailVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-black dark:text-white" />
                    <span>Email Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-light-muted dark:text-dark-muted" />
                    <span>Unverified Email</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cryptographic Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-light-border dark:border-dark-border text-xs font-mono">
            <div className="space-y-1">
              <span className="text-light-muted dark:text-dark-muted uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3" />
                Firebase UID
              </span>
              <p className="truncate text-light-text dark:text-dark-text select-all">
                {user?.uid || 'Unknown'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-light-muted dark:text-dark-muted uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Auth Provider
              </span>
              <p className="text-light-text dark:text-dark-text">
                {user?.providerData[0]?.providerId || 'password'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-light-muted dark:text-dark-muted uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Registration Timestamp
              </span>
              <p className="text-light-text dark:text-dark-text">{registrationDate}</p>
            </div>

            <div className="space-y-1">
              <span className="text-light-muted dark:text-dark-muted uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                Account Status
              </span>
              <p className="text-light-text dark:text-dark-text uppercase">
                {userProfile?.accountStatus || 'active'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 sm:p-8 space-y-6">
          <h2 className="font-space font-semibold text-lg uppercase text-black dark:text-white">
            Editable Identity Attributes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Display Name"
                className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                  bg-light-input border-light-border text-light-text
                  dark:bg-dark-input dark:border-dark-border dark:text-dark-text
                  focus:border-black dark:focus:border-white font-inter"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Avatar Photo URL
              </label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                  bg-light-input border-light-border text-light-text
                  dark:bg-dark-input dark:border-dark-border dark:text-dark-text
                  focus:border-black dark:focus:border-white font-inter"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                System Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border text-xs outline-none transition-colors
                  bg-light-input border-light-border text-light-text
                  dark:bg-dark-input dark:border-dark-border dark:text-dark-text
                  focus:border-black dark:focus:border-white font-inter"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Preferred Monochrome Theme
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 rounded-lg border text-xs font-mono uppercase flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-muted dark:text-dark-muted'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 rounded-lg border text-xs font-mono uppercase flex items-center justify-center gap-2 transition-all ${
                    theme === 'light'
                      ? 'border-black bg-black text-white font-semibold'
                      : 'border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-light-muted dark:text-dark-muted'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light Mode
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Synchronizing...' : 'Save Profile Changes'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-xs font-mono uppercase tracking-wider hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

