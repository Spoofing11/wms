import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';

export default function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notifications', {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // silent
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications((prev) =>
                prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleBroadcast = useCallback((notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(notification.message || 'Notifikasi baru');
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        handleBroadcast,
    };
}
