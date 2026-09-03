import { TextInput, Textarea, Stack, Text } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

export default function ProjectForm({ data, setData, errors }) {
    return (
        <Stack gap="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <Text fw={600} size="sm" style={{ color: '#705838' }}>
                Informasi Proyek
            </Text>

            <FormField label="Nama Proyek" required error={errors.name}>
                <TextInput
                    placeholder="Contoh: PENIKI HOUSE"
                    value={data.name || ''}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                />
            </FormField>

            <FormField label="Alamat" required error={errors.address}>
                <Textarea
                    placeholder="Contoh: PERMATA BUANA"
                    value={data.address || ''}
                    onChange={(e) => setData('address', e.target.value)}
                    error={errors.address}
                    autosize
                    minRows={2}
                />
            </FormField>
        </Stack>
    );
}
