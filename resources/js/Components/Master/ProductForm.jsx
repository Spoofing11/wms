import { TextInput, Select, NumberInput, Stack, Text } from '@mantine/core';
import FormField from '@/Components/ui/FormField';
import ImageUpload from '@/Components/Forms/ImageUpload';

export default function ProductForm({ data, setData, errors, categories, purchaseSources, locations, isEdit = false }) {
    return (
        <>
            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Informasi Produk
                </Text>

                <FormField label="Kategori" required error={errors.category_id}>
                    <Select
                        placeholder="Pilih kategori"
                        data={(categories || []).map((c) => ({ value: String(c.id), label: `${c.code} - ${c.name}` }))}
                        value={data.category_id ? String(data.category_id) : ''}
                        onChange={(val) => setData('category_id', val ? Number(val) : null)}
                        error={errors.category_id}
                        searchable
                        clearable
                    />
                </FormField>

                {isEdit && (
                    <FormField label="Kode Barang">
                        <TextInput
                            value={data.sku || ''}
                            disabled
                            styles={{ input: { backgroundColor: '#f5f5f5' } }}
                        />
                    </FormField>
                )}

                <FormField label="Nama Barang" required error={errors.name}>
                    <TextInput
                        placeholder="Contoh: LAKBAN KERTAS - MASKING TAPE"
                        value={data.name || ''}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />
                </FormField>

                <FormField label="Stock Minimum" required error={errors.min_stock}>
                    <NumberInput
                        placeholder="0"
                        value={data.min_stock ?? 0}
                        onChange={(val) => setData('min_stock', val === '' || val === null ? 0 : val)}
                        error={errors.min_stock}
                        min={0}
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Lokasi
                </Text>

                <FormField label="Sumber Pembelian" error={errors.purchase_source_id}>
                    <Select
                        placeholder="Pilih sumber pembelian"
                        data={(purchaseSources || []).map((ps) => ({ value: String(ps.id), label: ps.name }))}
                        value={data.purchase_source_id ? String(data.purchase_source_id) : ''}
                        onChange={(val) => setData('purchase_source_id', val ? Number(val) : null)}
                        error={errors.purchase_source_id}
                        searchable
                        clearable
                    />
                </FormField>

                <FormField label="Lokasi" error={errors.location_id}>
                    <Select
                        placeholder="Pilih lokasi"
                        data={(locations || []).map((l) => ({ value: String(l.id), label: l.name }))}
                        value={data.location_id ? String(data.location_id) : ''}
                        onChange={(val) => setData('location_id', val ? Number(val) : null)}
                        error={errors.location_id}
                        searchable
                        clearable
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Gambar Barang
                </Text>

                <ImageUpload
                    value={data.image_url || (data.image ? `/storage/${data.image}` : null)}
                    onChange={(file) => setData('image', file)}
                    error={errors.image}
                />
                {errors.image && (
                    <Text size="xs" c="red">{errors.image}</Text>
                )}
            </Stack>
        </>
    );
}
