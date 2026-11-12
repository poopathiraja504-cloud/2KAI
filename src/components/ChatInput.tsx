import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  BookOpen,
  Globe
} from 'lucide-react';
import { isSpeechRecognitionSupported } from '../utils/speech';

interface AttachedImage {
  mimeType: string;
  data: string; // base64
  name: string;
}

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (image?: { mimeType: string; data: string }) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
  onOpenKnowledgeBase?: () => void;
  useKnowledgeBase?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  placeholder = 'Message 2KAI...',
  onOpenKnowledgeBase,
  useKnowledgeBase = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechLang, setSpeechLang] = useState<'en-US' | 'ta-IN'>('en-US');
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle Speech-to-Text setup
  const toggleSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Image size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        mimeType: file.type,
        data: reader.result as string,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || attachedImage) && !isLoading) {
        handleTriggerSend();
      }
    }
  };

  const handleTriggerSend = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    const imgPayload = attachedImage ? { mimeType: attachedImage.mimeType, data: attachedImage.data } : undefined;
    onSend(imgPayload);
    setAttachedImage(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 pt-2">
      {/* Attached Image Thumbnail Preview */}
      {attachedImage && (
        <div className="mb-2 inline-flex items-center gap-2 p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow-sm animate-fadeIn">
          <img
            src={attachedImage.data}
            alt="Preview"
            className="w-12 h-12 object-cover rounded-lg border border-light-border dark:border-dark-border"
          />
          <div className="max-w-[180px]">
            <div className="text-xs font-space font-medium text-black dark:text-white truncate">
              {attachedImage.name}
            </div>
            <div className="text-[10px] font-mono text-light-muted dark:text-dark-muted">
              Ready for vision analysis
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-md text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={`relative flex flex-col rounded-2xl border transition-all duration-200
          bg-light-input border-light-border dark:bg-dark-input dark:border-dark-border
          focus-within:border-black dark:focus-within:border-white shadow-sm ${
            isRecording ? 'ring-2 ring-black dark:ring-white' : ''
          }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? 'Listening... speak in English or Tamil' : placeholder}
          rows={1}
          className="w-full resize-none bg-transparent px-4 py-3.5 text-sm outline-none font-inter
            text-light-text placeholder-light-muted dark:text-dark-text dark:placeholder-dark-muted
            max-h-[200px] leading-relaxed"
        />

        {/* Toolbar Bar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />

            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
              title="Attach Image (Vision Analysis)"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Voice Assistant Microphone Button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                  isRecording
                    ? 'bg-black text-white dark:bg-white dark:text-black animate-pulse font-semibold'
                    : 'text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800'
                }`}
                title={isRecording ? 'Stop recording voice' : `Ask with voice (${speechLang === 'ta-IN' ? 'Tamil' : 'English'})`}
              >
                {isRecording ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording && <span className="text-[10px] font-mono uppercase pr-1">Listening</span>}
              </button>

              {/* Language Selector for Speech */}
              <button
                type="button"
                onClick={() => setSpeechLang((prev) => (prev === 'en-US' ? 'ta-IN' : 'en-US'))}
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white ml-1"
                title="Toggle Voice Recognition Language (English / Tamil)"
              >
                {speechLang === 'ta-IN' ? 'தமிழ்' : 'EN'}
              </button>
            </div>

            {/* Knowledge Base Modal Trigger */}
            {onOpenKnowledgeBase && (
              <button
                type="button"
                onClick={onOpenKnowledgeBase}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors ${
                  useKnowledgeBase
                    ? 'border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card text-black dark:text-white font-medium'
                    : 'text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white'
                }`}
                title="Knowledge Base & Book Search"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Books</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all
                  bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-80"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerSend}
                disabled={!input.trim() && !attachedImage}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  input.trim() || attachedImage
                    ? 'bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 scale-100'
                    : 'bg-mono-200 text-mono-400 dark:bg-mono-800 dark:text-mono-600 cursor-not-allowed scale-95'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-light-muted dark:text-dark-muted mt-2 font-mono">
        2KAI v2.0 • MULTIMODAL INTELLIGENCE • VOICE + BOOKS + VISION
      </p>
    </div>
  );
};
