import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function useEchoChannel(channel, event, callback) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!window.Echo) return;

        const echoChannel = channel.startsWith('private-') || channel.startsWith('presence-')
            ? window.Echo.private(channel.replace('private-', '').replace('presence-', ''))
            : window.Echo.channel(channel);

        echoChannel.listen(event, (e) => {
            callbackRef.current(e);
        });

        return () => {
            echoChannel.stopListening(event);
        };
    }, [channel, event]);
}

export function useEchoNotification(userId, callback) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!window.Echo || !userId) return;

        const channel = window.Echo.private(`App.Models.User.${userId}`)
            .notification((notification) => {
                callbackRef.current(notification);
                toast.info(notification.message || 'Notifikasi baru');
            });

        return () => {
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
        };
    }, [userId]);
}
