import { Paper, Group, Text, Box } from '@mantine/core';
import { Link } from '@inertiajs/react';

export default function StatCard({ title, value, icon, color = 'brand', subtitle, href, trend }) {
    const content = (
        <Paper
            p="md"
            radius="sm"
            style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E7EB',
                cursor: href ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
                if (href) {
                    e.currentTarget.style.borderColor = '#93C5FD';
                    e.currentTarget.style.boxShadow = '0 0 0 1px #93C5FD';
                }
            }}
            onMouseLeave={(e) => {
                if (href) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            <Group justify="space-between" align="flex-start">
                <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                        {title}
                    </Text>
                    <Group gap="xs" align="baseline" mt="xs">
                        <Text fw={700} size="xl" style={{ color: '#111827' }}>
                            {value}
                        </Text>
                        {trend && (
                            <Text
                                size="xs"
                                fw={600}
                                style={{ color: trend.up ? '#16A34A' : '#DC2626' }}
                            >
                                {trend.up ? '↑' : '↓'} {trend.value}
                            </Text>
                        )}
                    </Group>
                    {subtitle && (
                        <Text size="xs" c="dimmed" mt={4}>
                            {subtitle}
                        </Text>
                    )}
                </Box>
                {icon && (
                    <Box
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: `var(--mantine-color-${color}-light)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: `var(--mantine-color-${color}-fill)`,
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Group>
        </Paper>
    );

    if (href) {
        return (
            <Link href={href} style={{ textDecoration: 'none' }}>
                {content}
            </Link>
        );
    }

    return content;
}
