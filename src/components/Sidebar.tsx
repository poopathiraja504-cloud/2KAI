import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import type { Conversation } from '../types';
import {
  Plus,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  User,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  isOpen,
  onCloseMobile,
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.conversationId);
    setEditTitle(c.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation permanently?')) {
      onDeleteConversation(id);
    }
    setActiveMenuId(null);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col w-72 h-full border-r transition-transform duration-300 ease-in-out
          bg-light-sidebar border-light-border dark:bg-dark-sidebar dark:border-dark-border
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <Logo size="md" linkTo="/chat" />
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md lg:hidden text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all
              bg-light-btn text-light-btnText hover:opacity-90
              dark:bg-dark-btn dark:text-dark-btnText"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Conversation
            </span>
            <span className="text-[10px] opacity-60 font-mono">⌘N</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-light-muted dark:text-dark-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border transition-colors outline-none
                bg-light-input border-light-border text-light-text placeholder-light-muted
                dark:bg-dark-input dark:border-dark-border dark:text-dark-text dark:placeholder-dark-muted
                focus:border-black dark:focus:border-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-light-muted dark:text-dark-muted px-2 py-1">
            Recent Intelligence Threads
          </div>

          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-light-muted dark:text-dark-muted px-4">
              {searchTerm ? 'No matching threads found.' : 'No conversations yet. Start a new chat above.'}
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = c.conversationId === activeConversationId;
              const isEditing = editingId === c.conversationId;

              return (
                <div
                  key={c.conversationId}
                  className={`group relative flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer
                    ${
                      isActive
                        ? 'bg-light-card border border-light-border text-black font-medium dark:bg-dark-card dark:border-dark-border dark:text-white'
                        : 'text-light-muted hover:text-light-text hover:bg-mono-200/50 dark:text-dark-muted dark:hover:text-dark-text dark:hover:bg-mono-900/50'
                    }`}
                  onClick={() => {
                    onSelectConversation(c.conversationId);
                    onCloseMobile();
                  }}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(c.conversationId, e)}
                        className="flex items-center gap-1 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="w-full bg-light-input dark:bg-dark-input border border-black dark:border-white px-1.5 py-0.5 rounded text-xs outline-none"
                        />
                        <button
                          type="submit"
                          className="p-0.5 text-black dark:text-white hover:opacity-80"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{c.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === c.conversationId ? null : c.conversationId);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-mono-300 dark:hover:bg-mono-800 transition-opacity"
                        title="Options"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
                      </button>

                      {activeMenuId === c.conversationId && (
                        <div
                          className="absolute right-0 top-6 z-30 w-32 rounded-md shadow-lg border py-1
                            bg-light-card border-light-border dark:bg-dark-card dark:border-dark-border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleStartRename(c, e)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-light-text dark:text-dark-text hover:bg-mono-200 dark:hover:bg-mono-850"
                          >
                            <Edit2 className="w-3 h-3" />
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(c.conversationId, e)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-light-text dark:text-dark-text hover:bg-mono-200 dark:hover:bg-mono-850"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Section: Profile, Settings, Logout */}
        <div className="p-3 border-t border-light-border dark:border-dark-border space-y-2">
          {/* Settings & Theme */}
          <div className="flex items-center justify-between px-2">
            <Link
              to="/settings"
              className={`flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white transition-colors ${
                location.pathname === '/settings' ? 'text-black dark:text-white font-medium' : ''
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
            <ThemeToggle />
          </div>

          {/* User Profile Bar */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-light-card border border-light-border dark:bg-dark-card dark:border-dark-border">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 overflow-hidden flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
                )}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-light-text dark:text-dark-text truncate">
                  {userProfile?.fullName || user?.displayName || 'User'}
                </div>
                <div className="text-[10px] text-light-muted dark:text-dark-muted truncate">
                  {user?.email || 'Authenticated'}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

