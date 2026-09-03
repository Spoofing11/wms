import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Indicator } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconPackageExport, IconTrashOff } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import TrashModal from '@/Components/Forms/TrashModal';
import ViewModal from '@/Components/Forms/ViewModal';
import OutgoingTransactionForm from '@/Components/Transaction/OutgoingTransactionForm';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

export default function Index({ transactions, products, projects }) {
    const api = useApi();
    const deleteHook = useConfirmDelete();

    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trashOpen, setTrashOpen] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [trashCount, setTrashCount] = useState(0);

    const createForm = useForm({
        product_id: null, transaction_date: '', quantity: 1,
        usage_type: '', condition: 'good', project_id: null,
        taken_by: '', pickup_time: '', notes: '',
    });
    const editForm = useForm({
        product_id: null, transaction_date: '', quantity: 1,
        usage_type: '', condition: 'good', project_id: null,
        taken_by: '', pickup_time: '', notes: '',
    });

    useEffect(() => {
        api.get('/api/v1/outgoing-transactions/trashed', { per_page: 1 })
            .then((r) => setTrashCount(r.meta?.total || 0))
            .catch(() => {});
    }, []);

    const fetchData = (newPage = 1, newSearch = search, newSortField = 'created_at', newSortOrder = 'desc') => {
        router.get(route('transactions.barang-keluar'), {
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
            await api.post('/api/v1/transactions/outgoing', createForm.data);
            toast.success('Transaksi barang keluar berhasil ditambahkan.');
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
            await api.put(`/api/v1/transactions/outgoing/${editItem.id}`, editForm.data);
            toast.success('Transaksi barang keluar berhasil diperbarui.');
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
            await api.del(`/api/v1/transactions/outgoing/${item.id}`);
            toast.success('Transaksi barang keluar berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/transactions/outgoing/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} transaksi barang keluar berhasil dihapus.`);
            setSelectedRowIds([]);
            setBulkDeleteOpen(false);
            router.reload();
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus data.');
        } finally {
            setBulkLoading(false);
        }
    };

    const columns = [
        { accessorKey: 'transaction_date', header: 'Tanggal Keluar', cell: ({ row }) => row.original.transaction_date || '-' },
        { accessorKey: 'product.name', header: 'Nama Barang', cell: ({ row }) => row.original.product?.name || '-' },
        { accessorKey: 'quantity', header: 'Jumlah Keluar', cell: ({ row }) => row.original.quantity },
        { accessorKey: 'usage_type', header: 'Jenis Pengeluaran', cell: ({ row }) => row.original.usage_type || '-' },
        { accessorKey: 'project.name', header: 'Nama Proyek', cell: ({ row }) => row.original.project?.name || row.original.project_name || '-' },
        { accessorKey: 'condition', header: 'Kondisi', cell: ({ row }) => row.original.condition === 'good' ? 'Baik' : 'Rusak' },
        { accessorKey: 'taken_by', header: 'Pemakai', cell: ({ row }) => row.original.taken_by || '-' },
        { accessorKey: 'user.name', header: 'Di Input Oleh', cell: ({ row }) => row.original.user?.name || '-' },
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
                                    quantity: r.quantity, usage_type: r.usage_type || '',
                                    condition: r.condition || 'good', project_id: r.project?.id || null,
                                    taken_by: r.taken_by || '', pickup_time: r.pickup_time || '',
                                    notes: r.notes || '',
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

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Barang Keluar" subtitle="Kelola transaksi barang keluar" actions={[
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
            <Head title="Barang Keluar" />

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
                    icon={<IconPackageExport size={28} />}
                    title="Belum ada transaksi barang keluar"
                    description="Mulai tambahkan transaksi barang keluar."
                    action={{ label: 'Tambah Transaksi', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                />
            )}

            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Barang Keluar" onSubmit={handleCreate} loading={loading} width={640}>
                <OutgoingTransactionForm
                    data={createForm.data} setData={createForm.setData} errors={createForm.errors}
                    products={products} projects={projects}
                />
            </ModalForm>

            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Barang Keluar" onSubmit={handleEdit} loading={loading} width={640}>
                <OutgoingTransactionForm
                    data={editForm.data} setData={editForm.setData} errors={editForm.errors}
                    products={products} projects={projects} isEdit
                />
            </ModalForm>

            <ViewModal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Barang Keluar">
                <ViewModal.Field label="ID Transaksi" value={viewItem?.transaction_id} />
                <ViewModal.Field label="Tanggal Keluar" value={viewItem?.transaction_date} />
                <ViewModal.Field label="Nama Barang" value={viewItem?.product?.name || '-'} />
                <ViewModal.Field label="Kode Barang" value={viewItem?.product?.sku || '-'} />
                <ViewModal.Field label="Jumlah Keluar" value={viewItem?.quantity} />
                <ViewModal.Field label="Jenis Pengeluaran" value={viewItem?.usage_type || '-'} />
                <ViewModal.Field label="Kondisi Barang" value={viewItem?.condition === 'good' ? 'Baik' : 'Rusak'} />
                <ViewModal.Field label="Nama Proyek" value={viewItem?.project?.name || viewItem?.project_name || '-'} />
                <ViewModal.Field label="Pemakai" value={viewItem?.taken_by || '-'} />
                <ViewModal.Field label="Waktu Pengambilan" value={viewItem?.pickup_time || '-'} />
                <ViewModal.Field label="Keterangan" value={viewItem?.notes || '-'} />
                <ViewModal.Field label="Di Input Oleh" value={viewItem?.user?.name || '-'} />
            </ViewModal>

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
                message={`${selectedRowIds.length} transaksi barang keluar akan dihapus.`}
                loading={bulkLoading}
            />

            <TrashModal
                opened={trashOpen}
                onClose={() => setTrashOpen(false)}
                title="Barang Keluar"
                apiEndpoint="/api/v1/transactions/outgoing"
                columns={[
                    { key: 'transaction_id', label: 'ID Transaksi' },
                    { key: 'product', label: 'Nama Barang', render: (item) => item.product?.name || '-' },
                ]}
                onRefresh={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
