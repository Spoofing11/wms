import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Group, Badge, ActionIcon, Menu, Text, Box, Select, TextInput, PasswordInput, Stack } from '@mantine/core';
import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconEye, IconUsers } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import DataTable from '@/Components/ui/DataTable';
import EmptyState from '@/Components/ui/EmptyState';
import ModalForm from '@/Components/Forms/ModalForm';
import DeleteModal from '@/Components/Forms/DeleteModal';
import ViewModal from '@/Components/Forms/ViewModal';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

const COLUMNS = [
    { accessorKey: 'name', header: 'Nama' },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'email', header: 'Email' },
    {
        accessorKey: 'roles', header: 'Role',
        cell: ({ row }) => {
            const roles = row.original.roles || [];
            return roles.length > 0
                ? roles.map((r) => <Badge key={r.id} variant="light" color="brand" mr={4}>{r.name}</Badge>)
                : <Text size="sm" c="dimmed">-</Text>;
        },
    },
];

function UserFormFields({ data, onChange, errors, isEdit, roles }) {
    return (
        <Stack gap="md">
            <TextInput label="Nama" placeholder="Nama lengkap" value={data.name || ''} onChange={(e) => onChange('name', e.target.value)} error={errors.name} required />
            <TextInput label="Username" placeholder="Username untuk login" value={data.username || ''} onChange={(e) => onChange('username', e.target.value)} error={errors.username} required disabled={isEdit} />
            <TextInput label="Email" placeholder="email@example.com" value={data.email || ''} onChange={(e) => onChange('email', e.target.value)} error={errors.email} required />
            <PasswordInput label={isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password'} placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Masukkan password'} value={data.password || ''} onChange={(e) => onChange('password', e.target.value)} error={errors.password} required={!isEdit} />
            <PasswordInput label="Konfirmasi Password" placeholder="Ulangi password" value={data.password_confirmation || ''} onChange={(e) => onChange('password_confirmation', e.target.value)} required={!isEdit} />
            <Select
                label="Role"
                placeholder="Pilih role"
                data={roles.map((r) => ({ value: String(r.id), label: r.name }))}
                value={data.role_id ? String(data.role_id) : null}
                onChange={(val) => onChange('role_id', val ? Number(val) : null)}
                error={errors.role_id}
                required
                searchable
            />
        </Stack>
    );
}

function UserViewContent({ item }) {
    return (
        <Stack gap="md">
            <ViewModal.FieldGrid>
                <ViewModal.Field label="Nama" value={item.name} />
                <ViewModal.Field label="Username" value={item.username} />
            </ViewModal.FieldGrid>
            <ViewModal.FieldGrid>
                <ViewModal.Field label="Email" value={item.email} />
                <ViewModal.Field label="Role" value={item.roles?.map((r) => r.name).join(', ') || '-'} />
            </ViewModal.FieldGrid>
        </Stack>
    );
}

export default function Index() {
    const api = useApi();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    const [createForm, setCreateForm] = useState({ name: '', username: '', email: '', password: '', password_confirmation: '', role_id: null });
    const [editForm, setEditForm] = useState({ name: '', username: '', email: '', password: '', password_confirmation: '', role_id: null });
    const [formLoading, setFormLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const setCreateField = (key, value) => setCreateForm((prev) => ({ ...prev, [key]: value }));
    const setEditField = (key, value) => setEditForm((prev) => ({ ...prev, [key]: value }));

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/api/v1/users'),
            api.get('/api/v1/roles'),
        ])
            .then(([u, r]) => { setUsers(u); setRoles(r); })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async () => {
        setFormLoading(true);
        setFormErrors({});
        try {
            await api.post('/api/v1/users', createForm);
            toast.success('User berhasil dibuat');
            setCreateOpen(false);
            setCreateForm({ name: '', username: '', email: '', password: '', password_confirmation: '', role_id: null });
            fetchData();
        } catch (err) {
            setFormErrors(err?.response?.data?.errors || {});
            toast.error(err?.response?.data?.message || 'Gagal membuat user');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async () => {
        setFormLoading(true);
        setFormErrors({});
        try {
            await api.put(`/api/v1/users/${editItem.id}`, editForm);
            toast.success('User berhasil diupdate');
            setEditItem(null);
            setEditForm({ name: '', username: '', email: '', password: '', password_confirmation: '', role_id: null });
            fetchData();
        } catch (err) {
            setFormErrors(err?.response?.data?.errors || {});
            toast.error(err?.response?.data?.message || 'Gagal mengupdate user');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.del(`/api/v1/users/${deleteItem.id}`);
            toast.success('User berhasil dihapus');
            setDeleteItem(null);
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Gagal menghapus user');
        }
    };

    const openEdit = (item) => {
        setEditForm({
            name: item.name,
            username: item.username,
            email: item.email,
            password: '',
            password_confirmation: '',
            role_id: item.roles?.[0]?.id || null,
        });
        setEditItem(item);
    };

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Users" subtitle="Kelola pengguna sistem" actions={[
                { label: 'Tambah User', icon: <IconPlus size={16} />, onClick: () => setCreateOpen(true) },
            ]} />}
        >
            <Head title="Users" />

            <Box p="md">
                <DataTable
                    columns={COLUMNS}
                    data={users}
                    loading={loading}
                    enableSelection={false}
                    emptyState={<EmptyState icon={IconUsers} title="Belum ada user" description="Buat user baru untuk mulai menggunakan sistem" />}
                    renderRowActions={(row) => (
                        <Menu shadow="md" width={180}>
                            <Menu.Target>
                                <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(row.original)}>Detail</Menu.Item>
                                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => openEdit(row.original)}>Edit</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => setDeleteItem(row.original)}>Hapus</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                />
            </Box>

            {/* Create Modal */}
            <ModalForm
                opened={createOpen}
                onClose={() => { setCreateOpen(false); setCreateForm({ name: '', username: '', email: '', password: '', password_confirmation: '', role_id: null }); setFormErrors({}); }}
                title="Tambah User"
                onSubmit={handleCreate}
                loading={formLoading}
            >
                <UserFormFields data={createForm} onChange={setCreateField} errors={formErrors} roles={roles} />
            </ModalForm>

            {/* Edit Modal */}
            <ModalForm
                opened={!!editItem}
                onClose={() => { setEditItem(null); setEditForm({ name: '', username: '', email: '', password: '', password_confirmation: '', role_id: null }); setFormErrors({}); }}
                title="Edit User"
                onSubmit={handleEdit}
                loading={formLoading}
            >
                <UserFormFields data={editForm} onChange={setEditField} errors={formErrors} roles={roles} isEdit />
            </ModalForm>

            {/* View Modal */}
            <ViewModal
                opened={!!viewItem}
                onClose={() => setViewItem(null)}
                title={viewItem?.name}
                subtitle={viewItem?.email}
            >
                <UserViewContent item={viewItem} />
            </ViewModal>

            {/* Delete Modal */}
            <DeleteModal
                opened={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                title="Hapus User"
                message={`Yakin ingin menghapus user "${deleteItem?.name}"?`}
            />
        </AuthenticatedLayout>
    );
}
