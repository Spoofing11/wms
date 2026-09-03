import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Tabs, Stack, Divider, Image, Modal, Indicator, Box } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconClipboardList, IconTrashOff, IconPrinter } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import TrashModal from '@/Components/Forms/TrashModal';
import ViewModal from '@/Components/Forms/ViewModal';
import MaterialRequestForm from '@/Components/Operational/MaterialRequestForm';
import GroupedTable from '@/Components/Operational/GroupedTable';
import useApi from '@/Hooks/useApi';
import useConfirmDelete from '@/Hooks/useConfirmDelete';
import { toast } from 'react-toastify';

export default function Index({ materialRequests, projects, products, categories, users }) {
    const api = useApi();
    const deleteHook = useConfirmDelete();

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('semua');
    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [photoPreviewItem, setPhotoPreviewItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trashOpen, setTrashOpen] = useState(false);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [trashCount, setTrashCount] = useState(0);

    const createForm = useForm({
        request_date: new Date().toISOString().split('T')[0],
        project_id: null,
        division: '',
        division_other: '',
        requester_name: '',
        usage_type: 'consumable',
        urgency: 'normal',
        request_datetime: '',
        pickup_time: '',
        items: [{ product_id: null, new_item_name: '', quantity_requested: 1, usage_type: 'consumable', notes: '' }],
    });

    useEffect(() => {
        api.get('/api/v1/material-requests/trashed', { per_page: 1 })
            .then((r) => setTrashCount(r.meta?.total || 0))
            .catch(() => {});
    }, []);

    const editForm = useForm({
        request_date: '',
        project_id: null,
        division: '',
        division_other: '',
        requester_name: '',
        usage_type: 'consumable',
        urgency: 'normal',
        request_datetime: '',
        pickup_time: '',
        items: [],
    });

    const fetchData = (newPage = 1, newSearch = search, tab = activeTab) => {
        router.get(route('operational.material-requests'), {
            page: newPage,
            search: newSearch,
            tab: tab !== 'semua' ? tab : undefined,
        }, { preserveState: true, replace: true });
    };

    const debounceRef = useRef(null);
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchData(1, val), 300);
    };

    const buildFormData = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'items') {
                data.items.forEach((item, idx) => {
                    Object.keys(item).forEach(field => {
                        if (field === 'photo' && item[field] instanceof File) {
                            formData.append(`items[${idx}][photo]`, item[field]);
                        } else if (field === 'photo' && item[field] === null) {
                            // skip null photo
                        } else if (item[field] !== null && item[field] !== undefined) {
                            formData.append(`items[${idx}][${field}]`, item[field]);
                        }
                    });
                });
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return formData;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = buildFormData(createForm.data);
            await api.upload('/api/v1/operational/material-requests', formData);
            toast.success('Material Request berhasil dibuat.');
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
            const formData = buildFormData(editForm.data);
            await api.upload(`/api/v1/operational/material-requests/${editItem.id}`, formData, 'PUT');
            toast.success('Material Request berhasil diperbarui.');
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
            await api.del(`/api/v1/operational/material-requests/${item.id}`);
            toast.success('Material Request berhasil dihapus.');
            router.reload();
        });
    };

    const handleBulkDelete = async () => {
        setBulkLoading(true);
        try {
            await api.post('/api/v1/operational/material-requests/bulk-delete', { ids: selectedRowIds });
            toast.success(`${selectedRowIds.length} material request berhasil dihapus.`);
            setSelectedRowIds([]);
            setBulkDeleteOpen(false);
            router.reload();
        } catch (err) {
            toast.error(err.message || 'Gagal menghapus data.');
        } finally {
            setBulkLoading(false);
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

    const itemStatusColor = (status) => {
        const colors = { diajukan: 'blue', menunggu_pengadaan: 'yellow', disetujui: 'cyan', diproses: 'orange', siap_ambil: 'green', diterima: 'green', ditolak: 'red' };
        return colors[status] || 'gray';
    };

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
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge color={statusColor(row.status)} variant="light">
                    {statusLabel(row.status)}
                </Badge>
            ),
        },
    ];

    const detailValue = (value, fallback = 'Belum ada') => value || fallback;

    const childRender = (child, row) => (
        <Box
            p="sm"
            style={{
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                backgroundColor: '#F9FAFB',
            }}
        >
            <Group justify="space-between" align="flex-start" mb="sm">
                <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Detail bahan</Text>
                    <Text size="sm" fw={600} c="dark">
                        {detailValue(child.product?.name || child.new_item_name, 'Nama bahan belum diisi')}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>
                        SKU: {detailValue(child.product?.sku, 'Barang baru')}
                    </Text>
                </div>
                <Badge color={itemStatusColor(child.status)} variant="light">
                    {statusLabel(child.status)}
                </Badge>
            </Group>

            <Group gap="xl" align="flex-start">
                <div>
                    <Text size="xs" c="dimmed">Jumlah diminta</Text>
                    <Text size="sm" fw={600}>{child.quantity_requested ?? 0} unit</Text>
                </div>
                <div>
                    <Text size="xs" c="dimmed">Jumlah pengadaan</Text>
                    <Text size="sm" fw={600}>{child.purchase_quantity ?? 'Belum ada'}</Text>
                </div>
                <div>
                    <Text size="xs" c="dimmed">Jenis pemakaian</Text>
                    <Text size="sm" fw={600}>
                        {(child.usage_type || row.usage_type) === 'borrow' ? 'Pinjam' : 'Habis Pakai'}
                    </Text>
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                    <Text size="xs" c="dimmed">Keterangan</Text>
                    <Text size="sm">{detailValue(child.notes, 'Tidak ada')}</Text>
                </div>
            </Group>

            {(child.photo || child.ready_photo) && (
                <Text size="xs" c="teal" mt="sm" fw={500}>
                    Foto tersedia pada detail permintaan
                </Text>
            )}
        </Box>
    );

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
                <Menu.Item leftSection={<IconPrinter size={16} />} onClick={() => window.open(`/api/v1/operational/material-requests/${row.id}/print`, '_blank')}>
                    Print PDF
                </Menu.Item>
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => {
                    editForm.setData({
                        request_date: row.request_date ? new Date(row.request_date).toISOString().split('T')[0] : '',
                        project_id: row.project?.id || null,
                        division: row.division || '',
                        division_other: row.division_other || '',
                        requester_name: row.requester_name || '',
                        usage_type: row.usage_type || 'consumable',
                        urgency: row.urgency || 'normal',
                        request_datetime: row.request_datetime ? new Date(row.request_datetime).toISOString().split('T')[0] : '',
                        pickup_time: row.pickup_time || '',
                        items: row.items?.map(i => ({
                            id: i.id,
                            product_id: i.product?.id || null,
                            new_item_name: i.new_item_name || '',
                            quantity_requested: i.quantity_requested || 1,
                            usage_type: i.usage_type || row.usage_type || 'consumable',
                            notes: i.notes || '',
                            photo: i.photo || null,
                        })) || [],
                    });
                    setEditItem(row);
                }}>
                    Edit
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => deleteHook.confirm(row)}>
                    Hapus
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    return (
        <AuthenticatedLayout
            header={<PageHeader
                title="Permintaan Bahan"
                subtitle="Kelola permintaan bahan dari proyek"
                search={{ value: search, placeholder: 'Cari pemohon, divisi, proyek...' }}
                onSearch={handleSearch}
                actions={[
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
                    { label: 'Buat Permintaan', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
                ]}
            />}
        >
            <Head title="Permintaan Bahan" />

            <Tabs value={activeTab} onChange={(val) => { setActiveTab(val); fetchData(1, search, val); }} mb="md">
                <Tabs.List>
                    <Tabs.Tab value="semua">Semua</Tabs.Tab>
                    <Tabs.Tab value="permintaan">Permintaan</Tabs.Tab>
                    <Tabs.Tab value="pengadaan">Pengadaan</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {materialRequests.data?.length > 0 ? (
                <GroupedTable
                    data={materialRequests.data}
                    expandKey="id"
                    headerColumns={headerColumns}
                    childRender={childRender}
                    headerActions={headerActions}
                    emptyMessage="Tidak ada permintaan bahan"
                />
            ) : (
                <EmptyState
                    icon={<IconClipboardList size={28} />}
                    title="Belum ada permintaan bahan"
                    description="Mulai buat permintaan bahan baru."
                    action={{ label: 'Buat Permintaan', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) }}
                />
            )}

            <ModalForm opened={createOpen} onClose={() => setCreateOpen(false)} title="Buat Permintaan Bahan" onSubmit={handleCreate} loading={loading} width={720}>
                <MaterialRequestForm
                    data={createForm.data} setData={createForm.setData} errors={createForm.errors}
                    projects={projects} products={products} categories={categories} users={users}
                />
            </ModalForm>

            <ModalForm opened={!!editItem} onClose={() => setEditItem(null)} title="Edit Permintaan Bahan" onSubmit={handleEdit} loading={loading} width={720}>
                <MaterialRequestForm
                    data={editForm.data} setData={editForm.setData} errors={editForm.errors}
                    projects={projects} products={products} categories={categories} users={users} isEdit
                />
            </ModalForm>

            <ViewModal opened={!!viewItem} onClose={() => setViewItem(null)} title="Detail Permintaan Bahan">
                <ViewModal.Field label="Tanggal Permintaan" value={viewItem?.request_date ? new Date(viewItem.request_date).toLocaleDateString('id-ID') : '-'} />
                <ViewModal.Field label="Pemohon" value={viewItem?.requester_name || viewItem?.requester?.name || '-'} />
                <ViewModal.Field label="Divisi" value={viewItem?.division || '-'} />
                <ViewModal.Field label="Proyek" value={viewItem?.project?.name || '-'} />
                <ViewModal.Field label="Urgensi" value={viewItem?.urgency === 'urgent' ? 'Urgent' : 'Normal'} />
                <ViewModal.Field label="Jenis Pemakaian" value={viewItem?.usage_type === 'consumable' ? 'Habis Pakai' : 'Pinjam'} />
                <ViewModal.Field label="Status" value={statusLabel(viewItem?.status)} />
                <Divider my="sm" />
                <Text fw={600} size="sm" mb="xs">Items ({viewItem?.items?.length || 0})</Text>
                {viewItem?.items?.map((item, idx) => (
                    <Group key={item.id} p="xs" style={{ border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8 }} gap="sm" align="flex-start">
                        <Badge color={itemStatusColor(item.status)} variant="light">{statusLabel(item.status)}</Badge>
                        <div style={{ flex: 1 }}>
                            <Text size="sm">{item.product?.name || item.new_item_name || '-'}</Text>
                            <Text size="xs" c="dimmed">Qty: {item.quantity_requested} | SKU: {item.product?.sku || '-'}</Text>
                            {item.photo && (
                                <Image
                                    src={item.photo.startsWith('http') ? item.photo : `/storage/${item.photo}`}
                                    radius="md"
                                    h={120}
                                    fit="contain"
                                    mt="xs"
                                />
                            )}
                            {item.ready_photo && (
                                <div>
                                    <Text size="xs" c="dimmed" mt={4}>Foto Approve</Text>
                                    <Image
                                        src={item.ready_photo.startsWith('http') ? item.ready_photo : `/storage/${item.ready_photo}`}
                                        radius="md"
                                        h={120}
                                        fit="contain"
                                        mt="xs"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setPhotoPreviewItem(item.ready_photo)}
                                    />
                                </div>
                            )}
                        </div>
                    </Group>
                ))}
            </ViewModal>

            <DeleteModal
                opened={deleteHook.isOpen}
                onClose={deleteHook.cancel}
                onConfirm={handleDelete}
                title="Hapus Permintaan Bahan"
                message={`Permintaan dari "${deleteHook.itemToDelete?.requester_name}" akan dihapus.`}
                loading={deleteHook.loading}
            />

            <TrashModal
                opened={trashOpen}
                onClose={() => setTrashOpen(false)}
                title="Permintaan Bahan"
                apiEndpoint="/api/v1/operational/material-requests"
                columns={[
                    { key: 'requester_name', label: 'Pemohon' },
                    { key: 'division', label: 'Divisi' },
                ]}
                onRefresh={() => router.reload()}
            />

            <Modal opened={!!photoPreviewItem} onClose={() => setPhotoPreviewItem(null)} title="Foto Approve" size="lg" centered>
                <Image
                    src={photoPreviewItem?.startsWith('http') ? photoPreviewItem : `/storage/${photoPreviewItem}`}
                    radius="md"
                    fit="contain"
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
