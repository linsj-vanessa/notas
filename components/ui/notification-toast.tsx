'use client';

import { useNotification } from '@/contexts';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './button';

const getNotificationIcon = (type: 'success' | 'error' | 'info' | 'warning') => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationStyles = (type: 'success' | 'error' | 'info' | 'warning') => {
  const baseStyles = 'bg-background border shadow-md rounded-lg p-4 mb-2 flex items-start gap-3 max-w-md';
  
  switch (type) {
    case 'success':
      return `${baseStyles} border-green-200`;
    case 'error':
      return `${baseStyles} border-red-200`;
    case 'warning':
      return `${baseStyles} border-yellow-200`;
    default:
      return `${baseStyles} border-blue-200`;
  }
};

export const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationStyles(notification.type)}
        >
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground">
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted"
            onClick={() => removeNotification(notification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}; 