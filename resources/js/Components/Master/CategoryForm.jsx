import { TextInput } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

export default function CategoryForm({ data, setData, errors }) {
    return (
        <>
            <FormField label="Kode Kategori" required error={errors.code}>
                <TextInput
                    placeholder="Contoh: BHP"
                    value={data.code || ''}
                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    error={errors.code}
                    maxLength={10}
                />
            </FormField>

            <FormField label="Nama Kategori" required error={errors.name}>
                <TextInput
                    placeholder="Contoh: Bahan Proyek"
                    value={data.name || ''}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                />
            </FormField>
        </>
    );
}
