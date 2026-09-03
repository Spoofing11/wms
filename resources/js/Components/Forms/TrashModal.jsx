import { useState, useEffect, useCallback } from 'react';
import { Modal, Stack, Group, Text, Button, Table, ActionIcon, TextInput, Loader, Box, ScrollArea, UnstyledButton } from '@mantine/core';
import { IconRestore, IconTrash, IconSearch, IconArrowLeft } from '@tabler/icons-react';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

export default function TrashModal({ opened, onClose, title, apiEndpoint, columns, onRefresh }) {
    const api = useApi();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage] = useState(10);
    const [actionLoading, setActionLoading] = useState(null);

    const doFetch = useCallback(async (p, q) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(p),
                per_page: String(perPage),
            });
            if (q) params.append('search', q);

            const result = await api.get(`${apiEndpoint}/trashed`, Object.fromEntries(params));
            setData(result.data || []);
            setTotal(result.total || 0);
        } catch (err) {
            toast.error(err.message || 'Gagal memuat data sampah.');
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint, perPage]);

    useEffect(() => {
        if (opened) {
            setPage(1);
            setSearch('');
            doFetch(1, '');
        }
    }, [opened]);

    useEffect(() => {
        if (opened && page > 0) doFetch(page, search);
    }, [page, search]);

    const handleRestore = async (item) => {
        setActionLoading(`restore-${item.id}`);
        try {
            await api.post(`${apiEndpoint}/${item.id}/restore`);
            toast.success(`${item.name} berhasil dipulihkan.`);
            doFetch(page, search);
            onRefresh?.();
        } catch (err) {
            toast.error(err.message || 'Gagal memulihkan data.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleForceDelete = async (item) => {
        setActionLoading(`delete-${item.id}`);
        try {
            await api.del(`${apiEndpoint}/${item.id}/force-delete`);
            toast.success(`${item.name} berhasil dihapus permanen.`);
            doFetch(page, search);
            onRefresh?.();
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus data.');
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap={8}>
                    <IconArrowLeft size={20} color="#DC2626" />
                    <Stack gap={0}>
                        <Text fw={700} size="lg" style={{ color: '#111827' }}>Sampah — {title}</Text>
                        <Text size="sm" c="dimmed">Data yang dihapus dapat dipulihkan atau dihapus permanen</Text>
                    </Stack>
                </Group>
            }
            size={720}
            scrollAreaComponent={ScrollArea.Autosize}
            styles={{
                header: { paddingBottom: 0, backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
                content: { overflow: 'hidden' },
                overlay: { backgroundColor: 'rgba(0,0,0,0.4)' },
            }}
        >
            <Stack gap="md">
                <TextInput
                    placeholder={`Cari ${title.toLowerCase()}...`}
                    leftSection={<IconSearch size={16} style={{ color: '#9CA3AF' }} />}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    size="sm"
                    radius="md"
                    styles={{
                        input: {
                            borderColor: '#E5E7EB',
                            '&:focus-within': {
                                borderColor: '#93C5FD',
                                boxShadow: '0 0 0 1px #93C5FD',
                            },
                        },
                    }}
                />

                {loading ? (
                    <Group justify="center" py="xl">
                        <Loader size="sm" />
                    </Group>
                ) : data.length === 0 ? (
                    <Box py="xl" ta="center">
                        <Text c="dimmed" size="sm">Tidak ada data di sampah.</Text>
                    </Box>
                ) : (
                    <>
                        <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: 12, letterSpacing: '0.02em', color: '#374151' }}>No</Table.Th>
                                        {columns.map((col) => (
                                            <Table.Th key={col.key} style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: 12, letterSpacing: '0.02em', color: '#374151' }}>{col.label}</Table.Th>
                                        ))}
                                        <Table.Th style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'center', fontWeight: 600, fontSize: 12, letterSpacing: '0.02em', color: '#374151' }}>Aksi</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {data.map((item, index) => (
                                        <Table.Tr
                                            key={item.id}
                                            style={{ transition: 'background-color 0.1s ease' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                                        >
                                            <Table.Td style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>{(page - 1) * perPage + index + 1}</Table.Td>
                                            {columns.map((col) => (
                                                <Table.Td key={col.key} style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                                                    {col.render ? col.render(item) : (item[col.key] ?? '-')}
                                                </Table.Td>
                                            ))}
                                            <Table.Td style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                                                <Group gap={4} justify="center">
                                                    <ActionIcon
                                                        variant="light"
                                                        color="teal"
                                                        size="sm"
                                                        loading={actionLoading === `restore-${item.id}`}
                                                        onClick={() => handleRestore(item)}
                                                        title="Pulihkan"
                                                    >
                                                        <IconRestore size={14} />
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant="light"
                                                        color="red"
                                                        size="sm"
                                                        loading={actionLoading === `delete-${item.id}`}
                                                        onClick={() => handleForceDelete(item)}
                                                        title="Hapus Permanen"
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Box>

                        <Group justify="space-between" align="center">
                            <Text size="sm" c="dimmed">
                                Total {total} data terhapus
                            </Text>
                            <Group gap={4}>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const pageNum = i + 1;
                                    const isActive = pageNum === page;
                                    return (
                                        <UnstyledButton
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            style={{
                                                minWidth: 32,
                                                height: 32,
                                                borderRadius: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 13,
                                                fontWeight: isActive ? 600 : 500,
                                                border: isActive ? '1px solid #705838' : '1px solid transparent',
                                                backgroundColor: isActive ? '#FAF6F1' : 'transparent',
                                                color: isActive ? '#705838' : '#6B7280',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            {pageNum}
                                        </UnstyledButton>
                                    );
                                })}
                            </Group>
                        </Group>
                    </>
                )}
            </Stack>

            <Group justify="flex-end" mt="md">
                <Button variant="subtle" color="gray" onClick={onClose} style={{ color: '#6B7280' }}>Tutup</Button>
            </Group>
        </Modal>
    );
}
