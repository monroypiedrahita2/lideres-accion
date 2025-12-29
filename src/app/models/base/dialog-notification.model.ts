export interface DialogNotificationModel {
  title: string;
  message: string;
  bottons: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  actionText?: string;
}
