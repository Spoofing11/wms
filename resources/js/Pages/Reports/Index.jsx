import { Head } from '@inertiajs/react';
import { Text, Paper, Stack } from '@mantine/core';
import { IconReport } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';

export default function Index() {
    return (
        <AuthenticatedLayout
            header={<PageHeader title="Laporan" subtitle="Modul laporan akan segera hadir" />}
        >
            <Head title="Laporan" />

            <Paper
                p="xl"
                radius="sm"
                style={{ border: '1px dashed #D1D5DB', backgroundColor: '#FAFAFA' }}
            >
                <Stack align="center" gap="md">
                    <IconReport size={48} style={{ color: '#9CA3AF' }} />
                    <Text fw={600} size="lg" style={{ color: '#374151' }}>
                        Modul Laporan
                    </Text>
                    <Text c="dimmed" ta="center" maw={400}>
                        Fitur laporan sedang dalam pengembangan. Halaman ini akan menampilkan
                        berbagai laporan warehouse seperti laporan stok, transaksi, dan aktivitas.
                    </Text>
                </Stack>
            </Paper>
        </AuthenticatedLayout>
    );
}
