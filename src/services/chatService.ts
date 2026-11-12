import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Conversation, ChatMessage } from '../types';

/**
 * Get all conversations for a specific user
 */
export async function getUserConversations(uid: string): Promise<Conversation[]> {
  try {
    const convRef = collection(db, 'users', uid, 'conversations');
    const q = query(convRef, orderBy('updatedAt', 'desc'), limit(50));
    const snap = await getDocs(q);

    const conversations: Conversation[] = [];
    snap.forEach((docSnap) => {
      conversations.push(docSnap.data() as Conversation);
    });

    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(
  uid: string,
  title: string = 'New Conversation'
): Promise<Conversation> {
  const convCol = collection(db, 'users', uid, 'conversations');
  const newDoc = doc(convCol);
  const conversationId = newDoc.id;
  const now = new Date().toISOString();

  const conversation: Conversation = {
    conversationId,
    title,
    createdAt: now,
    updatedAt: now,
    preview: '',
    messageCount: 0,
  };

  await setDoc(newDoc, conversation);
  return conversation;
}

/**
 * Get all messages for a specific conversation
 */
export async function getConversationMessages(
  uid: string,
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const msgCol = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
    const q = query(msgCol, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);

    const messages: ChatMessage[] = [];
    snap.forEach((docSnap) => {
      messages.push(docSnap.data() as ChatMessage);
    });

    return messages;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  uid: string,
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  status: 'sent' | 'received' | 'error' | 'streaming' = 'sent',
  image?: { mimeType: string; data: string }
): Promise<ChatMessage> {
  const msgCol = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
  const msgDoc = doc(msgCol);
  const messageId = msgDoc.id;
  const now = new Date().toISOString();

  const message: ChatMessage = {
    messageId,
    role,
    content,
    createdAt: now,
    status,
    ...(image ? { image } : {}),
  };

  await setDoc(msgDoc, message);

  // Update parent conversation preview and updatedAt
  try {
    const convRef = doc(db, 'users', uid, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);
    const existing = convSnap.data() as Conversation | undefined;

    const updates: Partial<Conversation> = {
      updatedAt: now,
      preview: content.slice(0, 80),
      messageCount: (existing?.messageCount || 0) + 1,
    };

    // Auto-update title if it's the first user message and title was default
    if (role === 'user' && (!existing?.title || existing.title === 'New Conversation')) {
      const generatedTitle = content.trim().slice(0, 32) + (content.length > 32 ? '...' : '');
      updates.title = generatedTitle;
    }

    await updateDoc(convRef, updates);
  } catch (err) {
    console.warn('Could not update parent conversation preview:', err);
  }

  return message;
}

/**
 * Update message content (e.g., after streaming completes or on error)
 */
export async function updateMessage(
  uid: string,
  conversationId: string,
  messageId: string,
  updates: Partial<ChatMessage>
): Promise<void> {
  try {
    const msgRef = doc(db, 'users', uid, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(msgRef, updates);
  } catch (error) {
    console.error('Error updating message:', error);
  }
}

/**
 * Rename a conversation
 */
export async function renameConversation(
  uid: string,
  conversationId: string,
  newTitle: string
): Promise<void> {
  const convRef = doc(db, 'users', uid, 'conversations', conversationId);
  await updateDoc(convRef, {
    title: newTitle.trim(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(uid: string, conversationId: string): Promise<void> {
  const msgCol = collection(db, 'users', uid, 'conversations', conversationId, 'messages');
  const snap = await getDocs(msgCol);

  const batch = writeBatch(db);
  snap.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  const convRef = doc(db, 'users', uid, 'conversations', conversationId);
  batch.delete(convRef);

  await batch.commit();
}

/**
 * Clear all conversations for a user
 */
export async function clearAllConversations(uid: string): Promise<void> {
  const convs = await getUserConversations(uid);
  for (const conv of convs) {
    await deleteConversation(uid, conv.conversationId);
  }
}

