import { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, ActionIcon, Menu, Text } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconClipboardCheck, IconTrashOff } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import ViewModal from '@/Components/Forms/ViewModal';
import StockAdjustmentForm from '@/Components/Transaction/StockAdjustmentForm';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

export default function Index({ adjustments, products }) {
    const api = useApi();
    const deleteHook = useConfirmDelete();

    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    const createForm = useForm({
        product_id: null, new_stock: 0, reason: '',
    });
    const editForm = useForm({
        product_id: null, new_stock: 0, reason: '',
    });

    const fetchData = (newPage = 1, newSearch = search, newSortField = 'created_at', newSortOrder = 'desc') => {
        router.get(route('transactions.penyesuaian-stok'), {
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
            await api.post('/api/v1/transactions/stock-adjustments', createForm.data);
            toast.success('Penyesuaian stock berhasil ditambahkan.');
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
            await api.put(`/api/v1/transactions/stock-adjustments/${editItem.id}`, editForm.data);
            toast.success('Penyesuaian stock berhasil diperbarui.');
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
            await api.del(`/api/v1/transactions/stock-adjustments/${item.id}`);
            toast.success('Penyesuaian stock berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/transactions/stock-adjustments/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} penyesuaian stock berhasil dihapus.`);
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
        { accessorKey: 'product.name', header: 'Nama Barang', cell: ({ row }) => row.original.product?.name || '-' },
        { accessorKey: 'old_stock', header: 'Stock Lama', cell: ({ row }) => row.original.old_stock },
        { accessorKey: 'new_stock', header: 'Stock Baru', cell: ({ row }) => row.original.new_stock },
        { accessorKey: 'reason', header: 'Alasan', cell: ({ row }) => row.original.reason || '-' },
        { accessorKey: 'user.name', header: 'Dibuat Oleh', cell: ({ row }) => row.original.user?.name || '-' },
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
                                    product_id: r.product_id, new_stock: r.new_stock,
                                    reason: r.reason || '',
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
            header={<PageHeader title="Penyesuaian Stok" subtitle="Kelola penyesuaian stok barang" actions={[
                { label: 'Tambah Penyesuaian', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Penyesuaian Stok" />

            {adjustments.data.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={adjustments.data}
                    total={adjustments.total}
                    page={adjustments.current_page}
                    perPage={adjustments.per_page}
                    searchValue={search}
                    searchPlaceholder="Cari penyesuaian..."
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
                    icon={<IconClipboardCheck size={28} />}
                    title="Belum ada penyesuaian stok"
                    description="Mulai tambahkan penyesuaian stok."
                    action={{ label: 'Tambah Penyesuaian', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                />
            )}

            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Penyesuaian Stok" onSubmit={handleCreate} loading={loading} width={520}>
                <StockAdjustmentForm
                    data={createForm.data} setData={createForm.setData} errors={createForm.errors}
                    products={products}
                />
            </ModalForm>

            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Penyesuaian Stok" onSubmit={handleEdit} loading={loading} width={520}>
                <StockAdjustmentForm
                    data={editForm.data} setData={editForm.setData} errors={editForm.errors}
                    products={products} isEdit
                />
            </ModalForm>

            <ViewModal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Penyesuaian Stok">
                <ViewModal.Field label="Nama Barang" value={viewItem?.product?.name || '-'} />
                <ViewModal.Field label="Kode Barang" value={viewItem?.product?.sku || '-'} />
                <ViewModal.Field label="Stock Lama" value={viewItem?.old_stock} />
                <ViewModal.Field label="Stock Baru" value={viewItem?.new_stock} />
                <ViewModal.Field label="Perubahan" value={`${viewItem?.new_stock - viewItem?.old_stock >= 0 ? '+' : ''}${viewItem?.new_stock - viewItem?.old_stock}`} />
                <ViewModal.Field label="Alasan" value={viewItem?.reason || '-'} />
                <ViewModal.Field label="Dibuat Oleh" value={viewItem?.user?.name || '-'} />
            </ViewModal>

            <DeleteModal
                opened={deleteHook.isOpen}
                onClose={deleteHook.cancel}
                onConfirm={handleDelete}
                title="Hapus Penyesuaian Stok"
                message={`Penyesuaian stok untuk "${deleteHook.itemToDelete?.product?.name}" akan dihapus.`}
                loading={deleteHook.loading}
            />

            {/* Bulk Delete Modal */}
            <DeleteModal
                opened={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Penyesuaian Stok"
                message={`${selectedRowIds.length} penyesuaian stok akan dihapus.`}
                loading={bulkLoading}
            />
        </AuthenticatedLayout>
    );
}
