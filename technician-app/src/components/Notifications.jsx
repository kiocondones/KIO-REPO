import React, { useState, useEffect } from 'react';
import API from '../api/api';

// Map notification type → color scheme
const TYPE_COLORS = {
    notification: 'red',
    reminder:     'orange',
    announcement: 'blue',
    message:      'blue',
};

// Map notification type → SVG icon path
const TYPE_ICONS = {
    notification: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    reminder:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    announcement: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    message:      'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
};

const COLOR_CLASSES = {
    red:    { bg: 'bg-red-100',    text: 'text-red-600',    border: 'border-red-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-500', border: 'border-orange-500' },
    blue:   { bg: 'bg-blue-100',   text: 'text-blue-500',   border: 'border-blue-500' },
};

function timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        const data = await API.getNotifications();
        setNotifications(data.notifications || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (notifId) => {
        setNotifications(prev =>
            prev.map(n => n.id === notifId ? { ...n, is_read: true, isNew: false } : n)
        );
        await API.markNotificationRead(notifId);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="pb-5 p-4">
            <h1 className="text-2xl font-bold mb-4">
                Notifications {unreadCount > 0 && `(${unreadCount} new)`}
            </h1>

            {loading && (
                <div className="text-center py-10 text-gray-400">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-lg font-medium">No notifications yet</p>
                    <p className="text-sm mt-1">You are all caught up!</p>
                </div>
            )}

            {notifications.map((notif) => {
                const type  = notif.type || 'notification';
                const color = TYPE_COLORS[type] || 'blue';
                const icon  = TYPE_ICONS[type]  || TYPE_ICONS.notification;
                const cls   = COLOR_CLASSES[color];
                const unread = !notif.is_read;

                return (
                    <div
                        key={notif.id}
                        className={`bg-white mb-4 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all
                            ${unread ? `border ${cls.border}` : 'border border-transparent'}`}
                    >
                        <div className="flex gap-3">
                            <div className={`p-2 ${cls.bg} rounded-lg h-fit flex-shrink-0`}>
                                <svg width="20" height="20" className={cls.text} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                </svg>
                            </div>

                            <div className="flex flex-col w-full min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-gray-900 text-sm leading-snug">{notif.title}</p>
                                    <span className="text-gray-400 text-xs whitespace-nowrap flex-shrink-0">
                                        {timeAgo(notif.created_at)}
                                    </span>
                                </div>

                                <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">
                                    {notif.description}
                                </p>

                                {unread && (
                                    <button
                                        onClick={() => handleMarkRead(notif.id)}
                                        className="mt-2 self-end text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Notifications;