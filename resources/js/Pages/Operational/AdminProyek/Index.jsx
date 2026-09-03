import { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, TextInput, Stack, Modal, Textarea, Select, NumberInput, Image, FileInput, Divider, Tabs, Box, Table } from '@mantine/core';
import { IconCheck, IconX, IconClipboardCheck, IconEye, IconEdit, IconCamera } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import GroupedTable from '@/Components/Operational/GroupedTable';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

export default function Index() {
    const api = useApi();
    const [activeTab, setActiveTab] = useState('mr');

    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [editItemData, setEditItemData] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editPhoto, setEditPhoto] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);

    const [viewItem, setViewItem] = useState(null);
    const [photoPreviewItem, setPhotoPreviewItem] = useState(null);

    const fetchItems = useCallback(async (newPage = 1, newSearch = search) => {
        setLoading(true);
        try {
            if (activeTab === 'mr') {
                const res = await api.get('/api/v1/operational/admin-proyek', { page: newPage, search: newSearch, per_page: 100 });
                setItems(res.data);
                setMeta(res.meta);
            } else {
                const res = await api.get('/api/v1/stock-replenishments/admin-proyek', { page: newPage, search: newSearch, per_page: 100 });
                setItems(res.data);
                setMeta(res.meta);
            }
            setPage(newPage);
        } catch (err) {
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    }, [search, activeTab]);

    useEffect(() => { fetchItems(1); }, [activeTab]);

    const debounceRef = useRef(null);
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchItems(1, val), 300);
    };

    const handleApprove = async (mr) => {
        setLoading(true);
        try {
            await api.post(`/api/v1/operational/admin-proyek/${mr.id}/approve`);
            toast.success('Material Request berhasil di-approve. Item akan diproses sesuai stock.');
            fetchItems(page, search);
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
            if (activeTab === 'mr') {
                await api.post(`/api/v1/operational/admin-proyek/${rejectModal.id}/reject`, { rejection_reason: rejectReason });
                toast.success('Material Request berhasil ditolak.');
            } else {
                await api.post(`/api/v1/stock-replenishments/${rejectModal.id}/admin-reject`, { rejection_reason: rejectReason });
                toast.success('Restock request berhasil ditolak.');
            }
            setRejectModal(null);
            setRejectReason('');
            fetchItems(page, search);
        } catch (err) {
            toast.error(err.message || 'Gagal reject.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestockApprove = async (item) => {
        setLoading(true);
        try {
            await api.post(`/api/v1/stock-replenishments/${item.id}/admin-approve`);
            toast.success('Restock request berhasil disetujui. Masuk ke Purchasing.');
            fetchItems(page, search);
        } catch (err) {
            toast.error(err.message || 'Gagal approve.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditItem = async () => {
        if (!editItemData) return;
        setEditLoading(true);
        try {
            const formData = new FormData();
            formData.append('quantity_requested', editItemData.quantity_requested || 0);
            formData.append('notes', editItemData.notes || '');
            formData.append('new_item_name', editItemData.new_item_name || '');
            if (editPhoto) {
                formData.append('photo', editPhoto);
            }
            await api.upload(`/api/v1/operational/admin-proyek/item/${editItemData.id}`, formData, 'PUT');
            toast.success('Item berhasil diperbarui.');
            setEditItem(null);
            setEditItemData(null);
            setEditPhoto(null);
            setEditPhotoPreview(null);
            fetchItems(page, search);
        } catch (err) {
            toast.error(err.message || 'Gagal update item.');
        } finally {
            setEditLoading(false);
        }
    };

    const statusColor = (status) => {
        const colors = { menunggu_review_admin: 'purple', diajukan: 'blue', menunggu_pengadaan: 'yellow', disetujui: 'cyan', diproses: 'orange', siap_ambil: 'green', diterima: 'green', ditolak: 'red' };
        return colors[status] || 'gray';
    };

    const statusLabel = (status) => {
        const labels = { menunggu_review_admin: 'Menunggu Review', diajukan: 'Diajukan', menunggu_pengadaan: 'Menunggu Pengadaan', disetujui: 'Disetujui', diproses: 'Diproses', siap_ambil: 'Siap Diambil', diterima: 'Diterima', ditolak: 'Ditolak' };
        return labels[status] || status;
    };

    const itemStatusLabel = (item) => {
        if (item.product_id) {
            const product = item.product;
            if (!product) return item.status;
            return `${item.status} (Stock: ${product.stock})`;
        }
        return `${item.status} (Barang Baru)`;
    };

    // MR columns
    const headerColumns = [
        {
            key: 'requester_name',
            label: 'Pemohon',
            render: (row) => row.requester_name || row.requester?.name || '-',
        },
        {
            key: 'division',
            label: 'Divisi',
            render: (row) => row.division || '-',
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
            label: 'Item',
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
            key: 'sku',
            label: 'SKU',
            render: (child) => child.product?.sku || 'Barang Baru',
        },
        {
            key: 'quantity_requested',
            label: 'Qty Minta',
            render: (child) => child.quantity_requested,
        },
        {
            key: 'stock_info',
            label: 'Info Stock',
            render: (child) => {
                if (!child.product) return <Badge color="yellow" variant="light" size="sm">Barang Baru</Badge>;
                if (child.product.stock === 0) return <Badge color="red" variant="light" size="sm">Stock Kosong</Badge>;
                if (child.product.stock < child.quantity_requested) return <Badge color="orange" variant="light" size="sm">Stock Kurang ({child.product.stock})</Badge>;
                return <Badge color="green" variant="light" size="sm">Stock Cukup ({child.product.stock})</Badge>;
            },
        },
        {
            key: 'photo',
            label: 'Foto',
            render: (child) => child.photo ? (
                <Badge color="teal" variant="light" size="sm" leftSection={<IconCamera size={12} />}>Ada Foto</Badge>
            ) : '-',
        },
        {
            key: 'notes',
            label: 'Keterangan',
            render: (child) => child.notes || '-',
        },
    ];

    const childActions = (child, parent) => (
        <Group gap="xs">
            <Button
                size="xs"
                color="blue"
                variant="subtle"
                leftSection={<IconEdit size={14} />}
                onClick={() => {
                    setEditItemData({ ...child });
                    setEditItem(child);
                    setEditPhoto(null);
                    setEditPhotoPreview(null);
                }}
            >
                Edit
            </Button>
        </Group>
    );

    const headerActions = (row) => (
        <Group gap="xs">
            {row.status === 'menunggu_review_admin' && (
                <>
                    <Button
                        size="xs"
                        color="green"
                        leftSection={<IconCheck size={14} />}
                        onClick={() => handleApprove(row)}
                        loading={loading}
                    >
                        Approve
                    </Button>
                    <Button
                        size="xs"
                        color="red"
                        leftSection={<IconX size={14} />}
                        onClick={() => setRejectModal(row)}
                    >
                        Tolak
                    </Button>
                </>
            )}
            <Button
                size="xs"
                color="gray"
                variant="subtle"
                leftSection={<IconEye size={14} />}
                onClick={() => setViewItem(row)}
            >
                Detail
            </Button>
        </Group>
    );

    // Restock columns
    const restockColumns = [
        {
            key: 'replenishment_id',
            label: 'ID Restock',
        },
        {
            key: 'product',
            label: 'Barang',
            render: (row) => row.product?.name || '-',
        },
        {
            key: 'sku',
            label: 'SKU',
            render: (row) => row.product?.sku || '-',
        },
        {
            key: 'quantity',
            label: 'Qty',
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
            key: 'requester',
            label: 'Pemohon',
            render: (row) => row.requester?.name || '-',
        },
        {
            key: 'created_at',
            label: 'Tanggal',
            render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-',
        },
        {
            key: 'notes',
            label: 'Keterangan',
            render: (row) => row.notes || '-',
        },
    ];

    const restockActions = (row) => (
        <Group gap="xs">
            <Button
                size="xs"
                color="green"
                leftSection={<IconCheck size={14} />}
                onClick={() => handleRestockApprove(row)}
                loading={loading}
            >
                Approve
            </Button>
            <Button
                size="xs"
                color="red"
                leftSection={<IconX size={14} />}
                onClick={() => setRejectModal(row)}
            >
                Tolak
            </Button>
        </Group>
    );

    return (
        <AuthenticatedLayout
            header={<PageHeader
                title="Admin Proyek"
                subtitle="Review dan approve permintaan bahan"
                search={{ value: search, placeholder: activeTab === 'mr' ? 'Cari permintaan...' : 'Cari restock...' }}
                onSearch={handleSearch}
            />}
        >
            <Head title="Admin Proyek" />

            <Tabs value={activeTab} onChange={(val) => { setActiveTab(val); setSearch(''); setPage(1); }} mb="md">
                <Tabs.List>
                    <Tabs.Tab value="mr">Material Request</Tabs.Tab>
                    <Tabs.Tab value="restock">Restock</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            <Text size="sm" c="dimmed" mb="sm">
                Menampilkan {items.length} dari {meta.total} {activeTab === 'mr' ? 'permintaan' : 'restock'}
            </Text>

            {activeTab === 'mr' ? (
                <>
                    {items.length > 0 ? (
                        <GroupedTable
                            data={items}
                            expandKey="id"
                            headerColumns={headerColumns}
                            childColumns={childColumns}
                            childActions={childActions}
                            headerActions={headerActions}
                            emptyMessage="Tidak ada permintaan pending review"
                        />
                    ) : (
                        <EmptyState
                            icon={<IconClipboardCheck size={28} />}
                            title="Tidak ada permintaan pending review"
                            description="Semua permintaan sudah di-review."
                        />
                    )}
                </>
            ) : (
                <>
                    {items.length > 0 ? (
                        <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        {restockColumns.map((col) => (
                                            <Table.Th key={col.key} style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {col.label}
                                            </Table.Th>
                                        ))}
                                        <Table.Th style={{ backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Aksi</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {items.map((row) => (
                                        <Table.Tr key={row.id}>
                                            {restockColumns.map((col) => (
                                                <Table.Td key={col.key} style={{ padding: '8px 12px', fontSize: 13 }}>
                                                    {col.render ? col.render(row) : (row[col.key] || '-')}
                                                </Table.Td>
                                            ))}
                                            <Table.Td style={{ padding: '8px 12px' }}>
                                                {restockActions(row)}
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
                            description="Belum ada restock request yang menunggu review."
                        />
                    )}
                </>
            )}

            {meta.last_page > 1 && (
                <Group justify="center" mt="md">
                    <Button variant="default" disabled={page <= 1} onClick={() => fetchItems(page - 1, search)}>Sebelumnya</Button>
                    <Text size="sm">Halaman {page} dari {meta.last_page}</Text>
                    <Button variant="default" disabled={page >= meta.last_page} onClick={() => fetchItems(page + 1, search)}>Selanjutnya</Button>
                </Group>
            )}

            {/* Reject Modal */}
            <Modal opened={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason(''); }} title="Tolak Permintaan" size="md">
                <Stack gap="md">
                    <Text size="sm">
                        {activeTab === 'mr'
                            ? <>Pemohon: <strong>{rejectModal?.requester_name || '-'}</strong> | Proyek: <strong>{rejectModal?.project?.name || '-'}</strong></>
                            : <>Barang: <strong>{rejectModal?.product?.name || '-'}</strong> | ID: <strong>{rejectModal?.replenishment_id || '-'}</strong></>
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

            {/* Edit Item Modal */}
            <Modal opened={!!editItem} onClose={() => { setEditItem(null); setEditItemData(null); setEditPhoto(null); setEditPhotoPreview(null); }} title="Edit Item" size="md">
                <Stack gap="md">
                    <TextInput
                        label="Nama Barang"
                        value={editItemData?.product_id ? (editItemData?.product?.name || '') : (editItemData?.new_item_name || '')}
                        onChange={(e) => setEditItemData(prev => ({ ...prev, new_item_name: e.currentTarget.value }))}
                        disabled={!!editItemData?.product_id}
                    />

                    <NumberInput
                        label="Jumlah Permintaan"
                        value={editItemData?.quantity_requested || 0}
                        onChange={(val) => setEditItemData(prev => ({ ...prev, quantity_requested: val }))}
                        min={1}
                    />

                    <Textarea
                        label="Keterangan"
                        value={editItemData?.notes || ''}
                        onChange={(e) => setEditItemData(prev => ({ ...prev, notes: e.currentTarget.value }))}
                        rows={2}
                    />

                    <FileInput
                        label="Foto Barang"
                        placeholder="Upload foto..."
                        accept="image/*"
                        leftSection={<IconCamera size={16} />}
                        value={editPhoto}
                        onChange={(file) => {
                            setEditPhoto(file);
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => setEditPhotoPreview(e.target.result);
                                reader.readAsDataURL(file);
                            } else {
                                setEditPhotoPreview(null);
                            }
                        }}
                        clearable
                    />
                    {editPhotoPreview && <Image src={editPhotoPreview} radius="md" h={150} fit="contain" />}
                    {!editPhotoPreview && editItemData?.photo && (
                        <Image src={`/storage/${editItemData.photo}`} radius="md" h={150} fit="contain" />
                    )}

                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => { setEditItem(null); setEditItemData(null); setEditPhoto(null); setEditPhotoPreview(null); }}>Batal</Button>
                        <Button color="blue" onClick={handleEditItem} loading={editLoading}>Simpan</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* View Detail Modal */}
            <Modal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Permintaan" size="lg">
                <Stack gap="md">
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Tanggal Permintaan</Text>
                            <Text size="sm" fw={500}>{viewItem?.request_date ? new Date(viewItem.request_date).toLocaleDateString('id-ID') : '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Pemohon</Text>
                            <Text size="sm" fw={500}>{viewItem?.requester_name || viewItem?.requester?.name || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Divisi</Text>
                            <Text size="sm" fw={500}>{viewItem?.division || '-'}</Text>
                        </div>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Proyek</Text>
                            <Text size="sm" fw={500}>{viewItem?.project?.name || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Urgensi</Text>
                            <Badge color={viewItem?.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                                {viewItem?.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                            </Badge>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Jenis Pemakaian</Text>
                            <Text size="sm" fw={500}>{viewItem?.usage_type === 'consumable' ? 'Habis Pakai' : 'Pinjam'}</Text>
                        </div>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Status</Text>
                            <Badge color={statusColor(viewItem?.status)} variant="light">{statusLabel(viewItem?.status)}</Badge>
                        </div>
                    </Group>
                    <Divider />
                    <Text fw={600} size="sm">Items ({viewItem?.items?.length || 0})</Text>
                    {viewItem?.items?.map((item, idx) => (
                        <Stack key={item.id} p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6 }} gap="xs">
                            <Group justify="space-between">
                                <Text size="sm" fw={500}>{item.product?.name || item.new_item_name || '-'}</Text>
                                <Badge color={statusColor(item.status)} variant="light" size="sm">{statusLabel(item.status)}</Badge>
                            </Group>
                            <Text size="xs" c="dimmed">SKU: {item.product?.sku || 'Barang Baru'} | Qty: {item.quantity_requested}</Text>
                            {item.notes && <Text size="xs" c="dimmed">Catatan: {item.notes}</Text>}
                            {item.photo && (
                                <Image
                                    src={item.photo.startsWith('http') ? item.photo : `/storage/${item.photo}`}
                                    radius="md"
                                    h={120}
                                    fit="contain"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setPhotoPreviewItem(item.photo)}
                                />
                            )}
                            {item.ready_photo && (
                                <div>
                                    <Text size="xs" c="dimmed" mb={4}>Foto Approve</Text>
                                    <Image
                                        src={item.ready_photo.startsWith('http') ? item.ready_photo : `/storage/${item.ready_photo}`}
                                        radius="md"
                                        h={120}
                                        fit="contain"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setPhotoPreviewItem(item.ready_photo)}
                                    />
                                </div>
                            )}
                        </Stack>
                    ))}
                </Stack>
            </Modal>

            {/* Photo Preview Modal */}
            <Modal opened={!!photoPreviewItem} onClose={() => setPhotoPreviewItem(null)} title="Foto Barang" size="lg" centered>
                <Image
                    src={photoPreviewItem?.startsWith('http') ? photoPreviewItem : `/storage/${photoPreviewItem}`}
                    radius="md"
                    fit="contain"
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
