import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Anchor, Indicator } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconTruck, IconTrashOff } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import TrashModal from '@/Components/Forms/TrashModal';
import ViewModal from '@/Components/Forms/ViewModal';
import PurchaseSourceForm from '@/Components/Master/PurchaseSourceForm';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

const COLUMNS = [
    { accessorKey: 'source_type', header: 'Platform', cell: ({ row }) => <Badge variant="light" color="blue">{row.original.source_type}</Badge> },
    { accessorKey: 'name', header: 'Nama Toko' },
    { accessorKey: 'products_count', header: 'Jumlah Produk', cell: ({ row }) => <Badge variant="light" color="brand">{row.original.products_count ?? 0}</Badge> },
];

export default function Index({ purchaseSources }) {
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

    const createForm = useForm({ source_type: '', name: '', notes: '' });
    const editForm = useForm({ source_type: '', name: '', notes: '' });

    useEffect(() => {
        api.get('/api/v1/master/purchase-sources/trashed', { per_page: 1 })
            .then((r) => setTrashCount(r.meta?.total || 0))
            .catch(() => {});
    }, []);

    const fetchData = (newPage = 1, newSearch = search, newSortField = 'created_at', newSortOrder = 'desc') => {
        router.get(route('master.purchase-sources.index'), {
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
            await api.post('/api/v1/master/purchase-sources', createForm.data);
            toast.success('Sumber pembelian berhasil ditambahkan.');
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
            await api.put(`/api/v1/master/purchase-sources/${editItem.id}`, editForm.data);
            toast.success('Sumber pembelian berhasil diperbarui.');
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
            await api.del(`/api/v1/master/purchase-sources/${item.id}`);
            toast.success('Sumber pembelian berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/master/purchase-sources/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} sumber pembelian berhasil dihapus.`);
            setSelectedRowIds([]);
            setBulkDeleteOpen(false);
            router.reload();
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus data.');
        } finally {
            setBulkLoading(false);
        }
    };

    const actions = (row) => (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(row)}>Lihat Detail</Menu.Item>
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => { editForm.setData({ source_type: row.source_type, name: row.name, notes: row.notes || '' }); setEditItem(row); }}>Edit</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => deleteHook.confirm(row)}>Hapus</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    const columns = [...COLUMNS, { id: 'actions', header: '', cell: ({ row }) => actions(row.original), size: 50 }];

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Sumber Pembelian" subtitle="Kelola data sumber pembelian" actions={[
                { custom: (
                    trashCount > 0 ? (
                        <Indicator label={trashCount} color="red" size={18} withBorder>
                            <ActionIcon variant="outline" color="red" onClick={() => setTrashOpen(true)} size="lg" radius="sm">
                                <IconTrash size={18} />
                            </ActionIcon>
                        </Indicator>
                    ) : (
                        <ActionIcon variant="outline" color="red" onClick={() => setTrashOpen(true)} size="lg" radius="sm">
                            <IconTrash size={18} />
                        </ActionIcon>
                    )
                )},
                { label: 'Tambah Sumber', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Sumber Pembelian" />

            {purchaseSources.data.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={purchaseSources.data}
                    total={purchaseSources.total}
                    page={purchaseSources.current_page}
                    perPage={purchaseSources.per_page}
                    searchValue={search}
                    searchPlaceholder="Cari sumber pembelian..."
                    onSearch={handleSearch}
                    onPageChange={(p) => fetchData(p)}
                    onSortChange={(field, order) => fetchData(1, search, field, order)}
                    sortField="created_at"
                    sortOrder="desc"
                    stickyColumns={[{ accessorKey: 'name', minWidth: 180 }]}
                    enableSelection
                    selectedRowIds={selectedRowIds}
                    onSelectionChange={setSelectedRowIds}
                    onBulkDelete={() => setBulkDeleteOpen(true)}
                />
            ) : (
                <EmptyState
                    icon={<IconTruck size={28} />}
                    title="Belum ada sumber pembelian"
                    description="Mulai tambahkan sumber pembelian."
                    action={{ label: 'Tambah Sumber', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                />
            )}

            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Sumber Pembelian" onSubmit={handleCreate} loading={loading} width={560}>
                <PurchaseSourceForm data={createForm.data} setData={createForm.setData} errors={createForm.errors} />
            </ModalForm>

            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Sumber Pembelian" onSubmit={handleEdit} loading={loading} width={560}>
                <PurchaseSourceForm data={editForm.data} setData={editForm.setData} errors={editForm.errors} />
            </ModalForm>

            <ViewModal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Sumber Pembelian" subtitle={viewItem?.name}>
                <ViewModal.Section title="Informasi Toko">
                    <ViewModal.FieldGrid>
                        <ViewModal.Field label="Platform" value={viewItem?.source_type} />
                        <ViewModal.Field label="Nama Toko" value={viewItem?.name} />
                    </ViewModal.FieldGrid>
                </ViewModal.Section>
                <ViewModal.Section title="Detail Lainnya">
                    <ViewModal.FieldGrid>
                        <ViewModal.Field label="Alamat / Link" value={viewItem?.notes} />
                        <ViewModal.Field label="Jumlah Produk" value={`${viewItem?.products_count ?? 0} produk`} />
                    </ViewModal.FieldGrid>
                </ViewModal.Section>
            </ViewModal>

            <DeleteModal
                opened={deleteHook.isOpen}
                onClose={deleteHook.cancel}
                onConfirm={handleDelete}
                title="Hapus Sumber Pembelian"
                message={`Sumber pembelian "${deleteHook.itemToDelete?.name}" akan dihapus.`}
                loading={deleteHook.loading}
            />

            {/* Bulk Delete Modal */}
            <DeleteModal
                opened={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Sumber Pembelian"
                message={`${selectedRowIds.length} sumber pembelian akan dihapus.`}
                loading={bulkLoading}
            />

            <TrashModal
                opened={trashOpen}
                onClose={() => setTrashOpen(false)}
                title="Sumber Pembelian"
                apiEndpoint="/api/v1/master/purchase-sources"
                columns={[
                    { key: 'source_type', label: 'Platform', render: (item) => item.source_type },
                    { key: 'name', label: 'Nama Toko' },
                ]}
                onRefresh={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
