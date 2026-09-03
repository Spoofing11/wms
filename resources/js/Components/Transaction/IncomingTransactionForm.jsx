import { Select, NumberInput, Stack, Text, TextInput, Textarea } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

export default function IncomingTransactionForm({ data, setData, errors, products, purchaseSources, isEdit = false }) {
    const selectedProduct = products.find((p) => String(p.id) === String(data.product_id));

    return (
        <>
            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Informasi Transaksi
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

                <FormField label="Tanggal Masuk" required error={errors.transaction_date}>
                    <input
                        type="date"
                        value={data.transaction_date || ''}
                        onChange={(e) => setData('transaction_date', e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, width: '100%' }}
                        disabled={isEdit}
                    />
                    {errors.transaction_date && <Text size="xs" c="red" mt={4}>{errors.transaction_date}</Text>}
                </FormField>

                <FormField label="Jumlah Masuk" required error={errors.quantity}>
                    <NumberInput
                        placeholder="0"
                        value={data.quantity ?? 0}
                        onChange={(val) => setData('quantity', val === '' || val === null ? 0 : val)}
                        error={errors.quantity}
                        min={1}
                        disabled={isEdit}
                    />
                </FormField>

                {selectedProduct && (
                    <FormField label="Stock Saat Ini">
                        <TextInput
                            value={selectedProduct.stock}
                            disabled
                            styles={{ input: { backgroundColor: '#f5f5f5' } }}
                        />
                    </FormField>
                )}
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Harga & Sumber Pembelian
                </Text>

                <FormField label="Harga Pembelian" error={errors.purchase_price}>
                    <NumberInput
                        placeholder="0"
                        value={data.purchase_price ?? 0}
                        onChange={(val) => setData('purchase_price', val === '' || val === null ? 0 : val)}
                        error={errors.purchase_price}
                        min={0}
                        thousandSeparator=","
                        disabled={isEdit}
                    />
                </FormField>

                <FormField label="Sumber Pembelian" error={errors.purchase_source_id}>
                    <Select
                        placeholder="Pilih sumber pembelian"
                        data={(purchaseSources || []).map((ps) => ({ value: String(ps.id), label: ps.name }))}
                        value={data.purchase_source_id ? String(data.purchase_source_id) : ''}
                        onChange={(val) => setData('purchase_source_id', val ? Number(val) : null)}
                        error={errors.purchase_source_id}
                        searchable
                        clearable
                        disabled={isEdit}
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Catatan Tambahan
                </Text>

                <FormField label="Catatan / Notes" error={errors.notes}>
                    <Textarea
                        placeholder="Masukkan catatan..."
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                        error={errors.notes}
                        rows={3}
                        disabled={isEdit}
                    />
                </FormField>
            </Stack>
        </>
    );
}
