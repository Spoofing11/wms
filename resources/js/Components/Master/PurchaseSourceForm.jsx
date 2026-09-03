import { TextInput, Select, Stack, Text } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

const SOURCE_TYPES = [
    { value: 'Tokopedia', label: 'Tokopedia' },
    { value: 'Shopee', label: 'Shopee' },
    { value: 'Offline', label: 'Offline' },
    { value: 'Toko Lainnya', label: 'Toko Lainnya' },
];

export default function PurchaseSourceForm({ data, setData, errors }) {
    return (
        <>
            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Informasi Pembelian
                </Text>

                <FormField label="Tipe Sumber / Platform" required error={errors.source_type}>
                    <Select
                        placeholder="Pilih platform"
                        data={SOURCE_TYPES}
                        value={data.source_type || ''}
                        onChange={(val) => setData('source_type', val)}
                        error={errors.source_type}
                        searchable
                        clearable
                    />
                </FormField>

                <FormField label="Nama Toko" required error={errors.name}>
                    <TextInput
                        placeholder="Contoh: DecoPaint Bali"
                        value={data.name || ''}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />
                </FormField>
            </Stack>

            <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Text fw={600} size="sm" style={{ color: '#705838' }}>
                    Detail Tambahan
                </Text>

                <FormField label="Alamat Toko / Link Pembelian" error={errors.notes}>
                    <TextInput
                        placeholder="Contoh: https://tokopedia.com/decopaintbali"
                        value={data.notes || ''}
                        onChange={(e) => setData('notes', e.target.value)}
                        error={errors.notes}
                    />
                </FormField>
            </Stack>
        </>
    );
}
