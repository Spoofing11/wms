import { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Group, Button, Badge, Text, Stack, Tabs, Textarea, Modal, ActionIcon, Menu, Image, Divider, Box, Table } from '@mantine/core';
import { IconCheck, IconX, IconClipboardCheck, IconEye, IconDotsVertical } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import GroupedTable from '@/Components/Operational/GroupedTable';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

export default function Index() {
    const api = useApi();

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState('semua');
    const [loading, setLoading] = useState(false);

    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [viewItem, setViewItem] = useState(null);

    const fetchData = useCallback(async (newPage = 1, newSearch = search, tab = activeTab) => {
        setLoading(true);
        try {
            if (tab === 'restock') {
                const res = await api.get('/api/v1/stock-replenishments/purchasing', { page: newPage, search: newSearch, per_page: 10 });
                setData(res.data);
                setMeta(res.meta);
            } else {
                const params = { page: newPage, search: newSearch, per_page: 10 };
                if (tab !== 'semua') params.tab = tab;
                const res = await api.get('/api/v1/operational/purchasing', params);
                setData(res.data);
                setMeta(res.meta);
            }
            setPage(newPage);
        } catch (err) {
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    }, [search, activeTab]);

    useEffect(() => { fetchData(1); }, []);

    const debounceRef = useRef(null);
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchData(1, val, activeTab), 300);
    };

    const handleApprove = async (child) => {
        setLoading(true);
        try {
            await api.post(`/api/v1/operational/purchasing/${child.purchase_request.id}/approve`);
            toast.success('Permintaan pembelian berhasil disetujui.');
            fetchData(page, search, activeTab);
        } catch (err) {
            toast.error(err.message || 'Gagal approve.');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setLoading(true);
        try {
            if (activeTab === 'restock') {
                await api.post(`/api/v1/stock-replenishments/${rejectModal.id}/purchasing-reject`, { rejection_reason: rejectReason });
                toast.success('Restock request berhasil ditolak.');
            } else {
                await api.post(`/api/v1/operational/purchasing/${rejectModal.purchase_request.id}/reject`, { rejection_reason: rejectReason });
                toast.success('Permintaan pembelian berhasil ditolak.');
            }
            setRejectModal(null);
            setRejectReason('');
            fetchData(page, search, activeTab);
        } catch (err) {
            toast.error(err.message || 'Gagal reject.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestockApprove = async (item) => {
        setLoading(true);
        try {
            await api.post(`/api/v1/stock-replenishments/${item.id}/purchasing-approve`);
            toast.success('Restock request berhasil disetujui. Masuk ke Barang Masuk.');
            fetchData(page, search, activeTab);
        } catch (err) {
            toast.error(err.message || 'Gagal approve.');
        } finally {
            setLoading(false);
        }
    };

    const prStatusColor = (status) => {
        const colors = { diajukan: 'blue', disetujui: 'green', ready: 'green', ditolak: 'red' };
        return colors[status] || 'gray';
    };

    const prStatusLabel = (status) => {
        const labels = { diajukan: 'Diajukan', disetujui: 'Disetujui', ready: 'Ready', ditolak: 'Ditolak' };
        return labels[status] || status;
    };

    const headerColumns = [
        {
            key: 'requester_name',
            label: 'Pemohon',
            render: (row) => row.requester_name || row.requester?.name || '-',
        },
        {
            key: 'project',
            label: 'Proyek',
            render: (row) => row.project?.name || '-',
        },
        {
            key: 'request_date',
            label: 'Tanggal',
            render: (row) => row.request_date ? new Date(row.request_date).toLocaleDateString('id-ID') : '-',
        },
        {
            key: 'urgency',
            label: 'Urgensi',
            render: (row) => (
                <Badge color={row.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                    {row.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                </Badge>
            ),
        },
        {
            key: 'items_count',
            label: 'Jml Item',
            render: (row) => `${row.items?.length || 0} item`,
        },
    ];

    const childColumns = [
        {
            key: 'product',
            label: 'Barang',
            render: (child) => child.product?.name || child.new_item_name || '-',
        },
        {
            key: 'quantity',
            label: 'Qty Beli',
            render: (child) => child.purchase_request?.quantity || '-',
        },
        {
            key: 'pr_status',
            label: 'Status',
            render: (child) => (
                <Badge color={prStatusColor(child.purchase_request?.status)} variant="light" size="sm">
                    {prStatusLabel(child.purchase_request?.status)}
                </Badge>
            ),
        },
        {
            key: 'rekomendasi',
            label: 'Rekomendasi',
            render: (child) => child.product?.name || '-',
        },
    ];

    const headerActions = (row) => (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(row)}>
                    Lihat Detail
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    const childActions = (child, parent) => (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem({ ...parent, _selectedItem: child })}>
                    Lihat Detail
                </Menu.Item>
                {child.purchase_request?.status === 'diajukan' && (
                    <>
                        <Menu.Item leftSection={<IconCheck size={16} />} color="green" onClick={() => handleApprove(child)}>
                            Setujui
                        </Menu.Item>
                        <Menu.Item leftSection={<IconX size={16} />} color="red" onClick={() => setRejectModal(child)}>
                            Tolak
                        </Menu.Item>
                    </>
                )}
            </Menu.Dropdown>
        </Menu>
    );

    return (
        <AuthenticatedLayout
            header={<PageHeader
                title="Purchasing"
                subtitle="Permintaan pembelian dari Material Request"
                search={{ value: search, placeholder: 'Cari pemohon, proyek, barang...' }}
                onSearch={handleSearch}
            />}
        >
            <Head title="Purchasing" />

            <Tabs value={activeTab} onChange={(val) => { setActiveTab(val); fetchData(1, search, val); }} mb="md">
                <Tabs.List>
                    <Tabs.Tab value="semua">Semua</Tabs.Tab>
                    <Tabs.Tab value="barang-baru">Barang Baru</Tabs.Tab>
                    <Tabs.Tab value="pengadaan">Pengadaan Stock</Tabs.Tab>
                    <Tabs.Tab value="restock">Restock</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            <Text size="sm" c="dimmed" mb="sm">
                Menampilkan {data.length} dari {meta.total} {activeTab === 'restock' ? 'restock' : 'permintaan'}
            </Text>

            {activeTab === 'restock' ? (
                <>
                    {data.length > 0 ? (
                        <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>ID Restock</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Barang</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>SKU</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Qty</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Urgensi</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Pemohon</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Keterangan</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Aksi</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {data.map((row) => (
                                        <Table.Tr key={row.id}>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{row.replenishment_id}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{row.product?.name || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{row.product?.sku || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{row.quantity}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>
                                                <Badge color={row.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                                                    {row.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{row.requester?.name || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{row.notes || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px' }}>
                                                <Group gap="xs">
                                                    <Button size="xs" color="green" leftSection={<IconCheck size={14} />} onClick={() => handleRestockApprove(row)} loading={loading}>Setujui</Button>
                                                    <Button size="xs" color="red" leftSection={<IconX size={14} />} onClick={() => setRejectModal(row)}>Tolak</Button>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    ) : (
                        <EmptyState
                            icon={<IconClipboardCheck size={28} />}
                            title="Tidak ada restock request"
                            description="Belum ada restock request yang menunggu persetujuan."
                        />
                    )}
                </>
            ) : (
                <>
                    {data.length > 0 ? (
                        <GroupedTable
                            data={data}
                            expandKey="id"
                            headerColumns={headerColumns}
                            childColumns={childColumns}
                            headerActions={headerActions}
                            childActions={childActions}
                            emptyMessage="Tidak ada permintaan pembelian"
                        />
                    ) : (
                        <EmptyState
                            icon={<IconClipboardCheck size={28} />}
                            title="Tidak ada permintaan pembelian"
                            description="Semua permintaan sudah diproses."
                        />
                    )}
                </>
            )}

            {meta.last_page > 1 && (
                <Group justify="center" mt="md">
                    <Button variant="default" disabled={page <= 1} onClick={() => fetchData(page - 1, search, activeTab)}>Sebelumnya</Button>
                    <Text size="sm">Halaman {page} dari {meta.last_page}</Text>
                    <Button variant="default" disabled={page >= meta.last_page} onClick={() => fetchData(page + 1, search, activeTab)}>Selanjutnya</Button>
                </Group>
            )}

            {/* Detail Modal */}
            <Modal opened={!!viewItem} onClose={() => setViewItem(null)} title={viewItem?._selectedItem ? "Detail Item" : "Detail Permintaan Pembelian"} size="lg">
                <Stack gap="md">
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Pemohon</Text>
                            <Text size="sm" fw={500}>{viewItem?.requester_name || viewItem?.requester?.name || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Proyek</Text>
                            <Text size="sm" fw={500}>{viewItem?.project?.name || '-'}</Text>
                        </div>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Urgensi</Text>
                            <Badge color={viewItem?.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                                {viewItem?.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                            </Badge>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Tanggal</Text>
                            <Text size="sm" fw={500}>{viewItem?.request_date ? new Date(viewItem.request_date).toLocaleDateString('id-ID') : '-'}</Text>
                        </div>
                    </Group>

                    <Divider my="sm" />

                    {viewItem?._selectedItem ? (
                        <>
                            <Text fw={600} size="sm">Detail Item</Text>
                            <Box p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fafafa' }}>
                                <Text size="xs" c="dimmed" mb={4}>Barang</Text>
                                <Text size="sm" fw={500}>{viewItem._selectedItem?.product?.name || viewItem._selectedItem?.new_item_name || '-'}</Text>
                                <Text size="xs" c="dimmed" mt={4}>SKU: {viewItem._selectedItem?.product?.sku || 'Barang Baru'}</Text>
                                <Text size="xs" c="dimmed" mt={4}>Qty Beli: {viewItem._selectedItem?.purchase_request?.quantity || '-'}</Text>
                                <Text size="xs" c="dimmed" mt={4}>Status: <Badge color={prStatusColor(viewItem._selectedItem?.purchase_request?.status)} variant="light" size="sm">{prStatusLabel(viewItem._selectedItem?.purchase_request?.status)}</Badge></Text>
                                {viewItem._selectedItem?.purchase_request?.notes && <Text size="xs" c="dimmed" mt={4}>Catatan: {viewItem._selectedItem.purchase_request.notes}</Text>}
                            </Box>
                            {viewItem._selectedItem?.photo && (
                                <div>
                                    <Text size="xs" c="dimmed" mb={4}>Foto Barang</Text>
                                    <Image
                                        src={viewItem._selectedItem.photo.startsWith('http') ? viewItem._selectedItem.photo : `/storage/${viewItem._selectedItem.photo}`}
                                        radius="md"
                                        h={200}
                                        fit="contain"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Text fw={600} size="sm">Items ({viewItem?.items?.length || 0})</Text>
                            {viewItem?.items?.map((item) => (
                                <Box key={item.id} p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8 }}>
                                    <Group justify="space-between" align="flex-start">
                                        <div style={{ flex: 1 }}>
                                            <Text size="sm" fw={500}>{item.product?.name || item.new_item_name || '-'}</Text>
                                            <Text size="xs" c="dimmed">Qty: {item.purchase_request?.quantity || '-'} | SKU: {item.product?.sku || 'Barang Baru'}</Text>
                                            <Text size="xs" c="dimmed" mt={4}>
                                                Status: <Badge color={prStatusColor(item.purchase_request?.status)} variant="light" size="sm">{prStatusLabel(item.purchase_request?.status)}</Badge>
                                            </Text>
                                        </div>
                                        {item.photo && (
                                            <Image
                                                src={item.photo.startsWith('http') ? item.photo : `/storage/${item.photo}`}
                                                radius="md"
                                                h={80}
                                                w={80}
                                                fit="cover"
                                            />
                                        )}
                                    </Group>
                                </Box>
                            ))}
                        </>
                    )}
                </Stack>
            </Modal>

            {/* Reject Modal */}
            <Modal opened={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason(''); }} title="Tolak Permintaan" size="md">
                <Stack gap="md">
                    <Text size="sm">
                        {activeTab === 'restock'
                            ? <>Barang: <strong>{rejectModal?.product?.name || '-'}</strong> | ID: <strong>{rejectModal?.replenishment_id || '-'}</strong></>
                            : <>Barang: <strong>{rejectModal?.product?.name || rejectModal?.new_item_name || '-'}</strong></>
                        }
                    </Text>
                    <Textarea
                        label="Alasan Penolakan"
                        placeholder="Masukkan alasan penolakan..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.currentTarget.value)}
                        rows={3}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Batal</Button>
                        <Button color="red" onClick={handleReject} loading={loading}>Tolak</Button>
                    </Group>
                </Stack>
            </Modal>
        </AuthenticatedLayout>
    );
}
