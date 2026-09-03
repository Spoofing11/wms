import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { SimpleGrid, Text, Badge, Table, Group, Select, Box, Alert } from '@mantine/core';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    IconPackage, IconUsers, IconArrowDown, IconArrowUp,
    IconAlertTriangle,
} from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import StatCard from '@/Components/ui/StatCard';
import DashboardCard from '@/Components/ui/DashboardCard';

const statusColor = (status) => {
    const map = {
        diajukan: 'blue',
        menunggu_review_admin: 'yellow',
        disetujui: 'green',
        ditolak: 'red',
        siap_ambil: 'teal',
        diterima: 'green',
        selesai: 'gray',
    };
    return map[status] || 'gray';
};

const statusLabel = (status) => {
    const map = {
        diajukan: 'Diajukan',
        menunggu_review_admin: 'Menunggu Review',
        disetujui: 'Disetujui',
        ditolak: 'Ditolak',
        siap_ambil: 'Siap Ambil',
        diterima: 'Diterima',
        selesai: 'Selesai',
    };
    return map[status] || status;
};

const PERIOD_OPTIONS = [
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
];

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

export default function Dashboard({
    stats,
    transactionsChart,
    stockChart,
    recentMRs,
    pendingApprovals,
    lowStockProducts,
}) {
    const [txPeriod, setTxPeriod] = useState('daily');
    const [stockPeriod, setStockPeriod] = useState('daily');

    const handleTxPeriod = (val) => {
        setTxPeriod(val);
        router.get(route('dashboard'), { period: val }, { preserveState: true, replace: true });
    };

    const handleStockPeriod = (val) => {
        setStockPeriod(val);
        router.get(route('dashboard'), { period: val }, { preserveState: true, replace: true });
    };

    const chartData = transactionsChart.map((d) => ({
        ...d,
        label: formatDate(d.date),
    }));

    const stockData = stockChart.map((d) => ({
        ...d,
        label: formatDate(d.date),
    }));

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Dashboard" subtitle="Ringkasan data Warehouse Management System" />}
        >
            <Head title="Dashboard" />

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
                <StatCard
                    title="Total Produk"
                    value={stats.total_products}
                    icon={<IconPackage size={22} />}
                    color="brand"
                    subtitle="Semua data produk"
                    href={safeRoute('master.products.index')}
                />
                <StatCard
                    title="Total User"
                    value={stats.total_user}
                    icon={<IconUsers size={22} />}
                    color="blue"
                    subtitle="Akun aktif"
                    href={safeRoute('admin.users.index')}
                />
                <StatCard
                    title="Barang Masuk Hari Ini"
                    value={stats.incoming_today}
                    icon={<IconArrowDown size={22} />}
                    color="teal"
                    subtitle="Transaksi masuk"
                    href={safeRoute('transactions.barang-masuk')}
                />
                <StatCard
                    title="Barang Keluar Hari Ini"
                    value={stats.outgoing_today}
                    icon={<IconArrowUp size={22} />}
                    color="red"
                    subtitle="Transaksi keluar"
                    href={safeRoute('transactions.barang-keluar')}
                />
            </SimpleGrid>

            {/* Charts */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
                <DashboardCard title="Transaksi Barang">
                    <Group justify="flex-end" mb="sm">
                        <Select
                            data={PERIOD_OPTIONS}
                            value={txPeriod}
                            onChange={handleTxPeriod}
                            size="xs"
                            w={120}
                            radius="md"
                        />
                    </Group>
                    <Box style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="incoming" name="Masuk" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="outgoing" name="Keluar" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </DashboardCard>

                <DashboardCard title="Perkembangan Stok">
                    <Group justify="flex-end" mb="sm">
                        <Select
                            data={PERIOD_OPTIONS}
                            value={stockPeriod}
                            onChange={handleStockPeriod}
                            size="xs"
                            w={120}
                            radius="md"
                        />
                    </Group>
                    <Box style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stockData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total_stock"
                                    name="Total Stok"
                                    stroke="#705838"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#705838' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </DashboardCard>
            </SimpleGrid>

            {/* Recent MRs + Pending Approvals */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="md">
                <DashboardCard title="Permintaan Bahan Terbaru" href={safeRoute('operational.material-requests')}>
                    <Box style={{ overflowX: 'auto' }}>
                        <Table horizontalSpacing="md" verticalSpacing="xs" fontSize="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={thStyle}>Tanggal</Table.Th>
                                    <Table.Th style={thStyle}>Pemohon</Table.Th>
                                    <Table.Th style={thStyle}>Divisi</Table.Th>
                                    <Table.Th style={thStyle}>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {recentMRs.length > 0 ? recentMRs.map((mr) => (
                                    <Table.Tr key={mr.id}>
                                        <Table.Td style={tdStyle}>{mr.request_date}</Table.Td>
                                        <Table.Td style={tdStyle}>{mr.requester_name}</Table.Td>
                                        <Table.Td style={tdStyle}>{mr.division}</Table.Td>
                                        <Table.Td style={tdStyle}>
                                            <Badge color={statusColor(mr.status)} variant="light" size="sm">
                                                {statusLabel(mr.status)}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                )) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={4}>
                                            <Text c="dimmed" ta="center" py="md" size="sm">Belum ada data</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Box>
                </DashboardCard>

                <DashboardCard title="Approval Admin Proyek" href={safeRoute('operational.admin-proyek')}>
                    <Box style={{ overflowX: 'auto' }}>
                        <Table horizontalSpacing="md" verticalSpacing="xs" fontSize="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={thStyle}>Barang</Table.Th>
                                    <Table.Th style={thStyle}>Qty</Table.Th>
                                    <Table.Th style={thStyle}>Pemohon</Table.Th>
                                    <Table.Th style={thStyle}>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {pendingApprovals.length > 0 ? pendingApprovals.map((item) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td style={tdStyle}>{item.product_name}</Table.Td>
                                        <Table.Td style={tdStyle}>{item.quantity}</Table.Td>
                                        <Table.Td style={tdStyle}>{item.requester_name}</Table.Td>
                                        <Table.Td style={tdStyle}>
                                            <Badge color={statusColor(item.status)} variant="light" size="sm">
                                                {statusLabel(item.status)}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                )) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={4}>
                                            <Text c="dimmed" ta="center" py="md" size="sm">Tidak ada approval pending</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Box>
                </DashboardCard>
            </SimpleGrid>

            {/* Low Stock Alert */}
            <DashboardCard title="Stok Menipis" href={safeRoute('master.products.index')}>
                {lowStockProducts.length > 0 ? (
                    <>
                        <Alert
                            icon={<IconAlertTriangle size={16} />}
                            color="red"
                            variant="light"
                            mb="md"
                            radius="sm"
                        >
                            <Text size="sm">{lowStockProducts.length} produk memiliki stok di bawah batas minimum.</Text>
                        </Alert>
                        <Box style={{ overflowX: 'auto' }}>
                            <Table horizontalSpacing="md" verticalSpacing="xs" fontSize="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th style={thStyle}>Nama Produk</Table.Th>
                                        <Table.Th style={thStyle}>SKU</Table.Th>
                                        <Table.Th style={thStyle}>Kategori</Table.Th>
                                        <Table.Th style={thStyle}>Stok</Table.Th>
                                        <Table.Th style={thStyle}>Min Stok</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {lowStockProducts.map((p) => (
                                        <Table.Tr key={p.id}>
                                            <Table.Td style={tdStyle}>{p.name}</Table.Td>
                                            <Table.Td style={tdStyle}>{p.sku}</Table.Td>
                                            <Table.Td style={tdStyle}>{p.category_name || '-'}</Table.Td>
                                            <Table.Td style={tdStyle}>
                                                <Text fw={600} c="red">{p.stock}</Text>
                                            </Table.Td>
                                            <Table.Td style={tdStyle}>{p.min_stock}</Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </>
                ) : (
                    <Text c="dimmed" ta="center" py="md" size="sm">
                        Semua stok produk dalam kondisi aman.
                    </Text>
                )}
            </DashboardCard>
        </AuthenticatedLayout>
    );
}

function safeRoute(name) {
    try {
        return route(name);
    } catch {
        return '#';
    }
}

const thStyle = {
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: '0.02em',
    color: '#374151',
};

const tdStyle = {
    padding: '8px 14px',
    borderBottom: '1px solid #F3F4F6',
};
