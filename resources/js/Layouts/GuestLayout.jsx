import { Center, Paper, Stack, Text, Anchor, Box } from '@mantine/core';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <Center
            style={{
                minHeight: '100vh',
                backgroundColor: '#fbf9f7',
                padding: '24px',
            }}
        >
            <Paper
                w="100%"
                maw={440}
                p="xl"
                radius="sm"
                style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                }}
            >
                <Stack gap="lg">
                    {children}
                </Stack>
            </Paper>
        </Center>
    );
}
