import { UserInfo } from '@/domains/user/v1/types';

export interface Discussion {
  id: string;
  courseId: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: string;
  sender?: UserInfo;
  content: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}
