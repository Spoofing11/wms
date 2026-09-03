import { Modal, Stack, Group, Text, Box, ScrollArea, Image, SimpleGrid, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

function Section({ title, children }) {
    return (
        <Box>
            <Box
                p="sm"
                style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: '6px 6px 0 0',
                    borderBottom: '1px solid #E5E7EB',
                }}
            >
                <Text size="sm" fw={600} style={{ color: '#374151' }}>
                    {title}
                </Text>
            </Box>
            <Box p="sm" style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
                {children}
            </Box>
        </Box>
    );
}

function FieldRow({ label, value }) {
    return (
        <Group justify="space-between" align="flex-start" gap="md" py={4}>
            <Text size="sm" style={{ color: '#6B7280', minWidth: 120, flexShrink: 0 }}>
                {label}
            </Text>
            <Text size="sm" fw={500} style={{ color: '#111827', textAlign: 'right' }}>
                {value || '-'}
            </Text>
        </Group>
    );
}

function FieldGrid({ children }) {
    return (
        <SimpleGrid cols={2} spacing="sm">
            {children}
        </SimpleGrid>
    );
}

export default function ViewModal({ opened, onClose, title, subtitle, children, width = 520, image }) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={null}
            size={width}
            scrollAreaComponent={ScrollArea.Autosize}
            styles={{
                title: { margin: 0 },
                header: { padding: 0 },
                content: { overflow: 'hidden' },
                overlay: { backgroundColor: 'rgba(0,0,0,0.4)' },
            }}
        >
            <Stack gap={0}>
                <Box
                    p="md"
                    style={{
                        borderBottom: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <Group gap="md" align="center">
                        {image && (
                            <Box
                                w={72}
                                h={72}
                                style={{
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    border: '1px solid #E5E7EB',
                                    flexShrink: 0,
                                }}
                            >
                                <Image src={image} w={72} h={72} fit="cover" />
                            </Box>
                        )}
                        <Box>
                            <Text fw={700} size="lg" style={{ color: '#111827', lineHeight: 1.3 }}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text size="sm" style={{ color: '#6B7280' }}>
                                    {subtitle}
                                </Text>
                            )}
                        </Box>
                    </Group>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={onClose}
                        size="sm"
                    >
                        <IconX size={16} />
                    </ActionIcon>
                </Box>

                <Box p="md">
                    <Stack gap="md">
                        {children}
                    </Stack>
                </Box>
            </Stack>
        </Modal>
    );
}

ViewModal.Field = FieldRow;
ViewModal.Section = Section;
ViewModal.FieldGrid = FieldGrid;
