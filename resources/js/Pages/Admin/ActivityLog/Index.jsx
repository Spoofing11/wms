import { Head } from '@inertiajs/react';
import { Box } from '@mantine/core';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import { IconActivity } from '@tabler/icons-react';

export default function Index() {
    return (
        <AuthenticatedLayout
            header={<PageHeader title="Activity Log" subtitle="Riwayat aktivitas pengguna" />}
        >
            <Head title="Activity Log" />
            <Box p="md">
                <EmptyState
                    icon={IconActivity}
                    title="Coming Soon"
                    description="Fitur Activity Log akan segera tersedia"
                />
            </Box>
        </AuthenticatedLayout>
    );
}
