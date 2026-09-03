import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Group, Select, Text, Badge, Button, Stack, TextInput, Table, Box, Modal, NumberInput, Textarea, ActionIcon, Tooltip } from '@mantine/core';
import { IconFilter, IconSearch, IconRefresh } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

export default function Index({ overview, categories }) {
    const api = useApi();
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(false);

    const [restockItem, setRestockItem] = useState(null);
    const [restockQty, setRestockQty] = useState(1);
    const [restockNotes, setRestockNotes] = useState('');
    const [restockUrgency, setRestockUrgency] = useState('normal');

    const filteredData = useMemo(() => {
        let data = [...(overview || [])];
        if (search) {
            const q = search.toLowerCase();
            data = data.filter((item) =>
                item.name?.toLowerCase().includes(q) ||
                item.sku?.toLowerCase().includes(q)
            );
        }
        return data;
    }, [overview, search]);

    const fetchData = () => {
        const params = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (status) params.status = status;
        if (categoryId) params.category_id = categoryId;
        router.get(route('transactions.stock-overview'), params, { preserveState: true, replace: true });
    };

    const handleRestock = async () => {
        if (!restockItem || restockQty < 1) return;
        setLoading(true);
        try {
            await api.post('/api/v1/stock-replenishments', {
                product_id: restockItem.id,
                quantity: restockQty,
                notes: restockNotes,
                urgency: restockUrgency,
            });
            toast.success(`Restock request untuk "${restockItem.name}" berhasil dibuat.`);
            setRestockItem(null);
            setRestockQty(1);
            setRestockNotes('');
            setRestockUrgency('normal');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Gagal membuat restock request.');
        } finally {
            setLoading(false);
        }
    };

    const thStyle = { backgroundColor: '#faf6f1', padding: '8px 12px', textAlign: 'left', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600 };
    const tdStyle = { padding: '8px 12px', fontSize: 13 };

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Stock Overview" subtitle="Ringkasan stock semua barang" />}
        >
            <Head title="Stock Overview" />

            <Stack gap="md" mb="md" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Cari barang..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        w={240}
                        size="sm"
                    />
                    <Select
                        placeholder="Semua Kategori"
                        data={(categories || []).map((c) => ({ value: String(c.id), label: `${c.code} - ${c.name}` }))}
                        value={categoryId || ''}
                        onChange={(val) => setCategoryId(val)}
                        searchable
                        clearable
                        w={200}
                        size="sm"
                    />
                    <Select
                        placeholder="Semua Status"
                        data={[
                            { value: '', label: 'Semua Status' },
                            { value: 'aman', label: 'Stock Aman' },
                            { value: 'rendah', label: 'Stock Rendah' },
                        ]}
                        value={status || ''}
                        onChange={(val) => setStatus(val)}
                        w={160}
                        size="sm"
                    />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Button leftSection={<IconFilter size={16} />} size="sm" onClick={fetchData} variant="filled" color="brand">
                        Filter
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                            setDateFrom('');
                            setDateTo('');
                            setStatus('');
                            setCategoryId('');
                            router.get(route('transactions.stock-overview'), {}, { preserveState: true, replace: true });
                        }}
                    >
                        Reset
                    </Button>
                </Group>
            </Stack>

            <Text size="sm" c="dimmed" mb="sm">
                Menampilkan {filteredData.length} dari {overview.length} barang
            </Text>

            <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={thStyle}>Kode Barang</Table.Th>
                            <Table.Th style={thStyle}>Nama Barang</Table.Th>
                            <Table.Th style={thStyle}>Stock Awal</Table.Th>
                            <Table.Th style={thStyle}>Barang Masuk</Table.Th>
                            <Table.Th style={thStyle}>Barang Keluar</Table.Th>
                            <Table.Th style={thStyle}>Penyesuaian</Table.Th>
                            <Table.Th style={thStyle}>Perubahan</Table.Th>
                            <Table.Th style={thStyle}>Stock Akhir</Table.Th>
                            <Table.Th style={thStyle}>Min Stock</Table.Th>
                            <Table.Th style={thStyle}>Kategori</Table.Th>
                            <Table.Th style={thStyle}>Lokasi</Table.Th>
                            <Table.Th style={thStyle}>Status</Table.Th>
                            <Table.Th style={thStyle}>Aksi</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredData.length > 0 ? filteredData.map((item) => (
                            <Table.Tr key={item.id}>
                                <Table.Td style={tdStyle}>{item.sku}</Table.Td>
                                <Table.Td style={tdStyle}>{item.name}</Table.Td>
                                <Table.Td style={tdStyle}>{item.stock_awal}</Table.Td>
                                <Table.Td style={{ ...tdStyle, color: '#2f9e44' }}>{item.barang_masuk}</Table.Td>
                                <Table.Td style={{ ...tdStyle, color: '#e03131' }}>{item.barang_keluar}</Table.Td>
                                <Table.Td style={{ ...tdStyle, color: item.penyesuaian > 0 ? '#2f9e44' : item.penyesuaian < 0 ? '#e03131' : '#868e96' }}>
                                    {item.penyesuaian > 0 ? '+' : ''}{item.penyesuaian}
                                </Table.Td>
                                <Table.Td style={{ ...tdStyle, color: item.perubahan > 0 ? '#2f9e44' : item.perubahan < 0 ? '#e03131' : '#868e96', fontWeight: 600 }}>
                                    {item.perubahan > 0 ? '+' : ''}{item.perubahan}
                                </Table.Td>
                                <Table.Td style={{ ...tdStyle, fontWeight: 700 }}>{item.stock_akhir}</Table.Td>
                                <Table.Td style={tdStyle}>{item.min_stock ?? '-'}</Table.Td>
                                <Table.Td style={tdStyle}>{item.category?.code || '-'}</Table.Td>
                                <Table.Td style={tdStyle}>{item.location?.name || '-'}</Table.Td>
                                <Table.Td style={tdStyle}>
                                    <Badge variant="light" color={item.status === 'aman' ? 'green' : 'red'}>
                                        {item.status === 'aman' ? 'Aman' : 'Rendah'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td style={tdStyle}>
                                    {item.status === 'rendah' && (
                                        <Tooltip label="Restock">
                                            <ActionIcon
                                                variant="light"
                                                color="blue"
                                                onClick={() => {
                                                    setRestockItem(item);
                                                    setRestockQty(1);
                                                    setRestockNotes('');
                                                    setRestockUrgency('normal');
                                                }}
                                            >
                                                <IconRefresh size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        )) : (
                            <Table.Tr>
                                <Table.Td colSpan={13}>
                                    <Text c="dimmed" ta="center" py="xl">Tidak ada data ditemukan</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Box>

            {/* Restock Modal */}
            <Modal
                opened={!!restockItem}
                onClose={() => setRestockItem(null)}
                title="Restock Barang"
                size="md"
            >
                <Stack gap="md">
                    <Box p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fafafa' }}>
                        <Text size="xs" c="dimmed">Barang</Text>
                        <Text size="sm" fw={600}>{restockItem?.name}</Text>
                        <Text size="xs" c="dimmed">SKU: {restockItem?.sku} | Stock: {restockItem?.stock_akhir} | Min Stock: {restockItem?.min_stock}</Text>
                    </Box>
                    <NumberInput
                        label="Qty Pembelian"
                        placeholder="Masukkan jumlah..."
                        value={restockQty}
                        onChange={(val) => setRestockQty(val || 1)}
                        min={1}
                        required
                    />
                    <Textarea
                        label="Keterangan"
                        placeholder="Catatan untuk restock ini..."
                        value={restockNotes}
                        onChange={(e) => setRestockNotes(e.currentTarget.value)}
                        rows={3}
                    />
                    <Select
                        label="Urgensi"
                        data={[
                            { value: 'normal', label: 'Normal' },
                            { value: 'urgent', label: 'Urgent' },
                        ]}
                        value={restockUrgency}
                        onChange={(val) => setRestockUrgency(val)}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setRestockItem(null)}>Batal</Button>
                        <Button color="blue" onClick={handleRestock} loading={loading}>
                            Kirim Restock Request
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </AuthenticatedLayout>
    );
}
