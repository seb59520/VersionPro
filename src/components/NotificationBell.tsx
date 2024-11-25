import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';
import { Notification, subscribeToNotifications } from '../lib/notifications';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (!currentOrganization?.id) return;

    const unsubscribe = subscribeToNotifications(
      currentOrganization.id,
      (newNotifications) => setNotifications(newNotifications)
    );

    return () => unsubscribe();
  }, [currentOrganization?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(notification.createdAt), 'PPp', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;