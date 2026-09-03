import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Group, Badge, ActionIcon, Menu, Text, Box, Stack } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconShield } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import ViewModal from '@/Components/Forms/ViewModal';
import RoleForm from '@/Components/Master/RoleForm';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

const COLUMNS = [
    { accessorKey: 'name', header: 'Nama Role' },
    { accessorKey: 'slug', header: 'Slug', cell: ({ row }) => <Badge variant="light" color="gray">{row.original.slug}</Badge> },
    { accessorKey: 'permissions_count', header: 'Permissions', cell: ({ row }) => <Badge variant="light" color="brand">{row.original.permissions_count ?? 0}</Badge> },
    { accessorKey: 'description', header: 'Deskripsi', cell: ({ row }) => <Text size="sm" truncate="end" maw={250}>{row.original.description || '-'}</Text> },
];

function RoleViewContent({ item }) {
    if (!item?.permissions) return null;

    const grouped = {};
    item.permissions.forEach((p) => {
        if (!grouped[p.group]) grouped[p.group] = [];
        grouped[p.group].push(p);
    });

    return (
        <Stack gap="md">
            <ViewModal.FieldGrid>
                <ViewModal.Field label="Nama" value={item.name} />
                <ViewModal.Field label="Slug" value={item.slug} />
            </ViewModal.FieldGrid>
            <ViewModal.Field label="Deskripsi" value={item.description} />
            {Object.entries(grouped).map(([group, perms]) => (
                <ViewModal.Section key={group} title={group}>
                    <Stack gap={4}>
                        {perms.map((p) => (
                            <Text key={p.slug} size="sm">- {p.name}</Text>
                        ))}
                    </Stack>
                </ViewModal.Section>
            ))}
        </Stack>
    );
}

export default function Index() {
    const api = useApi();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '', permissions: [] });
    const [editForm, setEditForm] = useState({ name: '', slug: '', description: '', permissions: [] });
    const [formLoading, setFormLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const fetchData = () => {
        setLoading(true);
        api.get('/api/v1/roles')
            .then((r) => setRoles(r))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const setCreateField = (key, value) => setCreateForm((prev) => ({ ...prev, [key]: value }));
    const setEditField = (key, value) => setEditForm((prev) => ({ ...prev, [key]: value }));

    const handleCreate = async () => {
        setFormLoading(true);
        setFormErrors({});
        try {
            await api.post('/api/v1/roles', createForm);
            toast.success('Role berhasil dibuat');
            setCreateOpen(false);
            setCreateForm({ name: '', slug: '', description: '', permissions: [] });
            fetchData();
        } catch (err) {
            setFormErrors(err?.response?.data?.errors || {});
            toast.error(err?.response?.data?.message || 'Gagal membuat role');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async () => {
        setFormLoading(true);
        setFormErrors({});
        try {
            await api.put(`/api/v1/roles/${editItem.id}`, editForm);
            toast.success('Role berhasil diupdate');
            setEditItem(null);
            setEditForm({ name: '', slug: '', description: '', permissions: [] });
            fetchData();
        } catch (err) {
            setFormErrors(err?.response?.data?.errors || {});
            toast.error(err?.response?.data?.message || 'Gagal mengupdate role');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.del(`/api/v1/roles/${deleteItem.id}`);
            toast.success('Role berhasil dihapus');
            setDeleteItem(null);
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Gagal menghapus role');
        }
    };

    const openEdit = (item) => {
        setEditForm({
            name: item.name,
            slug: item.slug,
            description: item.description || '',
            permissions: item.permissions?.map((p) => p.slug) || [],
        });
        setEditItem(item);
    };

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Roles & Permissions" subtitle="Kelola role dan hak akses pengguna" actions={[
                { label: 'Tambah Role', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Roles & Permissions" />

            <Box p="md">
                <DataTable
                    columns={COLUMNS}
                    data={roles}
                    loading={loading}
                    enableSelection={false}
                    emptyState={<EmptyState icon={IconShield} title="Belum ada role" description="Buat role baru untuk mengelola hak akses" />}
                    renderRowActions={(row) => (
                        <Menu shadow="md" width={180}>
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(row.original)}>Detail</Menu.Item>
                                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => openEdit(row.original)}>Edit</Menu.Item>
                                <Menu.Divider />
                                {row.original.slug !== 'admin' && (
                                    <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => setDeleteItem(row.original)}>Hapus</Menu.Item>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    )}
                />
            </Box>

            {/* Create Modal */}
            <ModalForm
                opened={createOpen}
                onClose={() => { setCreateOpen(false); setCreateForm({ name: '', slug: '', description: '', permissions: [] }); setFormErrors({}); }}
                title="Tambah Role"
                onSubmit={handleCreate}
                loading={formLoading}
            >
                <RoleForm data={createForm} setData={setCreateField} errors={formErrors} />
            </ModalForm>

            {/* Edit Modal */}
            <ModalForm
                opened={!!editItem}
                onClose={() => { setEditItem(null); setEditForm({ name: '', slug: '', description: '', permissions: [] }); setFormErrors({}); }}
                title="Edit Role"
                onSubmit={handleEdit}
                loading={formLoading}
            >
                <RoleForm data={editForm} setData={setEditField} errors={formErrors} isEdit />
            </ModalForm>

            {/* View Modal */}
            <ViewModal
                opened={!!viewItem}
                onClose={() => setViewItem(null)}
                title={viewItem?.name}
                subtitle={viewItem?.slug}
            >
                <RoleViewContent item={viewItem} />
            </ViewModal>

            {/* Delete Modal */}
            <DeleteModal
                opened={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                title="Hapus Role"
                message={`Yakin ingin menghapus role "${deleteItem?.name}"?`}
            />
        </AuthenticatedLayout>
    );
}
