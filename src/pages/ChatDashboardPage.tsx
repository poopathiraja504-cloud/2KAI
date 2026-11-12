import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { KnowledgeBaseModal } from '../components/KnowledgeBaseModal';
import { useAuth } from '../context/AuthContext';
import {
  getUserConversations,
  createConversation,
  getConversationMessages,
  addMessage,
  updateMessage,
  renameConversation,
  deleteConversation,
} from '../services/chatService';
import { streamAIChat } from '../services/aiService';
import type { Conversation, ChatMessage as ChatMessageType } from '../types';
import {
  Menu,
  Plus,
  BookOpen,
  RotateCw,
  AlertTriangle,
  HelpCircle,
  Languages,
  Atom,
  Building2,
  Code2
} from 'lucide-react';

export const ChatDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Knowledge Base State
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load user conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (user && activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const convList = await getUserConversations(user.uid);
      setConversations(convList);
      if (convList.length > 0 && !activeConversationId) {
        setActiveConversationId(convList[0].conversationId);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadMessages = async (convId: string) => {
    if (!user) return;
    try {
      const msgList = await getConversationMessages(user.uid, convId);
      // Filter out any accidentally empty messages
      setMessages(msgList.filter((m) => (m.content && m.content.trim().length > 0) || m.image));
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const newConv = await createConversation(user.uid, 'New Conversation');
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.conversationId);
      setMessages([]);
      setInput('');
      setBackendError(null);
    } catch (err) {
      console.error('Error creating new conversation:', err);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setBackendError(null);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    if (!user) return;
    try {
      await renameConversation(user.uid, id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.error('Error renaming conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!user) return;
    try {
      await deleteConversation(user.uid, id);
      const remaining = conversations.filter((c) => c.conversationId !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].conversationId);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleSend = async (
    customPrompt?: string,
    attachedImage?: { mimeType: string; data: string }
  ) => {
    const textToSend = customPrompt !== undefined ? customPrompt : input.trim();
    if ((!textToSend && !attachedImage) || !user || isLoading) return;

    setInput('');
    setBackendError(null);
    setIsLoading(true);

    let currentConvId = activeConversationId;

    // Create a new conversation if none is active
    if (!currentConvId) {
      try {
        const titleSnippet = (textToSend || 'Visual Document Analysis').slice(0, 30);
        const newConv = await createConversation(user.uid, titleSnippet);
        currentConvId = newConv.conversationId;
        setActiveConversationId(newConv.conversationId);
        setConversations((prev) => [newConv, ...prev]);
      } catch (err) {
        console.error('Failed to create conversation:', err);
        setIsLoading(false);
        return;
      }
    }

    // 1. Add User Message to Firestore and state
    let userMessage: ChatMessageType;
    try {
      userMessage = await addMessage(
        user.uid,
        currentConvId,
        'user',
        textToSend || 'Please analyze this visual input.',
        'sent',
        attachedImage
      );
      setMessages((prev) => [...prev, userMessage]);
    } catch (err) {
      console.error('Failed to save user message:', err);
      userMessage = {
        messageId: 'temp-' + Date.now(),
        role: 'user',
        content: textToSend || 'Please analyze this visual input.',
        createdAt: new Date().toISOString(),
        status: 'sent',
        image: attachedImage,
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    // 2. Prepare Placeholder AI message in state
    const tempAssistantId = 'asst-' + Date.now();
    const assistantPlaceholder: ChatMessageType = {
      messageId: tempAssistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'streaming',
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    // 3. Prepare full conversation history for context
    const historyPayload = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 4. Stream AI Response from Backend
    let streamedContent = '';
    try {
      const selectedModel = localStorage.getItem('2kai_selected_model') || 'gemini-1.5-flash';
      const customSystemPrompt = localStorage.getItem('2kai_system_prompt') || '';

      await streamAIChat({
        messages: historyPayload,
        model: selectedModel,
        systemPrompt: customSystemPrompt,
        image: attachedImage,
        useKnowledgeBase,
        onChunk: (_chunk, accumulated) => {
          streamedContent = accumulated;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.messageId === tempAssistantId
                ? { ...msg, content: accumulated, status: 'streaming' }
                : msg
            )
          );
        },
        onError: (err) => {
          console.error('Stream error:', err);
          setBackendError(err.message || 'Error communicating with intelligence provider.');
        },
      });

      // Guard: Ensure response is never blank
      if (!streamedContent || streamedContent.trim().length === 0) {
        streamedContent = `I have received and processed your inquiry. If you'd like more details on this topic, feel free to ask a follow-up or rephrase!`;
      }

      // 5. Save the completed AI response to Firestore
      if (user && currentConvId) {
        const savedAssistantMsg = await addMessage(
          user.uid,
          currentConvId,
          'assistant',
          streamedContent,
          'received'
        );
        // Replace temporary assistant message with saved message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === tempAssistantId ? savedAssistantMsg : msg
          )
        );
      }
    } catch (err: any) {
      console.error('Failed AI generation:', err);
      const fallbackMsg =
        streamedContent.trim().length > 0
          ? streamedContent
          : 'I encountered an issue processing your request. Please click Regenerate to retry, or check your API key in Settings.';

      setBackendError(err.message || 'Stream connection issue.');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === tempAssistantId
            ? {
                ...msg,
                content: fallbackMsg,
                status: 'error',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      loadConversations();
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || isLoading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content, lastUserMsg.image);
    }
  };

  const promptSuggestions = [
    {
      title: 'SRIT Meaning & College',
      desc: 'Institutions, affiliations, accreditation & Tamil explanation',
      icon: Building2,
      prompt: 'srit meaning',
    },
    {
      title: 'Explain Photosynthesis',
      desc: 'Chemical formula, light reactions & Calvin cycle',
      icon: Atom,
      prompt: 'explain photosynthesis',
    },
    {
      title: 'Tamil Translation',
      desc: 'Translate greeting and contextual usage',
      icon: Languages,
      prompt: 'translate hello into Tamil',
    },
    {
      title: 'What is AI?',
      desc: 'Machine learning, deep learning, NLP and AGI',
      icon: HelpCircle,
      prompt: 'what is AI?',
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-light-chat dark:bg-dark-chat text-light-text dark:text-dark-text transition-colors">
      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        useKnowledgeBase={useKnowledgeBase}
        onToggleKnowledgeBase={setUseKnowledgeBase}
      />

      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg lg:hidden text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-850"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-space font-bold text-sm tracking-tight text-black dark:text-white uppercase">
                2KAI
              </span>
              <span className="text-[11px] font-mono text-light-muted dark:text-dark-muted hidden sm:inline truncate max-w-xs">
                / {conversations.find((c) => c.conversationId === activeConversationId)?.title || 'Intelligence Canvas'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Knowledge Base Button */}
            <button
              type="button"
              onClick={() => setIsKnowledgeModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider border transition-colors ${
                useKnowledgeBase
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                  : 'border-light-border dark:border-dark-border hover:bg-mono-200 dark:hover:bg-mono-850'
              }`}
              title="Manage Uploaded Books & Knowledge Base"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Books / RAG</span>
            </button>

            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider border border-light-border dark:border-dark-border hover:bg-mono-200 dark:hover:bg-mono-850 transition-colors"
              title="New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Thread</span>
            </button>
          </div>
        </header>

        {/* Chat Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {backendError && (
            <div className="max-w-4xl mx-auto m-4 p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input flex items-center justify-between text-xs text-light-text dark:text-dark-text">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{backendError}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1 text-[11px] font-mono uppercase underline hover:opacity-80"
                >
                  <RotateCw className="w-3 h-3" />
                  Retry
                </button>
                <button
                  onClick={() => setBackendError(null)}
                  className="text-[11px] font-mono uppercase hover:opacity-80"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-12 text-center select-none">
              <div className="w-16 h-16 rounded-2xl border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-space font-bold text-2xl shadow-lg mb-6">
                2K
              </div>
              <h1 className="font-space font-bold text-3xl sm:text-4xl text-black dark:text-white uppercase tracking-tight mb-2">
                What can I help you with today?
              </h1>
              <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted font-inter max-w-md mb-8">
                2KAI intelligent assistant: Ask questions, analyze books, speak via microphone, or attach diagrams.
              </p>

              {/* Prompt Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {promptSuggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:bg-mono-200 dark:hover:bg-mono-850 hover:border-black dark:hover:border-white transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-black dark:text-white" />
                        <span className="font-space font-semibold text-xs text-black dark:text-white uppercase">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted leading-relaxed font-inter">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Messages Stream */
            <div className="py-4 space-y-1">
              {messages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === 'assistant' && index === messages.length - 1;
                return (
                  <ChatMessage
                    key={msg.messageId || index}
                    message={msg}
                    isLastAssistant={isLastAssistant}
                    onRegenerate={handleRegenerate}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar with Image, Voice & Book controls */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={(img) => handleSend(undefined, img)}
          isLoading={isLoading}
          onStop={() => {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
            setIsLoading(false);
          }}
          onOpenKnowledgeBase={() => setIsKnowledgeModalOpen(true)}
          useKnowledgeBase={useKnowledgeBase}
        />
      </main>
    </div>
  );
};
