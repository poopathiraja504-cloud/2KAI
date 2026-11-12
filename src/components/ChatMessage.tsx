import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  Copy,
  Check,
  RotateCw,
  User,
  Terminal,
  Volume2,
  Square,
  Pause,
  Play
} from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types';
import {
  speakText,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  isSpeechSynthesisSupported
} from '../utils/speech';

interface ChatMessageProps {
  message: ChatMessageType;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAssistant = false,
  onRegenerate,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (!isSpeechSynthesisSupported()) return;

    if (isPlayingAudio) {
      if (isAudioPaused) {
        resumeSpeaking();
        setIsAudioPaused(false);
      } else {
        pauseSpeaking();
        setIsAudioPaused(true);
      }
    } else {
      setIsPlayingAudio(true);
      setIsAudioPaused(false);
      speakText(
        message.content,
        () => setIsPlayingAudio(true),
        () => {
          setIsPlayingAudio(false);
          setIsAudioPaused(false);
        },
        () => {
          setIsPlayingAudio(false);
          setIsAudioPaused(false);
        }
      );
    }
  };

  const handleStopSpeak = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setIsAudioPaused(false);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group w-full py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-light-card/40 dark:bg-dark-card/40 border-y border-light-border/40 dark:border-dark-border/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full border border-light-border dark:border-dark-border bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText flex items-center justify-center font-mono text-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-space font-bold text-xs select-none shadow-sm">
              2K
            </div>
          )}
        </div>

        {/* Message Content & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-space font-semibold text-xs text-light-text dark:text-dark-text tracking-wide">
              {isUser ? 'You' : '2KAI Intelligence'}
            </span>
            <span className="text-[10px] font-mono text-light-muted dark:text-dark-muted">
              {formattedTime}
            </span>
            {message.status === 'streaming' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-mono-200 dark:bg-mono-800 text-light-text dark:text-dark-text animate-pulse">
                Reasoning...
              </span>
            )}
          </div>

          {/* User Attached Image (Multimodal Vision) */}
          {message.image && (
            <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-light-border dark:border-dark-border shadow-sm">
              <img
                src={message.image.data}
                alt="Attached visual document"
                className="w-full h-auto object-cover max-h-64 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.image?.data, '_blank')}
              />
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-light-text dark:text-dark-text leading-relaxed font-inter break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                h1: ({ children }) => (
                  <h1 className="font-space font-bold text-xl mb-3 text-black dark:text-white border-b border-light-border dark:border-dark-border pb-1">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-space font-semibold text-lg mb-2 text-black dark:text-white mt-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-space font-medium text-base mb-2 text-black dark:text-white mt-3">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-black dark:border-white pl-4 italic text-light-muted dark:text-dark-muted my-2">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 border border-light-border dark:border-dark-border rounded-lg">
                    <table className="min-w-full divide-y divide-light-border dark:divide-dark-border text-xs">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 bg-light-sidebar dark:bg-dark-sidebar font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 border-t border-light-border dark:border-dark-border">
                    {children}
                  </td>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="my-3 rounded-lg border border-light-border dark:border-dark-border overflow-hidden bg-light-card dark:bg-dark-card">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar text-[11px] font-mono text-light-muted dark:text-dark-muted">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3" />
                          {match ? match[1] : 'code'}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                          }}
                          className="hover:text-black dark:hover:text-white transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-xs font-mono">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code
                      className="px-1.5 py-0.5 rounded text-xs font-mono border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-black dark:text-white"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3 mt-3 pt-1 text-light-muted dark:text-dark-muted">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-mono-200 dark:hover:bg-mono-800 hover:text-black dark:hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Voice Read Aloud Button */}
            {!isUser && isSpeechSynthesisSupported() && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleSpeak}
                  className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors ${
                    isPlayingAudio
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'hover:bg-mono-200 dark:hover:bg-mono-800 hover:text-black dark:hover:text-white'
                  }`}
                  title={isPlayingAudio ? (isAudioPaused ? 'Resume Voice' : 'Pause Voice') : 'Read aloud with AI voice'}
                >
                  {isPlayingAudio ? (
                    isAudioPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isPlayingAudio ? (isAudioPaused ? 'Resume' : 'Pause') : 'Voice'}</span>
                </button>

                {isPlayingAudio && (
                  <button
                    onClick={handleStopSpeak}
                    className="p-1 rounded hover:bg-mono-200 dark:hover:bg-mono-800 hover:text-black dark:hover:text-white"
                    title="Stop playback"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                )}
              </div>
            )}

            {!isUser && isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-mono-200 dark:hover:bg-mono-800 hover:text-black dark:hover:text-white transition-colors"
                title="Regenerate response"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
