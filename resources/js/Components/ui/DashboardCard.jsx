import { Paper, Group, Text, Anchor, Box } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { IconArrowRight } from '@tabler/icons-react';

export default function DashboardCard({ title, href, children, action }) {
    return (
        <Paper
            p="md"
            radius="sm"
            style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}
        >
            <Group justify="space-between" align="center" mb="md">
                <Text fw={600} size="sm" style={{ color: '#111827' }}>
                    {title}
                </Text>
                {href && (
                    <Anchor
                        component={Link}
                        href={href}
                        size="xs"
                        style={{ color: '#705838', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        Lihat Semua
                        <IconArrowRight size={12} />
                    </Anchor>
                )}
                {action && !href && <Box>{action}</Box>}
            </Group>
            {children}
        </Paper>
    );
}
