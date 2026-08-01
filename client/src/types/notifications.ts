export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsPage {
  items: NotificationItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
