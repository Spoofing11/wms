import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Image, Select, Table, Box, Collapse, UnstyledButton, Modal, Indicator } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconPackage, IconTrashOff, IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import TrashModal from '@/Components/Forms/TrashModal';
import ViewModal from '@/Components/Forms/ViewModal';
import ProductForm from '@/Components/Master/ProductForm';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

export default function Index({ products, categories, purchaseSources, locations, pendingNewItems = [] }) {
    const api = useApi();
    const deleteHook = useConfirmDelete();

    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [trashOpen, setTrashOpen] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [trashCount, setTrashCount] = useState(0);

    const createForm = useForm({
        category_id: null, name: '', min_stock: 0,
        purchase_source_id: null, location_id: null, image: null, purchase_request_id: null,
    });
    const editForm = useForm({
        category_id: null, name: '', min_stock: 0, sku: '',
        purchase_source_id: null, location_id: null, image: null, image_url: null,
    });

    useEffect(() => {
        api.get('/api/v1/master/products/trashed', { per_page: 1 })
            .then((r) => setTrashCount(r.meta?.total || 0))
            .catch(() => { });
    }, []);

    const fetchData = (newPage = 1, newSearch = search, newSortField = 'created_at', newSortOrder = 'desc') => {
        router.get(route('master.products.index'), {
            page: newPage,
            search: newSearch,
            sort_field: newSortField,
            sort_order: newSortOrder,
            category_id: filterCategory || undefined,
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
            const formData = new FormData();
            Object.entries(createForm.data).forEach(([key, val]) => {
                if (val !== null && val !== undefined) formData.append(key, val);
            });
            await api.upload('/api/v1/master/products', formData);
            toast.success('Produk berhasil ditambahkan.');
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
            const formData = new FormData();
            Object.entries(editForm.data).forEach(([key, val]) => {
                if (val !== null && val !== undefined) formData.append(key, val);
            });
            formData.append('_method', 'PUT');
            await api.upload(`/api/v1/master/products/${editItem.id}`, formData, 'POST');
            toast.success('Produk berhasil diperbarui.');
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
            await api.del(`/api/v1/master/products/${item.id}`);
            toast.success('Produk berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/master/products/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} produk berhasil dihapus.`);
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
        { accessorKey: 'category.name', header: 'Kategori', cell: ({ row }) => <Badge variant="light" color="brand">{row.original.category?.code}</Badge> },
        { accessorKey: 'sku', header: 'Kode Barang' },
        { accessorKey: 'name', header: 'Nama Barang' },
        { accessorKey: 'min_stock', header: 'Stok Min', cell: ({ row }) => row.original.min_stock },
        { accessorKey: 'location.name', header: 'Lokasi', cell: ({ row }) => row.original.location?.name || '-' },
        {
            accessorKey: 'image',
            header: 'Gambar',
            cell: ({ row }) => row.original.image
                ? (
                    <UnstyledButton onClick={() => setImagePreview(`/storage/${row.original.image}`)} style={{ cursor: 'pointer', display: 'block', padding: 0 }}>
                        <Box w={40} h={40} style={{ overflow: 'hidden', borderRadius: 6 }}>
                            <Image src={`/storage/${row.original.image}`} w={40} h={40} fit="cover" />
                        </Box>
                    </UnstyledButton>
                )
                : <Box w={40} h={40} style={{ borderRadius: 6, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPackage size={16} color="#999" /></Box>,
            size: 60,
            minSize: 60,
            maxSize: 60,
        },
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
                                    category_id: r.category_id, name: r.name, min_stock: r.min_stock, sku: r.sku,
                                    purchase_source_id: r.purchase_source_id, location_id: r.location_id,
                                    image: null, image_url: r.image ? `/storage/${r.image}` : null,
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
            header={<PageHeader title="Data Barang" subtitle="Kelola data barang / produk" actions={[
                {
                    custom: (
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
                    )
                },
                { label: 'Tambah Barang', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Data Barang" />

            {pendingNewItems.length > 0 && (
                <Box p="md" mb="md" style={{ border: '1px solid #f59e0b', borderRadius: 8, backgroundColor: '#fffbeb' }}>
                    <UnstyledButton onClick={() => setRequestOpen(!requestOpen)} style={{ width: '100%' }}>
                        <Group justify="space-between">
                            <Group gap="sm">
                                {requestOpen ? <IconChevronUp size={18} color="#b45309" /> : <IconChevronDown size={18} color="#b45309" />}
                                <div>
                                    <Text fw={600} size="sm" style={{ color: '#b45309' }}>Request Data Barang Baru</Text>
                                    <Text size="xs" c="dimmed">Barang baru dari Material Request yang perlu didata</Text>
                                </div>
                            </Group>
                            <Badge color="yellow" variant="light">{pendingNewItems.length} item pending</Badge>
                        </Group>
                    </UnstyledButton>
                    <Collapse in={requestOpen}>
                        <Box mt="md" style={{ overflowX: 'auto', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={{ backgroundColor: '#fef3c7', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Nama Barang</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#fef3c7', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Qty</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#fef3c7', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Proyek</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#fef3c7', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Pemohon</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#fef3c7', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Keterangan</Table.Th>
                                        <Table.Th style={{ backgroundColor: '#fef3c7', padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>Aksi</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {pendingNewItems.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 500 }}>{item.item_name}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.quantity}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.project_name || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.requester_name || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px', fontSize: 13 }}>{item.notes || '-'}</Table.Td>
                                            <Table.Td style={{ padding: '8px 12px' }}>
                                                <Button
                                                    size="xs"
                                                    color="green"
                                                    leftSection={<IconPlus size={14} />}
                                                    onClick={() => {
                                                        createForm.setData({
                                                            ...createForm.data,
                                                            name: item.item_name,
                                                            purchase_request_id: item.id,
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

            {products.data.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={products.data}
                    total={products.total}
                    page={products.current_page}
                    perPage={products.per_page}
                    searchValue={search}
                    searchPlaceholder="Cari barang..."
                    onSearch={handleSearch}
                    onPageChange={(p) => fetchData(p)}
                    onSortChange={(field, order) => fetchData(1, search, field, order)}
                    sortField="created_at"
                    sortOrder="desc"
                    verticalSpacing="xs"
                    stickyColumns={[{ accessorKey: 'sku', minWidth: 140 }]}
                    enableSelection
                    selectedRowIds={selectedRowIds}
                    onSelectionChange={setSelectedRowIds}
                    onBulkDelete={() => setBulkDeleteOpen(true)}
                />
            ) : (
                <EmptyState
                    icon={<IconPackage size={28} />}
                    title="Belum ada data barang"
                    description="Mulai tambahkan barang."
                    action={{ label: 'Tambah Barang', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                />
            )}

            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Barang" onSubmit={handleCreate} loading={loading} width={640}>
                <ProductForm
                    data={createForm.data} setData={createForm.setData} errors={createForm.errors}
                    categories={categories} purchaseSources={purchaseSources} locations={locations}
                />
            </ModalForm>

            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Barang" onSubmit={handleEdit} loading={loading} width={640}>
                <ProductForm
                    data={editForm.data} setData={editForm.setData} errors={editForm.errors}
                    categories={categories} purchaseSources={purchaseSources} locations={locations}
                    isEdit
                />
            </ModalForm>

            <ViewModal
                opened={!!viewItem}
                onClose={() => setViewItem(null)}
                title="Detail Barang"
                subtitle={viewItem?.sku}
                image={viewItem?.image ? `/storage/${viewItem.image}` : null}
            >
                <ViewModal.Section title="Informasi Utama">
                    <ViewModal.FieldGrid>
                        <ViewModal.Field label="Kode Barang" value={viewItem?.sku ?? '-'} />
                        <ViewModal.Field label="Nama Barang" value={viewItem?.name ?? '-'} />
                        <ViewModal.Field
                            label="Kategori"
                            value={viewItem?.category ? `${viewItem.category.code} - ${viewItem.category.name}` : '-'}
                        />
                        <ViewModal.Field label="Lokasi" value={viewItem?.location?.name ?? '-'} />
                    </ViewModal.FieldGrid>
                </ViewModal.Section>

                <ViewModal.Section title="Informasi Stok">
                    <ViewModal.FieldGrid>
                        <ViewModal.Field
                            label="Stok Minimum"
                            value={viewItem?.min_stock?.toLocaleString('id-ID') ?? '-'}
                        />
                        <ViewModal.Field
                            label="Stok Saat Ini"
                            value={
                                viewItem?.stock !== undefined && viewItem?.stock !== null ? (
                                    <span className={viewItem.stock <= viewItem.min_stock ? 'text-red-600 font-semibold' : ''}>
                                        {viewItem.stock.toLocaleString('id-ID')}
                                        {viewItem.stock <= viewItem.min_stock && ' (Stok Menipis)'}
                                    </span>
                                ) : '-'
                            }
                        />
                    </ViewModal.FieldGrid>
                </ViewModal.Section>

                <ViewModal.Section title="Pembelian">
                    <ViewModal.FieldGrid>
                        <ViewModal.Field label="Sumber Pembelian" value={viewItem?.purchase_source?.name ?? '-'} />
                    </ViewModal.FieldGrid>
                </ViewModal.Section>

                {(viewItem?.created_at || viewItem?.updated_at) && (
                    <ViewModal.Section title="Riwayat">
                        <ViewModal.FieldGrid>
                            {viewItem?.created_at && (
                                <ViewModal.Field
                                    label="Dibuat"
                                    value={new Date(viewItem.created_at).toLocaleDateString('id-ID', {
                                        day: '2-digit', month: 'long', year: 'numeric'
                                    })}
                                />
                            )}
                            {viewItem?.updated_at && (
                                <ViewModal.Field
                                    label="Terakhir Diubah"
                                    value={new Date(viewItem.updated_at).toLocaleDateString('id-ID', {
                                        day: '2-digit', month: 'long', year: 'numeric'
                                    })}
                                />
                            )}
                        </ViewModal.FieldGrid>
                    </ViewModal.Section>
                )}
            </ViewModal>

            <DeleteModal
                opened={deleteHook.isOpen}
                onClose={deleteHook.cancel}
                onConfirm={handleDelete}
                title="Hapus Barang"
                message={`Barang "${deleteHook.itemToDelete?.name}" akan dihapus.`}
                loading={deleteHook.loading}
            />

            {/* Bulk Delete Modal */}
            <DeleteModal
                opened={bulkDeleteOpen}
                onClose={() => setBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Hapus Barang"
                message={`${selectedRowIds.length} barang akan dihapus.`}
                loading={bulkLoading}
            />

            <TrashModal
                opened={trashOpen}
                onClose={() => setTrashOpen(false)}
                title="Data Barang"
                apiEndpoint="/api/v1/master/products"
                columns={[
                    { key: 'sku', label: 'Kode' },
                    { key: 'name', label: 'Nama Barang' },
                    { key: 'category', label: 'Kategori', render: (item) => item.category?.code || '-' },
                ]}
                onRefresh={() => router.reload()}
            />

            <Modal
                opened={!!imagePreview}
                onClose={() => setImagePreview(null)}
                title="Preview Gambar"
                size="auto"
                centered
                withCloseButton={false}
                styles={{ body: { padding: 0 } }}
            >
                <Box pos="relative">
                    <ActionIcon
                        variant="filled"
                        color="red"
                        size="lg"
                        radius="xl"
                        onClick={() => setImagePreview(null)}
                        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                    >
                        <IconX size={18} />
                    </ActionIcon>
                    <Image src={imagePreview} maw={400} radius="sm" fit="contain" />
                </Box>
            </Modal>
        </AuthenticatedLayout>
    );
}
