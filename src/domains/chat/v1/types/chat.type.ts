import { UserInfo } from '@/domains/user/v1/types';

export interface Chat {
  id: string;
  studentId: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageId: string;

  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;

  otherUser?: UserInfo
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  sequence: number;
  reactions: MessageReaction[];
}
