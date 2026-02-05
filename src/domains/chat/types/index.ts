import { UserInfo } from '@/domains/user/types';

export interface Chat {
  id: string;
  enrollmentId: string;
  studentId: string;
  student?: UserInfo;
  instructor?: UserInfo;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageId: string;
  /** viewer specific */
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
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
  sequence: number;
  reactions: MessageReaction[];
}
