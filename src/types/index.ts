export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  uid: string;
  fullName: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  provider: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  loginCount: number;
  preferredTheme: ThemeMode;
  language: string;
  accountStatus: 'active' | 'suspended';
}

export interface Conversation {
  conversationId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  preview?: string;
  messageCount?: number;
}

export interface ChatMessage {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  status: 'sent' | 'received' | 'error' | 'streaming';
  image?: {
    mimeType: string;
    data: string; // base64 string
  };
}

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface IngestedDocument {
  docId: string;
  title: string;
  fileSize: number;
  mimetype: string;
  totalChunks: number;
  characterCount: number;
  uploadedAt: string;
}
