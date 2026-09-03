import { Box, Text, TextInput } from '@mantine/core';

export default function FormField({ label, error, required, children, ...props }) {
    return (
        <Box>
            {label && (
                <Text size="sm" fw={500} mb={6} style={{ color: '#1b1c1b' }}>
                    {label}
                    {required && <span style={{ color: '#ba1a1a', marginLeft: 4 }}>*</span>}
                </Text>
            )}
            {children || <TextInput error={error} {...props} />}
            {error && (
                <Text size="xs" c="red" mt={4}>
                    {error}
                </Text>
            )}
        </Box>
    );
}
