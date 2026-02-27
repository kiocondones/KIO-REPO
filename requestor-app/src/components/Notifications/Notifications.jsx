// src/components/Notifications/Notifications.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const TYPE_STYLES = {
    new: { accent: 'bg-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', icon: 'fas fa-plus' },
    progress: { accent: 'bg-amber-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', icon: 'fas fa-clock' },
    completed: { accent: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: 'fas fa-check' },
    closed: { accent: 'bg-rose-500', iconBg: 'bg-rose-50', iconColor: 'text-rose-600', icon: 'fas fa-ban' },
    default: { accent: 'bg-gray-300', iconBg: 'bg-gray-100', iconColor: 'text-gray-500', icon: 'fas fa-bell' },
};

const mainTypeToVisualType = {
    new_ticket: 'new',
    in_progress: 'progress',
    assigned: 'progress',
    completed: 'completed',
    closed: 'closed',
};

// Notification Card Component
const NotificationCard = ({ notification, isNew, onClick, onActions }) => {
    const visualType = mainTypeToVisualType[notification.type] || 'default';
    const meta = TYPE_STYLES[visualType] || TYPE_STYLES.default;
    const accentBar = isNew ? meta.accent : 'bg-transparent';

    // Format the timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const ticketId = notification.source_id || notification.ticketId || 'N/A';
    const message = notification.description || notification.message || '';
    const timeDisplay = formatTime(notification.created_at || notification.scheduled_at);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_rgba(16,24,40,0.08)] border border-gray-50 cursor-pointer ${
                isNew ? '' : 'opacity-95'
            }`}
            onClick={() => onClick && onClick(notification)}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-[6px] rounded-r-lg ${accentBar}`}></div>

            <div className="flex items-start gap-3 p-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meta.iconBg}`}>
                    <i className={`${meta.icon} ${meta.iconColor} text-xl`}></i>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="text-lg font-semibold text-gray-900 leading-tight">
                                {notification.title}
                            </div>
                            <div className="text-sm text-gray-600 leading-snug">
                                <span className="text-blue-600 font-medium">#{ticketId}</span>: {message}
                            </div>
                        </div>

                        <button
                            className="p-3 -mt-2 text-gray-500 rounded-full hover:bg-gray-100 transition text-xl"
                            onClick={(e) => { e.stopPropagation(); onActions && onActions(notification); }}
                            aria-label="Notification actions"
                        >
                            <span className="tracking-[0.03em] block">•••</span>
                        </button>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">{timeDisplay}</div>
                </div>
            </div>
        </div>
    );
};

const Notifications = ({ onBack, onMenuToggle, onSelectTicket, onNotificationCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNotification, setActiveNotification] = useState(null);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await API.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const ActionSheet = ({ open, onClose, onMarkRead, onDelete }) => {
        return (
            <div className={`fixed inset-0 z-[1200] flex justify-center transition ${open ? 'visible opacity-100' : 'invisible opacity-0'} duration-200`}>
                <div className="w-full max-w-[480px] h-full relative">
                    <div className={`absolute inset-0 bg-black/30 transition ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>

                    <div className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl shadow-[0_20px_40px_rgba(0,0,0,0.16)] px-6 pt-4 pb-6 transform transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}>
                        <div className="w-16 h-1.5 rounded-full bg-gray-300 mx-auto mb-4"></div>

                        <div className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 text-left text-gray-800 font-semibold" onClick={onMarkRead}>
              <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-600">
                <i className={`fas ${activeNotification?.isNew ? 'fa-check' : 'fa-envelope'}`}></i>
              </span>
                                <span>{activeNotification?.isNew ? 'Mark as read' : 'Mark as unread'}</span>
                            </button>

                            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 text-left text-gray-800 font-semibold" onClick={onDelete}>
              <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-600">
                <i className="fas fa-trash"></i>
              </span>
                                <span>Delete this notification</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleNotificationClick = (notification) => {
        const ticketId = notification.source_id || notification.ticketId;
        if (ticketId && onSelectTicket) {
            // Mark as read
            API.markNotificationRead(notification.id);
            onSelectTicket(ticketId);
            
            // Call the callback to update the notification count
            if (onNotificationCountChange) {
                onNotificationCountChange();
            }
        }
    };
    const handleMarkReadFromSheet = () => {
        if (!activeNotification) return;

        API.toggleNotificationRead(activeNotification.id);

        setNotifications(prev =>
            prev.map(n =>
                n.id === activeNotification.id
                    ? { ...n, isNew: !n.isNew }
                    : n
            )
        );

        setActiveNotification(null);
        
        // Call the callback to update the notification count
        if (onNotificationCountChange) {
            onNotificationCountChange();
        }
    };

    const handleDeleteFromSheet = () => {
        if (!activeNotification) return;

        API.deleteNotification(activeNotification.id);

        setNotifications(prev =>
            prev.filter(n => n.id !== activeNotification.id)
        );

        setActiveNotification(null);
        
        // Call the callback to update the notification count
        if (onNotificationCountChange) {
            onNotificationCountChange();
        }
    };

    // Separate new and earlier notifications
    const newNotifications = notifications.filter(n => n.isNew);
    const earlierNotifications = notifications.filter(n => !n.isNew);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onMenuToggle}
                        className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
                    >
                        <i className="fas fa-bars text-lg"></i>
                    </button>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-bell text-lg"></i>
                        <span className="font-semibold text-lg">Notifications</span>
                    </div>
                </div>
                <button 
                    onClick={onBack}
                    className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
                >
                    <i className="fas fa-arrow-left text-lg"></i>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <LoadingSpinner />
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16">
                        <i className="fas fa-bell-slash text-5xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">No notifications yet</p>
                    </div>
                ) : (
                    <>
                        {/* New Notifications Section */}
                        {newNotifications.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-base font-bold text-gray-900 mb-4">
                                    New Notifications ({newNotifications.length})
                                </h2>
                                {newNotifications.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        isNew={true}
                                        onClick={handleNotificationClick}
                                        onActions={setActiveNotification}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Earlier Notifications Section */}
                        {earlierNotifications.length > 0 && (
                            <div>
                                <h2 className="text-base font-bold text-gray-900 mb-4">Earlier</h2>
                                {earlierNotifications.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        isNew={false}
                                        onClick={handleNotificationClick}
                                        onActions={setActiveNotification}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <ActionSheet
                open={Boolean(activeNotification)}
                onClose={() => setActiveNotification(null)}
                onMarkRead={handleMarkReadFromSheet}
                onDelete={handleDeleteFromSheet}
            />
        </div>
    );
};

export default Notifications;

