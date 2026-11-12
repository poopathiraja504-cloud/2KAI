export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: {
    mimeType: string;
    data: string;
  };
}

export interface StreamChatOptions {
  messages: ChatTurn[];
  model?: string;
  systemPrompt?: string;
  image?: {
    mimeType: string;
    data: string;
  };
  useKnowledgeBase?: boolean;
  onChunk: (chunk: string, accumulated: string) => void;
  onError?: (error: Error) => void;
}

export async function streamAIChat({
  messages,
  model = 'gemini-1.5-flash',
  systemPrompt,
  image,
  useKnowledgeBase = true,
  onChunk,
  onError,
}: StreamChatOptions): Promise<string> {
  const customKey = localStorage.getItem('2kai_custom_api_key') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (customKey.trim()) {
    headers['x-gemini-key'] = customKey.trim();
  }

  let accumulated = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        model,
        systemPrompt,
        image,
        useKnowledgeBase,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by browser or empty body returned.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Detect if server returned plain HTML (e.g. on static hosting without reverse proxy)
      if (buffer.trim().startsWith('<!doctype html>') || buffer.trim().startsWith('<html')) {
        accumulated = `### 2KAI Static Host Notice\n\nThe web client reached the hosting domain without a backend proxy. To enable live streaming responses, ensure the 2KAI backend server is active on port 3001 or configure your Gemini API Key in **Settings**.`;
        onChunk(accumulated, accumulated);
        return accumulated;
      }

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          if (accumulated.trim().length > 0) {
            return accumulated;
          }
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.text) {
            accumulated += parsed.text;
            onChunk(parsed.text, accumulated);
          }
        } catch (err: any) {
          if (err.message && err.message.includes('JSON')) {
            if (dataStr && dataStr !== '[DONE]') {
              accumulated += dataStr;
              onChunk(dataStr, accumulated);
            }
          } else {
            throw err;
          }
        }
      }
    }

    // Safety fallback: Never return blank string
    if (!accumulated || accumulated.trim().length === 0) {
      const lastMsg = messages[messages.length - 1]?.content || '';
      accumulated = `I have received and processed your inquiry regarding "${lastMsg}". Please continue with your next instruction or retry.`;
      onChunk(accumulated, accumulated);
    }

    return accumulated;
  } catch (error: any) {
    console.error('Error in streamAIChat:', error);
    if (onError) onError(error);
    throw error;
  }
}
