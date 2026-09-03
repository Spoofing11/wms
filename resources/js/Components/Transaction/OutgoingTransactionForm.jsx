import { Select, NumberInput, Stack, Text, TextInput, Textarea } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

const USAGE_TYPES = [
    { value: 'Habis Pakai', label: 'Habis Pakai' },
    { value: 'Rusak', label: 'Rusak' },
    { value: 'Dijual', label: 'Dijual' },
    { value: 'Pindah', label: 'Pindah' },
    { value: 'Pinjam', label: 'Pinjam' },
    { value: 'Hilang', label: 'Hilang' },
];

const CONDITIONS = [
    { value: 'good', label: 'Baik' },
    { value: 'bad', label: 'Rusak' },
];

const PICKUP_TIMES = [
    { value: '09:00 - 12:00', label: 'Pagi (09:00 - 12:00)' },
    { value: '12:00 - 16:00', label: 'Siang (12:00 - 16:00)' },
    { value: '16:00 - 19:00', label: 'Sore (16:00 - 19:00)' },
];

export default function OutgoingTransactionForm({ data, setData, errors, products, projects, isEdit = false }) {
    const selectedProduct = products.find((p) => String(p.id) === String(data.product_id));

    return (
        <>
            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Detail Transaksi & Barang
                </Text>

                <FormField label="Tanggal Keluar" required error={errors.transaction_date}>
                    <input
                        type="date"
                        value={data.transaction_date || ''}
                        onChange={(e) => setData('transaction_date', e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, width: '100%' }}
                        disabled={isEdit}
                    />
                    {errors.transaction_date && <Text size="xs" c="red" mt={4}>{errors.transaction_date}</Text>}
                </FormField>

                <FormField label="Waktu Pengambilan" error={errors.pickup_time}>
                    <Select
                        placeholder="Pilih waktu pengambilan"
                        data={PICKUP_TIMES}
                        value={data.pickup_time || ''}
                        onChange={(val) => setData('pickup_time', val)}
                        error={errors.pickup_time}
                        clearable
                        disabled={isEdit}
                    />
                </FormField>

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
                    <FormField label="Stock Saat Ini">
                        <TextInput
                            value={selectedProduct.stock}
                            disabled
                            styles={{ input: { backgroundColor: '#f5f5f5' } }}
                        />
                    </FormField>
                )}

                <FormField label="Jumlah Keluar" required error={errors.quantity}>
                    <NumberInput
                        placeholder="0"
                        value={data.quantity ?? 0}
                        onChange={(val) => setData('quantity', val === '' || val === null ? 0 : val)}
                        error={errors.quantity}
                        min={1}
                        disabled={isEdit}
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Tujuan / Alokasi Barang
                </Text>

                <FormField label="Jenis Pengeluaran" required error={errors.usage_type}>
                    <Select
                        placeholder="Pilih jenis pengeluaran"
                        data={USAGE_TYPES}
                        value={data.usage_type || ''}
                        onChange={(val) => setData('usage_type', val)}
                        error={errors.usage_type}
                        clearable
                        disabled={isEdit}
                    />
                </FormField>

                <FormField label="Kondisi Barang" required error={errors.condition}>
                    <Select
                        placeholder="Pilih kondisi barang"
                        data={CONDITIONS}
                        value={data.condition || ''}
                        onChange={(val) => setData('condition', val)}
                        error={errors.condition}
                        disabled={isEdit}
                    />
                </FormField>

                <FormField label="Nama Proyek" error={errors.project_id}>
                    <Select
                        placeholder="Pilih proyek"
                        data={(projects || []).map((p) => ({ value: String(p.id), label: p.name }))}
                        value={data.project_id ? String(data.project_id) : ''}
                        onChange={(val) => setData('project_id', val ? Number(val) : null)}
                        error={errors.project_id}
                        searchable
                        clearable
                        disabled={isEdit}
                    />
                </FormField>

                <FormField label="Pemakai" error={errors.taken_by}>
                    <TextInput
                        placeholder="Nama pemakai"
                        value={data.taken_by || ''}
                        onChange={(e) => setData('taken_by', e.target.value)}
                        error={errors.taken_by}
                        disabled={isEdit}
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Keterangan
                </Text>

                <FormField label="Keterangan" error={errors.notes}>
                    <Textarea
                        placeholder="Masukkan keterangan..."
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
