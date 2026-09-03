import { useState, useCallback } from 'react';

export default function useConfirmDelete() {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [loading, setLoading] = useState(false);

    const confirm = useCallback((item) => {
        setItemToDelete(item);
        setIsOpen(true);
    }, []);

    const cancel = useCallback(() => {
        setItemToDelete(null);
        setIsOpen(false);
        setLoading(false);
    }, []);

    const execute = useCallback(async (callback) => {
        setLoading(true);
        try {
            await callback(itemToDelete);
            cancel();
        } catch {
            setLoading(false);
        }
    }, [itemToDelete, cancel]);

    return {
        isOpen,
        itemToDelete,
        loading,
        confirm,
        cancel,
        execute,
    };
}
