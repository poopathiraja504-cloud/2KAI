// Speech-to-Text and Text-to-Speech utilities for 2KAI

// Web Speech API interfaces
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.speechSynthesis);
}

// Clean markdown for natural text-to-speech reading
export function stripMarkdownForTTS(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#+\s+/g, '')
    .replace(/[*_~]+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\$\$[\s\S]*?\$\$/g, 'Formula omitted.')
    .replace(/\$[^$]+\$/g, 'Formula omitted.')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .trim();
}

// Detect if text contains Tamil characters
export function containsTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text);
}

// Global active audio utterance tracking
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  stopSpeaking();

  const cleanText = stripMarkdownForTTS(text);
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Language selection: Tamil if Tamil characters detected, otherwise English
  if (containsTamil(text)) {
    utterance.lang = 'ta-IN';
  } else {
    utterance.lang = 'en-US';
  }

  // Attempt to select optimal system voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

