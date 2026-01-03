export interface Notification {
  id: string;
  type: string;
  userId: string;
  subject: string;
  message: string;
  recipient: string;
  isRead: boolean;
  createdAt: string;
  priority: string;
  actionUrl: string;
  category: string;
  metadata: Record<string, string>;
}
