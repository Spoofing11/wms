import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Table, Box, Collapse, UnstyledButton, Tabs, Modal, TextInput, NumberInput, Textarea, Select, Stack, Divider, Indicator } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconPackageImport, IconTrashOff, IconChevronDown, IconChevronUp, IconCheck } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import TrashModal from '@/Components/Forms/TrashModal';
import ViewModal from '@/Components/Forms/ViewModal';
import IncomingTransactionForm from '@/Components/Transaction/IncomingTransactionForm';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

export default function Index({ transactions, products, purchaseSources, pendingMRItems = [], pendingRestockItems = [] }) {
    const api = useApi();
    const deleteHook = useConfirmDelete();

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('semua');
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trashOpen, setTrashOpen] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [trashCount, setTrashCount] = useState(0);

    const [restockItem, setRestockItem] = useState(null);
    const [restockForm, setRestockForm] = useState({ transaction_date: '', purchase_price: 0, purchase_source_id: null, notes: '' });

    const createForm = useForm({
        product_id: null, transaction_date: '', quantity: 1,
        purchase_price: 0, purchase_source_id: null, notes: '', purchase_request_id: null,
    });
    const editForm = useForm({
        product_id: null, transaction_date: '', quantity: 1,
        purchase_price: 0, purchase_source_id: null, notes: '',
    });

    useEffect(() => {
        api.get('/api/v1/incoming-transactions/trashed', { per_page: 1 })
            .then((r) => setTrashCount(r.meta?.total || 0))
            .catch(() => {});
    }, []);

    const fetchData = (newPage = 1, newSearch = search, newSortField = 'created_at', newSortOrder = 'desc') => {
        router.get(route('transactions.barang-masuk'), {
            page: newPage,
            search: newSearch,
            sort_field: newSortField,
            sort_order: newSortOrder,
        }, { preserveState: true, replace: true });
    };

    const debounceRef = useRef(null);
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchData(1, val), 300);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/v1/transactions/incoming', createForm.data);
            toast.success('Transaksi barang masuk berhasil ditambahkan.');
            setCreateOpen(false);
            createForm.reset();
            router.reload();
        } catch (err) {
            if (err.errors) createForm.setError(err.errors);
            else toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/api/v1/transactions/incoming/${editItem.id}`, editForm.data);
            toast.success('Transaksi barang masuk berhasil diperbarui.');
            setEditItem(null);
            editForm.reset();
            router.reload();
        } catch (err) {
            if (err.errors) editForm.setError(err.errors);
            else toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        await deleteHook.execute(async (item) => {
            await api.del(`/api/v1/transactions/incoming/${item.id}`);
            toast.success('Transaksi barang masuk berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/transactions/incoming/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} transaksi barang masuk berhasil dihapus.`);
            setSelectedRowIds([]);
            setBulkDeleteOpen(false);
            router.reload();
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus data.');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleRestockReceive = async () => {
        if (!restockItem) return;
        setLoading(true);
        try {
            await api.post(`/api/v1/stock-replenishments/${restockItem.id}/receive`, restockForm);
            toast.success('Restock berhasil diterima. Stock bertambah.');
            setRestockItem(null);
            setRestockForm({ transaction_date: '', purchase_price: 0, purchase_source_id: null, notes: '' });
            router.reload();
        } catch (err) {
            if (err.errors) toast.error(Object.values(err.errors).flat().join(', '));
            else toast.error(err.message || 'Gagal menerima restock.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { accessorKey: 'transaction_id', header: 'ID Transaksi' },
        { accessorKey: 'transaction_date', header: 'Tanggal Masuk', cell: ({ row }) => row.original.transaction_date || '-' },
        { accessorKey: 'product.name', header: 'Nama Barang', cell: ({ row }) => row.original.product?.name || '-' },
        { accessorKey: 'quantity', header: 'Jumlah Masuk', cell: ({ row }) => row.original.quantity },
        {
            accessorKey: 'purchase_price', header: 'Harga Pembelian',
            cell: ({ row }) => row.original.purchase_price ? `Rp ${Number(row.original.purchase_price).toLocaleString('id-ID')}` : '-',
        },
        { accessorKey: 'purchase_source.name', header: 'Sumber Pembelian', cell: ({ row }) => row.original.purchase_source?.name || '-' },
        {
            id: 'actions', header: '', size: 50,
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <Menu shadow="md" width={200}>
                        <Menu.Target><ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon></Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(r)}>Lihat Detail</Menu.Item>
                            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => {
                                editForm.setData({
                                    product_id: r.product_id, transaction_date: r.transaction_date,
                                    quantity: r.quantity, purchase_price: r.purchase_price,
                                    purchase_source_id: r.purchase_source?.id, notes: r.notes || '',
                                });
                                setEditItem(r);
                            }}>Edit</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => deleteHook.confirm(r)}>Hapus</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                );
            },
        },
    ];

    const thStyle = { backgroundColor: '#faf6f1', padding: '8px 12px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' };
    const tdStyle = { padding: '8px 12px', fontSize: 13 };

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Barang Masuk" subtitle="Kelola transaksi barang masuk" actions={[
                { custom: (
                    <Indicator label={trashCount} color="red" size={18} withBorder disabled={trashCount === 0}>
                        <ActionIcon variant="outline" color="red" onClick={() => setTrashOpen(true)} size="lg" radius="sm">
                            <IconTrash size={18} />
                        </ActionIcon>
                    </Indicator>
                )},
                { label: 'Tambah Transaksi', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Barang Masuk" />

            <Tabs value={activeTab} onChange={setActiveTab} mb="md">
                <Tabs.List>
                    <Tabs.Tab value="semua">Semua</Tabs.Tab>
                    <Tabs.Tab value="restock">
                        Restock
                        {pendingRestockItems.length > 0 && (
                            <Badge color="blue" variant="light" size="xs" ml={4}>{pendingRestockItems.length}</Badge>
                        )}
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {activeTab === 'semua' && pendingMRItems.length > 0 && (
                <Box p="md" mb="md" style={{ border: '1px solid #3b82f6', borderRadius: 8, backgroundColor: '#eff6ff' }}>
                    <UnstyledButton onClick={() => setRequestOpen(!requestOpen)} style={{ width: '100%' }}>
                        <Group justify="space-between">
                            <Group gap="sm">
                                {requestOpen ? <IconChevronUp size={18} color="#1d4ed8" /> : <IconChevronDown size={18} color="#1d4ed8" />}
                                <div>
                                    <Text fw={600} size="sm" style={{ color: '#1d4ed8' }}>Request dari Material Request</Text>
                                    <Text size="xs" c="dimmed">Barang dari MR yang perlu di-input sebagai barang masuk</Text>
                                </div>
                            </Group>
                            <Badge color="blue" variant="light">{pendingMRItems.length} item pending</Badge>
                        </Group>
                    </UnstyledButton>
                    <Collapse in={requestOpen}>
                        <Box mt="md" style={{ overflowX: 'auto', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ backgroundColor: '#dbeafe', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Nama Barang</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#dbeafe', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>SKU</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#dbeafe', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Qty</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#dbeafe', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Proyek</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#dbeafe', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Pemohon</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#dbeafe', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Aksi</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {pendingMRItems.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500 }}>{item.item_name}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.product?.sku || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.quantity}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.project_name || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.requester_name || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px' }}>
                                                <Button
                                                    size="xs"
                                                    color="green"
                                                    leftSection={<IconPlus size={14} />}
                                                    onClick={() => {
                                                        createForm.setData({
                                                            ...createForm.data,
                                                            product_id: item.product_id ? String(item.product_id) : null,
                                                            quantity: item.quantity,
                                                            purchase_request_id: item.id,
                                                            notes: `Dari MR - ${item.requester_name}`,
                                                        });
                                                        setCreateOpen(true);
                                                    }}
                                                >
                                                    Tambah
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Collapse>
                </Box>
            )}

            {activeTab === 'semua' ? (
                <>
                    {transactions.data.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={transactions.data}
                            total={transactions.total}
                            page={transactions.current_page}
                            perPage={transactions.per_page}
                            searchValue={search}
                            searchPlaceholder="Cari transaksi..."
                            onSearch={handleSearch}
                            onPageChange={(p) => fetchData(p)}
                            onSortChange={(field, order) => fetchData(1, search, field, order)}
                            sortField="created_at"
                            sortOrder="desc"
                            enableSelection
                            selectedRowIds={selectedRowIds}
                            onSelectionChange={setSelectedRowIds}
                            onBulkDelete={() => setBulkDeleteOpen(true)}
                        />
                    ) : (
                        <EmptyState
                            icon={<IconPackageImport size={28} />}
                            title="Belum ada transaksi barang masuk"
                            description="Mulai tambahkan transaksi barang masuk."
                            action={{ label: 'Tambah Transaksi', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                        />
                    )}
                </>
            ) : (
                <>
                    {pendingRestockItems.length > 0 ? (
                        <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={thStyle}>ID Restock</Table.Th>
                                        <Table.Th style={thStyle}>Barang</Table.Th>
                                        <Table.Th style={thStyle}>SKU</Table.Th>
                                        <Table.Th style={thStyle}>Qty</Table.Th>
                                        <Table.Th style={thStyle}>Urgensi</Table.Th>
                                        <Table.Th style={thStyle}>Pemohon</Table.Th>
                                        <Table.Th style={thStyle}>Disetujui Oleh</Table.Th>
                                        <Table.Th style={thStyle}>Aksi</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {pendingRestockItems.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td style={tdStyle}>{item.replenishment_id}</Table.Td>
                                            <Table.Td style={tdStyle}>{item.product?.name || '-'}</Table.Td>
                                            <Table.Td style={tdStyle}>{item.product?.sku || '-'}</Table.Td>
                                            <Table.Td style={tdStyle}>{item.quantity}</Table.Td>
                                            <Table.Td style={tdStyle}>
                                                <Badge color={item.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                                                    {item.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={tdStyle}>{item.requester?.name || '-'}</Table.Td>
                                            <Table.Td style={tdStyle}>{item.approvedByPurchasing?.name || '-'}</Table.Td>
                                            <Table.Td style={tdStyle}>
                                                <Button
                                                    size="xs"
                                                    color="green"
                                                    leftSection={<IconCheck size={14} />}
                                                    onClick={() => {
                                                        setRestockItem(item);
                                                        setRestockForm({
                                                            transaction_date: new Date().toISOString().split('T')[0],
                                                            purchase_price: 0,
                                                            purchase_source_id: null,
                                                            notes: `Restock ${item.replenishment_id}`,
                                                        });
                                                    }}
                                                >
                                                    Terima
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    ) : (
                        <EmptyState
                            icon={<IconPackageImport size={28} />}
                            title="Tidak ada restock pending"
                            description="Belum ada restock yang perlu diterima."
                        />
                    )}
                </>
            )}

            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Barang Masuk" onSubmit={handleCreate} loading={loading} width={640}>
                <IncomingTransactionForm
                    data={createForm.data} setData={createForm.setData} errors={createForm.errors}
                    products={products} purchaseSources={purchaseSources}
                />
            </ModalForm>

            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Barang Masuk" onSubmit={handleEdit} loading={loading} width={640}>
                <IncomingTransactionForm
                    data={editForm.data} setData={editForm.setData} errors={editForm.errors}
                    products={products} purchaseSources={purchaseSources} isEdit
                />
            </ModalForm>

            <ViewModal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Barang Masuk">
                <ViewModal.Field label="ID Transaksi" value={viewItem?.transaction_id} />
                <ViewModal.Field label="Tanggal Masuk" value={viewItem?.transaction_date} />
                <ViewModal.Field label="Nama Barang" value={viewItem?.product?.name || '-'} />
                <ViewModal.Field label="Kode Barang" value={viewItem?.product?.sku || '-'} />
                <ViewModal.Field label="Jumlah Masuk" value={viewItem?.quantity} />
                <ViewModal.Field label="Harga Pembelian" value={viewItem?.purchase_price ? `Rp ${Number(viewItem.purchase_price).toLocaleString('id-ID')}` : '-'} />
                <ViewModal.Field label="Sumber Pembelian" value={viewItem?.purchase_source?.name || '-'} />
                <ViewModal.Field label="Catatan" value={viewItem?.notes || '-'} />
                <ViewModal.Field label="Dibuat Oleh" value={viewItem?.user?.name || '-'} />
            </ViewModal>

            {/* Restock Receive Modal */}
            <Modal opened={!!restockItem} onClose={() => setRestockItem(null)} title={`Terima Restock - ${restockItem?.replenishment_id || ''}`} size="md">
                <Stack gap="md">
                    <Box p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fafafa' }}>
                        <Text size="xs" c="dimmed">Barang</Text>
                        <Text size="sm" fw={600}>{restockItem?.product?.name}</Text>
                        <Text size="xs" c="dimmed">SKU: {restockItem?.product?.sku} | Qty: {restockItem?.quantity}</Text>
                        <Text size="xs" c="dimmed">Urgensi: {restockItem?.urgency === 'urgent' ? 'Urgent' : 'Normal'}</Text>
                    </Box>
                    <Divider />
                    <TextInput
                        label="Tanggal Masuk"
                        type="date"
                        value={restockForm.transaction_date}
                        onChange={(e) => setRestockForm(prev => ({ ...prev, transaction_date: e.currentTarget.value }))}
                        required
                    />
                    <NumberInput
                        label="Harga Pembelian"
                        value={restockForm.purchase_price}
                        onChange={(val) => setRestockForm(prev => ({ ...prev, purchase_price: val || 0 }))}
                        min={0}
                        thousandSeparator
                        prefix="Rp "
                    />
                    <Select
                        label="Sumber Pembelian"
                        data={purchaseSources.map(ps => ({ value: String(ps.id), label: ps.name }))}
                        value={restockForm.purchase_source_id ? String(restockForm.purchase_source_id) : null}
                        onChange={(val) => setRestockForm(prev => ({ ...prev, purchase_source_id: val ? Number(val) : null }))}
                        searchable
                        clearable
                    />
                    <Textarea
                        label="Catatan"
                        value={restockForm.notes}
                        onChange={(e) => setRestockForm(prev => ({ ...prev, notes: e.currentTarget.value }))}
                        rows={2}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setRestockItem(null)}>Batal</Button>
                        <Button color="green" leftSection={<IconCheck size={16} />} onClick={handleRestockReceive} loading={loading}>
                            Terima & Tambah Stock
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <DeleteModal
                opened={deleteHook.isOpen}
                onClose={deleteHook.cancel}
                onConfirm={handleDelete}
                title="Hapus Transaksi"
                message={`Transaksi "${deleteHook.itemToDelete?.transaction_id}" akan dihapus.`}
                loading={deleteHook.loading}
            />

            {/* Bulk Delete Modal */}
            <DeleteModal
                opened={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Transaksi"
                message={`${selectedRowIds.length} transaksi barang masuk akan dihapus.`}
                loading={bulkLoading}
            />

            <TrashModal
                opened={trashOpen}
                onClose={() => setTrashOpen(false)}
                title="Barang Masuk"
                apiEndpoint="/api/v1/transactions/incoming"
                columns={[
                    { key: 'transaction_id', label: 'ID Transaksi' },
                    { key: 'product', label: 'Nama Barang', render: (item) => item.product?.name || '-' },
                ]}
                onRefresh={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
