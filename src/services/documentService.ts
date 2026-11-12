export interface IngestedDocument {
  docId: string;
  title: string;
  fileSize: number;
  mimetype: string;
  totalChunks: number;
  characterCount: number;
  uploadedAt: string;
}

export async function uploadDocument(file: File): Promise<IngestedDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.document;
}

export async function getDocuments(): Promise<IngestedDocument[]> {
  try {
    const response = await fetch('/api/documents');
    if (!response.ok) return [];
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function deleteDocument(docId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${docId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

export async function queryKnowledge(query: string): Promise<any[]> {
  try {
    const response = await fetch('/api/documents/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error querying knowledge base:', error);
    return [];
  }
}

