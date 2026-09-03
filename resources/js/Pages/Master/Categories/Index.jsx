import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Tooltip, Indicator } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconTag, IconTrashOff } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import TrashModal from '@/Components/Forms/TrashModal';
import ViewModal from '@/Components/Forms/ViewModal';
import CategoryForm from '@/Components/Master/CategoryForm';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

const COLUMNS = [
    { accessorKey: 'code', header: 'Kode' },
    { accessorKey: 'name', header: 'Nama Kategori' },
    { accessorKey: 'products_count', header: 'Jumlah Produk', cell: ({ row }) => <Badge variant="light" color="brand">{row.original.products_count ?? 0}</Badge> },
];

export default function Index({ categories }) {
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

    const createForm = useForm({ name: '', code: '' });
    const editForm = useForm({ name: '', code: '' });

    useEffect(() => {
        api.get('/api/v1/master/categories/trashed', { per_page: 1 })
            .then((r) => setTrashCount(r.meta?.total || 0))
            .catch(() => {});
    }, []);

    const fetchData = (newPage = 1, newSearch = search, newSortField = 'created_at', newSortOrder = 'desc') => {
        router.get(route('master.categories.index'), {
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
            await api.post('/api/v1/master/categories', createForm.data);
            toast.success('Kategori berhasil ditambahkan.');
            setCreateOpen(false);
            createForm.reset();
            router.reload();
        } catch (err) {
            if (err.errors) createForm.setError(err.errors);
            else toast.error(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/api/v1/master/categories/${editItem.id}`, editForm.data);
            toast.success('Kategori berhasil diperbarui.');
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
            await api.del(`/api/v1/master/categories/${item.id}`);
            toast.success('Kategori berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/master/categories/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} kategori berhasil dihapus.`);
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
                <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(row)}>Lihat Detail</Menu.Item>
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => { editForm.setData({ name: row.name, code: row.code }); setEditItem(row); }}>Edit</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => deleteHook.confirm(row)}>Hapus</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    const columns = [...COLUMNS, { id: 'actions', header: '', cell: ({ row }) => actions(row.original), size: 50 }];

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Kategori" subtitle="Kelola data kategori produk" actions={[
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
                { label: 'Tambah Kategori', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Kategori" />

            {categories.data.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={categories.data}
                    total={categories.total}
                    page={categories.current_page}
                    perPage={categories.per_page}
                    searchValue={search}
                    searchPlaceholder="Cari kategori..."
                    onSearch={handleSearch}
                    onPageChange={(p) => fetchData(p)}
                    onSortChange={(field, order) => fetchData(1, search, field, order)}
                    sortField="created_at"
                    sortOrder="desc"
                    stickyColumns={[{ accessorKey: 'code', minWidth: 150 }]}
                    enableSelection
                    selectedRowIds={selectedRowIds}
                    onSelectionChange={setSelectedRowIds}
                    onBulkDelete={() => setBulkDeleteOpen(true)}
                />
            ) : (
                <EmptyState
                    icon={<IconTag size={28} />}
                    title="Belum ada kategori"
                    description="Mulai tambahkan kategori untuk mengelola produk Anda."
                    action={{ label: 'Tambah Kategori', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                />
            )}

            {/* Create Modal */}
            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Kategori" onSubmit={handleCreate} loading={loading}>
                <CategoryForm data={createForm.data} setData={createForm.setData} errors={createForm.errors} />
            </ModalForm>

            {/* Edit Modal */}
            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Kategori" onSubmit={handleEdit} loading={loading}>
                <CategoryForm data={editForm.data} setData={editForm.setData} errors={editForm.errors} />
            </ModalForm>

            {/* View Modal */}
            <ViewModal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Kategori" subtitle={viewItem?.code}>
                <ViewModal.Section title="Informasi Kategori">
                    <ViewModal.FieldGrid>
                        <ViewModal.Field label="Kode" value={viewItem?.code} />
                        <ViewModal.Field label="Nama Kategori" value={viewItem?.name} />
                        <ViewModal.Field label="Jumlah Produk" value={`${viewItem?.products_count ?? 0} produk`} />
                        <ViewModal.Field label="Dibuat" value={viewItem?.created_at ? new Date(viewItem.created_at).toLocaleDateString('id-ID') : '-'} />
                    </ViewModal.FieldGrid>
                </ViewModal.Section>
            </ViewModal>

            {/* Delete Modal */}
            <DeleteModal
                opened={deleteHook.isOpen}
                onClose={deleteHook.cancel}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                message={`Kategori "${deleteHook.itemToDelete?.name}" akan dihapus.`}
                loading={deleteHook.loading}
            />

            {/* Bulk Delete Modal */}
            <DeleteModal
                opened={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Kategori"
                message={`${selectedRowIds.length} kategori akan dihapus.`}
                loading={bulkLoading}
            />

            <TrashModal
                opened={trashOpen}
                onClose={() => setTrashOpen(false)}
                title="Kategori"
                apiEndpoint="/api/v1/master/categories"
                columns={[
                    { key: 'code', label: 'Kode' },
                    { key: 'name', label: 'Nama Kategori' },
                ]}
                onRefresh={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
