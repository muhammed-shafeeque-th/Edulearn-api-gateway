export interface Conversation {
  id: string;
  studentId: string;
  type: string;
  participants: string[];
  createdAt: number;
  updatedAt: number;
  /** Settings */
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  mutedUntil: number;
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  receiverId?: string | undefined;
  type?: string | undefined;
  fileName?: string | undefined;
  fileUrl?: string | undefined;
  fileSize?: string | undefined;
  replayTo?: string | undefined;
  reactions: MessageReaction[];
}
