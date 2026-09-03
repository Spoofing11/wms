import { Box, Text, Button, Stack } from '@mantine/core';
import { IconFolder } from '@tabler/icons-react';

export default function EmptyState({ icon, title, description, action }) {
    return (
        <Stack
            align="center"
            justify="center"
            p="xl"
            gap="md"
            style={{
                minHeight: 200,
                borderRadius: 8,
                border: '1px dashed #D1D5DB',
                backgroundColor: '#F9FAFB',
            }}
        >
            <Box
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9CA3AF',
                }}
            >
                {icon || <IconFolder size={28} />}
            </Box>
            <Text fw={600} size="sm" style={{ color: '#374151' }}>
                {title || 'Tidak ada data'}
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
                {description || 'Belum ada data yang tersedia untuk ditampilkan.'}
            </Text>
            {action && (
                <Button
                    variant="light"
                    color="brand"
                    size="sm"
                    leftSection={action.icon}
                    component={action.href ? 'a' : 'button'}
                    href={action.href}
                    onClick={action.onClick}
                >
                    {action.label}
                </Button>
            )}
        </Stack>
    );
}
