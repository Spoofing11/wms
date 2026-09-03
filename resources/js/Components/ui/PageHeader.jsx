import { Box, Group, Title, Text, Button, Breadcrumbs, Anchor, TextInput } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { IconSearch } from '@tabler/icons-react';

export default function PageHeader({ title, subtitle, breadcrumbs = [], actions = [], search, onSearch }) {
    return (
        <Box mb="lg">
            {breadcrumbs.length > 0 && (
                <Breadcrumbs mb="xs">
                    {breadcrumbs.map((item, index) => (
                        item.href ? (
                            <Anchor
                                key={index}
                                component={Link}
                                href={item.href}
                                size="sm"
                                style={{ textDecoration: 'none' }}
                            >
                                {item.label}
                            </Anchor>
                        ) : (
                            <Text key={index} size="sm" c="dimmed">
                                {item.label}
                            </Text>
                        )
                    ))}
                </Breadcrumbs>
            )}

            <Group justify="space-between" align="center">
                <Box>
                    <Title order={2} style={{ color: '#111827' }}>
                        {title}
                    </Title>
                    {subtitle && (
                        <Text size="sm" style={{ color: '#6B7280' }} mt={4}>
                            {subtitle}
                        </Text>
                    )}
                </Box>

                <Group gap="sm" align="center">
                    {search && (
                        <TextInput
                            placeholder={search.placeholder || 'Cari...'}
                            leftSection={<IconSearch size={16} style={{ color: '#9CA3AF' }} />}
                            value={search.value}
                            onChange={(e) => onSearch?.(e.currentTarget.value)}
                            w={search.width || 320}
                            size="sm"
                            radius="md"
                            styles={{
                                input: {
                                    borderColor: '#E5E7EB',
                                    backgroundColor: '#ffffff',
                                    '&:focus-within': {
                                        borderColor: '#93C5FD',
                                        boxShadow: '0 0 0 1px #93C5FD',
                                    },
                                },
                            }}
                        />
                    )}
                    {actions.map((action, index) => (
                        action.custom ? (
                            <Box key={index}>{action.custom}</Box>
                        ) : (
                            <Button
                                key={index}
                                variant={action.variant || 'filled'}
                                color={action.color || 'brand'}
                                leftSection={action.icon}
                                component={action.href ? Link : 'button'}
                                href={action.href}
                                onClick={action.onClick}
                                loading={action.loading}
                                disabled={action.disabled}
                            >
                                {action.label}
                            </Button>
                        )
                    ))}
                </Group>
            </Group>
        </Box>
    );
}
