import { useState, useEffect } from 'react';
import { Stack, TextInput, Textarea, Checkbox, Group, Text, Box, Button, Loader } from '@mantine/core';
import useApi from '@/Hooks/useApi';

function PermissionGroup({ group, permissions, selected, onToggle }) {
    const allChecked = permissions.every((p) => selected.includes(p.slug));
    const someChecked = permissions.some((p) => selected.includes(p.slug));

    const handleGroupToggle = () => {
        if (allChecked) {
            const toRemove = permissions.map((p) => p.slug);
            onToggle(toRemove);
        } else {
            const toAdd = permissions.map((p) => p.slug).filter((s) => !selected.includes(s));
            onToggle(toAdd);
        }
    };

    return (
        <Box
            p="sm"
            style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                backgroundColor: '#fafafa',
            }}
        >
            <Checkbox
                label={<Text fw={600} size="sm">{group}</Text>}
                checked={allChecked}
                indeterminate={someChecked && !allChecked}
                onChange={handleGroupToggle}
                mb="xs"
            />
            <Stack gap={4} pl="xl">
                {permissions.map((perm) => (
                    <Checkbox
                        key={perm.slug}
                        label={perm.name}
                        checked={selected.includes(perm.slug)}
                        onChange={() => onToggle([perm.slug])}
                        size="sm"
                    />
                ))}
            </Stack>
        </Box>
    );
}

export default function RoleForm({ data, setData, errors, isEdit }) {
    const api = useApi();
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/v1/roles/permissions')
            .then((r) => setPermissions(r))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (slugs) => {
        const current = data.permissions || [];
        const newPerms = [...current];
        slugs.forEach((slug) => {
            const idx = newPerms.indexOf(slug);
            if (idx >= 0) {
                newPerms.splice(idx, 1);
            } else {
                newPerms.push(slug);
            }
        });
        setData('permissions', newPerms);
    };

    if (loading) return <Loader />;

    return (
        <Stack gap="md">
            <TextInput
                label="Nama Role"
                placeholder="e.g. Admin, Staff Gudang"
                value={data.name || ''}
                onChange={(e) => setData('name', e.target.value)}
                error={errors.name}
                required
            />
            <TextInput
                label="Slug"
                placeholder="e.g. admin, staff-gudang"
                value={data.slug || ''}
                onChange={(e) => setData('slug', e.target.value)}
                error={errors.slug}
                required
                disabled={isEdit}
            />
            <Textarea
                label="Deskripsi"
                placeholder="Deskripsi singkat role ini..."
                value={data.description || ''}
                onChange={(e) => setData('description', e.target.value)}
                error={errors.description}
                minRows={2}
            />

            <Box>
                <Text fw={600} size="sm" mb="xs" style={{ color: '#374151' }}>
                    Permissions
                </Text>
                {errors.permissions && (
                    <Text size="xs" color="red" mb="xs">{errors.permissions}</Text>
                )}
                <Stack gap="sm">
                    {Object.entries(permissions).map(([group, perms]) => (
                        <PermissionGroup
                            key={group}
                            group={group}
                            permissions={perms}
                            selected={data.permissions || []}
                            onToggle={handleToggle}
                        />
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
}
