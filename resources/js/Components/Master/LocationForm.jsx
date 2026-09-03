import { TextInput } from '@mantine/core';
import FormField from '@/Components/ui/FormField';

export default function LocationForm({ data, setData, errors }) {
    return (
        <FormField label="Nama Lokasi" required error={errors.name}>
            <TextInput
                placeholder="Contoh: RAK A - A1 - GUDANG COMPOSITE - LT 2"
                value={data.name || ''}
                onChange={(e) => setData('name', e.target.value)}
                error={errors.name}
            />
        </FormField>
    );
}
