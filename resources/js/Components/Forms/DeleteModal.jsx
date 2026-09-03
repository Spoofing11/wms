import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function DeleteModal({ opened, onClose, onConfirm, title, message, loading }) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={420}
            centered
            styles={{
                body: { padding: 'var(--mantine-spacing-lg)' },
                overlay: { backgroundColor: 'rgba(0,0,0,0.4)' },
            }}
        >
            <Stack align="center" gap="md">
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#FEF2F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconAlertTriangle size={28} color="#DC2626" />
                </div>

                <Stack align="center" gap={4}>
                    <Text fw={700} size="lg" style={{ color: '#111827' }}>
                        {title || 'Hapus Data'}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" maw={320}>
                        {message || 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'}
                    </Text>
                </Stack>

                <Group mt="md" style={{ width: '100%' }}>
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        style={{ flex: 1, color: '#6B7280' }}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button
                        color="red"
                        onClick={onConfirm}
                        loading={loading}
                        style={{ flex: 1, backgroundColor: '#DC2626', fontWeight: 600 }}
                    >
                        Hapus
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
