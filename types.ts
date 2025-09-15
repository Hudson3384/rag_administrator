
export interface RAGFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  ragFiles: RAGFile[];
}

export interface Customer {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
