import { useEffect } from 'react';
import { Modal, Stack, Group, Text, Button, ScrollArea, ActionIcon, Box } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

export default function ModalForm({ opened, onClose, title, subtitle, children, onSubmit, loading, width = 520 }) {
    useEffect(() => {
        if (!opened) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [opened, onClose]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group justify="space-between" align="flex-start" style={{ width: '100%' }}>
                    <Stack gap={2}>
                        <Text fw={700} size="lg" style={{ color: '#111827' }}>{title}</Text>
                        {subtitle && <Text size="sm" c="dimmed">{subtitle}</Text>}
                    </Stack>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        size="sm"
                        style={{ marginTop: 2 }}
                    >
                        <IconX size={16} />
                    </ActionIcon>
                </Group>
            }
            closeOnClickOutside={false}
            size={width}
            scrollAreaComponent={ScrollArea.Autosize}
            styles={{
                header: { paddingBottom: 0, backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
                body: { paddingTop: 'var(--mantine-spacing-md)' },
                content: { overflow: 'hidden' },
                overlay: { backgroundColor: 'rgba(0,0,0,0.4)' },
            }}
        >
            <form onSubmit={onSubmit}>
                <Stack gap="md">
                    {children}
                </Stack>

                <Group justify="flex-end" mt="lg" pt="md" style={{ borderTop: '1px solid #E5E7EB' }}>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        disabled={loading}
                        style={{ color: '#6B7280' }}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        loading={loading}
                        style={{
                            backgroundColor: '#705838',
                            color: '#ffffff',
                            fontWeight: 600,
                            '&:hover': { backgroundColor: '#8B6F4E' },
                        }}
                    >
                        Simpan
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
