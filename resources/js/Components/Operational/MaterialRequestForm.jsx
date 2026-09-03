import { useState } from 'react';
import { Select, NumberInput, Stack, Text, TextInput, Textarea, Button, Group, Box, Badge, Image, FileInput } from '@mantine/core';
import { IconPlus, IconTrash, IconCamera } from '@tabler/icons-react';
import FormField from '@/Components/ui/FormField';

const DIVISIONS = [
    'Kayu', 'Finishing', 'M.E', 'Besi', 'Lainnya'
];

export default function MaterialRequestForm({ data, setData, errors, projects, products, categories, users = [], isEdit = false }) {
    const addItem = () => {
        const items = [...(data.items || [])];
        items.push({
            product_id: null,
            new_item_name: '',
            quantity_requested: 1,
            usage_type: data.usage_type || 'consumable',
            notes: '',
            photo: null,
        });
        setData('items', items);
    };

    const removeItem = (index) => {
        const items = [...data.items];
        items.splice(index, 1);
        setData('items', items);
    };

    const updateItem = (index, field, value) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    };

    const handleProductSelect = (index, productId) => {
        const items = [...data.items];

        items[index] = {
            ...items[index],
            product_id: productId ? Number(productId) : null,
            new_item_name: '',
        };

        setData('items', items);
    };

    const [newItemMode, setNewItemMode] = useState({});

    const toggleNewItemMode = (index) => {
        const items = [...data.items];
        const current = newItemMode[index];

        if (current) {
            items[index] = { ...items[index], product_id: null, new_item_name: '' };
            setNewItemMode(prev => ({ ...prev, [index]: false }));
        } else {
            items[index] = { ...items[index], product_id: null, new_item_name: '' };
            setNewItemMode(prev => ({ ...prev, [index]: true }));
        }

        setData('items', items);
    };

    const getItemName = (item) => {
        if (item.product_id) {
            const product = products.find(p => String(p.id) === String(item.product_id));
            return product ? `${product.sku} - ${product.name}` : '';
        }
        return item.new_item_name || '';
    };

    const [photoPreviews, setPhotoPreviews] = useState({});

    const handlePhotoChange = (index, file) => {
        const items = [...data.items];
        items[index] = { ...items[index], photo: file };
        setData('items', items);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreviews(prev => ({ ...prev, [index]: e.target.result }));
            reader.readAsDataURL(file);
        } else {
            setPhotoPreviews(prev => ({ ...prev, [index]: null }));
        }
    };

    return (
        <>
            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Informasi Permintaan
                </Text>

                <FormField label="Tanggal Permintaan" required error={errors.request_date}>
                    <input
                        type="date"
                        value={data.request_date || ''}
                        onChange={(e) => setData('request_date', e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, width: '100%' }}
                    />
                </FormField>

                <FormField label="Nama Proyek" required error={errors.project_id}>
                    <Select
                        placeholder="Pilih proyek"
                        data={(projects || []).map(p => ({ value: String(p.id), label: p.name }))}
                        value={data.project_id ? String(data.project_id) : ''}
                        onChange={(val) => setData('project_id', val ? Number(val) : null)}
                        searchable
                        clearable
                    />
                </FormField>

                <FormField label="Divisi" required error={errors.division}>
                    <Select
                        placeholder="Pilih divisi"
                        data={DIVISIONS.map(d => ({ value: d, label: d }))}
                        value={data.division || ''}
                        onChange={(val) => setData('division', val || '')}
                    />
                </FormField>

                {data.division === 'Lainnya' && (
                    <FormField label="Divisi Lainnya" error={errors.division_other}>
                        <TextInput
                            placeholder="Masukkan nama divisi"
                            value={data.division_other || ''}
                            onChange={(e) => setData('division_other', e.target.value)}
                        />
                    </FormField>
                )}

                <FormField label="Nama Pemohon" error={errors.requester_name}>
                    <Select
                        placeholder="Pilih atau ketik nama pemohon"
                        data={(users || []).map(u => ({ value: u.name, label: u.name }))}
                        value={data.requester_name || ''}
                        onChange={(val) => setData('requester_name', val || '')}
                        searchable
                        creatable
                        getCreateLabel={(query) => `+ Tambah "${query}"`}
                        onCreate={(query) => {
                            setData('requester_name', query);
                            return query;
                        }}
                        clearable
                    />
                </FormField>

                <FormField label="Jenis Pemakaian" required error={errors.usage_type}>
                    <Select
                        placeholder="Pilih jenis"
                        data={[
                            { value: 'consumable', label: 'Habis Pakai' },
                            { value: 'borrow', label: 'Pinjam' },
                        ]}
                        value={data.usage_type || 'consumable'}
                        onChange={(val) => setData('usage_type', val || 'consumable')}
                    />
                </FormField>

                <FormField label="Urgensi" required error={errors.urgency}>
                    <Select
                        placeholder="Pilih urgensi"
                        data={[
                            { value: 'normal', label: 'Normal' },
                            { value: 'urgent', label: 'Urgent' },
                        ]}
                        value={data.urgency || 'normal'}
                        onChange={(val) => setData('urgency', val || 'normal')}
                    />
                </FormField>

                <FormField label="Tanggal Pengambilan" error={errors.request_datetime}>
                    <input
                        type="date"
                        value={data.request_datetime || ''}
                        onChange={(e) => setData('request_datetime', e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, width: '100%' }}
                    />
                </FormField>

                <FormField label="Waktu Pengambilan" error={errors.pickup_time}>
                    <Select
                        placeholder="Pilih waktu"
                        data={[
                            { value: '09:00 - 12:00', label: 'Pagi (09:00 - 12:00)' },
                            { value: '12:00 - 16:00', label: 'Siang (12:00 - 16:00)' },
                            { value: '16:00 - 19:00', label: 'Sore (16:00 - 19:00)' },
                        ]}
                        value={data.pickup_time || ''}
                        onChange={(val) => setData('pickup_time', val || '')}
                        clearable
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" mt="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    List Permintaan Bahan
                </Text>

                {(data.items || []).map((item, index) => (
                    <Box key={index} p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fafafa' }}>
                        <Group justify="space-between" mb="md">
                            <Badge color="blue" variant="light">Item #{index + 1}</Badge>
                            {data.items.length > 1 && (
                                <Button size="xs" color="red" variant="subtle" leftSection={<IconTrash size={14} />} onClick={() => removeItem(index)}>
                                    Hapus
                                </Button>
                            )}
                        </Group>

                        <Stack gap="sm">
                            {!newItemMode[index] ? (
                                <FormField label="Nama Barang" error={errors[`items.${index}.product_id`]}>
                                    <Select
                                        placeholder="Cari barang..."
                                        data={(products || []).map(p => ({ value: String(p.id), label: `${p.sku} - ${p.name} (Stok: ${p.stock})` }))}
                                        value={item.product_id ? String(item.product_id) : ''}
                                        onChange={(val) => handleProductSelect(index, val)}
                                        searchable
                                        clearable
                                    />
                                    <Button size="xs" variant="subtle" color="yellow" mt="xs" onClick={() => toggleNewItemMode(index)}>
                                        Barang Baru?
                                    </Button>
                                </FormField>
                            ) : (
                                <FormField label="Nama Barang Baru" error={errors[`items.${index}.new_item_name`]}>
                                    <TextInput
                                        placeholder="Masukkan nama barang baru"
                                        value={item.new_item_name || ''}
                                        onChange={(e) => updateItem(index, 'new_item_name', e.target.value)}
                                    />
                                    <Button size="xs" variant="subtle" color="blue" mt="xs" onClick={() => toggleNewItemMode(index)}>
                                        Pilih Barang Existing
                                    </Button>
                                </FormField>
                            )}

                            <FormField label="Jumlah Permintaan" error={errors[`items.${index}.quantity_requested`]}>
                                    <NumberInput
                                        value={item.quantity_requested || 1}
                                        onChange={(val) => updateItem(index, 'quantity_requested', val === '' || val === null ? 1 : val)}
                                        min={1}
                                    />
                                </FormField>

                            <FormField label="Jenis Pemakaian" error={errors[`items.${index}.usage_type`]}>
                                <Select
                                    data={[
                                        { value: 'consumable', label: 'Habis Pakai' },
                                        { value: 'borrow', label: 'Pinjam' },
                                    ]}
                                    value={item.usage_type || data.usage_type || 'consumable'}
                                    onChange={(val) => updateItem(index, 'usage_type', val || 'consumable')}
                                />
                            </FormField>

                            <FormField label="Foto Barang" error={errors[`items.${index}.photo`]}>
                                <FileInput
                                    placeholder="Upload foto barang..."
                                    accept="image/*"
                                    leftSection={<IconCamera size={16} />}
                                    value={item.photo instanceof File ? item.photo : null}
                                    onChange={(file) => handlePhotoChange(index, file)}
                                    clearable
                                />
                                {photoPreviews[index] && (
                                    <Image src={photoPreviews[index]} radius="md" h={150} fit="contain" mt="xs" />
                                )}
                                {!photoPreviews[index] && item.photo && typeof item.photo === 'string' && (
                                    <Image src={`/storage/${item.photo}`} radius="md" h={150} fit="contain" mt="xs" />
                                )}
                            </FormField>

                            <FormField label="Keterangan" error={errors[`items.${index}.notes`]}>
                                <Textarea
                                    placeholder="Catatan untuk item ini..."
                                    value={item.notes || ''}
                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                    rows={2}
                                />
                            </FormField>
                        </Stack>
                    </Box>
                ))}

                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={addItem}
                    variant="light"
                    color="brand"
                    fullWidth
                    mt="sm"
                >
                    Tambah Item
                </Button>
            </Stack>
        </>
    );
}
