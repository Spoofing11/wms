import { Select, NumberInput, Stack, Text, TextInput, Textarea } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

export default function StockAdjustmentForm({ data, setData, errors, products, isEdit = false }) {
    const selectedProduct = products.find((p) => String(p.id) === String(data.product_id));

    return (
        <>
            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Informasi Produk & Detail Stock
                </Text>

                <FormField label="Nama Barang" required error={errors.product_id}>
                    <Select
                        placeholder="Pilih barang"
                        data={(products || []).map((p) => ({ value: String(p.id), label: `${p.sku} - ${p.name}` }))}
                        value={data.product_id ? String(data.product_id) : ''}
                        onChange={(val) => setData('product_id', val ? Number(val) : null)}
                        error={errors.product_id}
                        searchable
                        clearable
                        disabled={isEdit}
                    />
                </FormField>

                {selectedProduct && (
                    <FormField label="Stock Sebelumnya">
                        <TextInput
                            value={selectedProduct.stock}
                            disabled
                            styles={{ input: { backgroundColor: '#f5f5f5' } }}
                        />
                    </FormField>
                )}

                <FormField label="Stock Baru" required error={errors.new_stock}>
                    <NumberInput
                        placeholder="0"
                        value={data.new_stock ?? 0}
                        onChange={(val) => setData('new_stock', val === '' || val === null ? 0 : val)}
                        error={errors.new_stock}
                        min={0}
                    />
                </FormField>

                <FormField label="Alasan / Keterangan" required error={errors.reason}>
                    <Textarea
                        placeholder="Masukkan alasan penyesuaian..."
                        value={data.reason || ''}
                        onChange={(e) => setData('reason', e.target.value)}
                        error={errors.reason}
                        rows={3}
                    />
                </FormField>
            </Stack>
        </>
    );
}
