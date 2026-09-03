import { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Group, Button, Badge, ActionIcon, Menu, Text, Textarea, FileInput, Stack, Modal, Image, Divider, Box } from '@mantine/core';
import { IconCheck, IconX, IconCamera, IconClipboardCheck, IconEye, IconDotsVertical, IconPrinter } from '@tabler/icons-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import GroupedTable from '@/Components/Operational/GroupedTable';
import { connectPrinter, printReceipt } from '@/Services/printService';
import useApi from '@/Hooks/useApi';
import { toast } from 'react-toastify';

export default function Index() {
    const api = useApi();

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [approveModal, setApproveModal] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [viewItem, setViewItem] = useState(null);
    const [photoPreviewItem, setPhotoPreviewItem] = useState(null);

    const fetchData = useCallback(async (newPage = 1, newSearch = search) => {
        setLoading(true);
        try {
            const res = await api.get('/api/v1/operational/approval', { page: newPage, search: newSearch, per_page: 10 });
            setData(res.data);
            setMeta(res.meta);
            setPage(newPage);
        } catch (err) {
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchData(1); }, []);

    const debounceRef = useRef(null);
    const handleSearch = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchData(1, val), 300);
    };

    const handleApproveStep1 = async (item) => {
        setLoading(true);
        try {
            await api.post(`/api/v1/operational/approval/${item.id}/approve-step1`);
            toast.success('Item berhasil di-approve (Step 1).');
            fetchData(page, search);
        } catch (err) {
            toast.error(err.message || 'Gagal approve.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveStep2 = async () => {
        if (!approveModal) return;
        setLoading(true);
        try {
            const formData = new FormData();
            if (photoFile) formData.append('photo', photoFile);
            await api.upload(`/api/v1/operational/approval/${approveModal.id}/approve-step2`, formData);
            toast.success('Item berhasil di-approve. Barang Keluar otomatis dibuat.');
            setApproveModal(null);
            setPhotoFile(null);
            setPhotoPreview(null);
            fetchData(page, search);
        } catch (err) {
            toast.error(err.message || 'Gagal approve.');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setLoading(true);
        try {
            await api.post(`/api/v1/operational/approval/${rejectModal.id}/reject`, { rejection_reason: rejectReason });
            toast.success('Item berhasil ditolak.');
            setRejectModal(null);
            setRejectReason('');
            fetchData(page, search);
        } catch (err) {
            toast.error(err.message || 'Gagal reject.');
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => {
        const colors = { diajukan: 'blue', disetujui: 'cyan', siap_ambil: 'green', diterima: 'green', ditolak: 'red' };
        return colors[status] || 'gray';
    };

    const statusLabel = (status) => {
        const labels = { diajukan: 'Menunggu Approve', disetujui: 'Menunggu Foto', siap_ambil: 'Siap Diambil', diterima: 'Selesai', ditolak: 'Ditolak' };
        return labels[status] || status;
    };

    const headerColumns = [
        {
            key: 'requester_name',
            label: 'Pemohon',
            render: (row) => row.requester_name || row.requester?.name || '-',
        },
        {
            key: 'division',
            label: 'Divisi',
            render: (row) => row.division || '-',
        },
        {
            key: 'project',
            label: 'Proyek',
            render: (row) => row.project?.name || '-',
        },
        {
            key: 'request_date',
            label: 'Tanggal',
            render: (row) => row.request_date ? new Date(row.request_date).toLocaleDateString('id-ID') : '-',
        },
        {
            key: 'urgency',
            label: 'Urgensi',
            render: (row) => (
                <Badge color={row.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                    {row.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <Badge color={statusColor(row.status)} variant="light">
                    {statusLabel(row.status)}
                </Badge>
            ),
        },
    ];

    const childColumns = [
        {
            key: 'product',
            label: 'Barang',
            render: (child) => child.product?.name || child.new_item_name || '-',
        },
        {
            key: 'quantity_requested',
            label: 'Qty',
            render: (child) => child.quantity_requested,
        },
        {
            key: 'item_status',
            label: 'Status',
            render: (child) => (
                <Badge color={statusColor(child.status)} variant="light" size="sm">
                    {statusLabel(child.status)}
                </Badge>
            ),
        },
        {
            key: 'notes',
            label: 'Keterangan',
            render: (child) => child.notes || '-',
        },
    ];

    const headerActions = (row) => (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem(row)}>
                    Lihat Detail
                </Menu.Item>
                <Menu.Item leftSection={<IconPrinter size={16} />} onClick={() => handlePrint(row.items[0])}>
                    Preview PDF
                </Menu.Item>
                <Menu.Item leftSection={<IconPrinter size={16} />} onClick={() => handlePrintThermal(row.items[0])}>
                    Print Thermal
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    const handlePrint = async (child) => {
        window.open(`/approval/${child.id}/print-pdf`, '_blank');
    };

    const handlePrintThermal = async (child) => {
        setLoading(true);
        try {
            const result = await api.post(`/api/v1/operational/approval/${child.id}/print-data`);
            await connectPrinter();
            await printReceipt(result.data);
            toast.success('Berhasil dikirim ke printer thermal!');
        } catch (err) {
            toast.error(err.message || 'Gagal mencetak ke printer thermal.');
        } finally {
            setLoading(false);
        }
    };

    const childActions = (child, parent) => (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => setViewItem({ ...parent, _selectedItem: child })}>
                    Lihat Detail
                </Menu.Item>
                {['diajukan', 'siap_ambil'].includes(child.status) && (
                    <>
                        <Menu.Item leftSection={<IconCheck size={16} />} color="green" onClick={() => handleApproveStep1(child)}>
                            Approve
                        </Menu.Item>
                        <Menu.Item leftSection={<IconX size={16} />} color="red" onClick={() => setRejectModal(child)}>
                            Tolak
                        </Menu.Item>
                    </>
                )}
                {child.status === 'disetujui' && (
                    <Menu.Item leftSection={<IconCamera size={16} />} color="blue" onClick={() => setApproveModal(child)}>
                        Approve + Foto
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );

    return (
        <AuthenticatedLayout
            header={<PageHeader
                title="Inbox / Approval"
                subtitle="Approval permintaan bahan"
                search={{ value: search, placeholder: 'Cari pemohon, divisi, proyek, barang...' }}
                onSearch={handleSearch}
            />}
        >
            <Head title="Inbox / Approval" />

            <Text size="sm" c="dimmed" mb="sm">
                Menampilkan {data.length} dari {meta.total} permintaan pending
            </Text>

            {data.length > 0 ? (
                <GroupedTable
                    data={data}
                    expandKey="id"
                    headerColumns={headerColumns}
                    childColumns={childColumns}
                    headerActions={headerActions}
                    childActions={childActions}
                    emptyMessage="Tidak ada item pending"
                />
            ) : (
                <EmptyState
                    icon={<IconClipboardCheck size={28} />}
                    title="Tidak ada item pending"
                    description="Semua permintaan sudah diproses."
                />
            )}

            {meta.last_page > 1 && (
                <Group justify="center" mt="md">
                    <Button variant="default" disabled={page <= 1} onClick={() => fetchData(page - 1, search)}>Sebelumnya</Button>
                    <Text size="sm">Halaman {page} dari {meta.last_page}</Text>
                    <Button variant="default" disabled={page >= meta.last_page} onClick={() => fetchData(page + 1, search)}>Selanjutnya</Button>
                </Group>
            )}

            {/* Approve Step 2 + Foto Modal */}
            <Modal opened={!!approveModal} onClose={() => { setApproveModal(null); setPhotoFile(null); setPhotoPreview(null); }} title="Approve + Foto" size="md">
                <Stack gap="md">
                    <Text size="sm">Barang: <strong>{approveModal?.product?.name || approveModal?.new_item_name}</strong></Text>
                    <Text size="sm">Qty: <strong>{approveModal?.quantity_requested}</strong></Text>
                    <FileInput
                        label="Foto Barang"
                        placeholder="Pilih foto..."
                        accept="image/*"
                        value={photoFile}
                        onChange={(file) => {
                            setPhotoFile(file);
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => setPhotoPreview(e.target.result);
                                reader.readAsDataURL(file);
                            } else {
                                setPhotoPreview(null);
                            }
                        }}
                    />
                    {photoPreview && <Image src={photoPreview} radius="md" h={200} fit="contain" />}
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => { setApproveModal(null); setPhotoFile(null); setPhotoPreview(null); }}>Batal</Button>
                        <Button color="green" onClick={handleApproveStep2} loading={loading}>Submit & Kirim ke Barang Keluar</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Reject Modal */}
            <Modal opened={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason(''); }} title="Tolak Item" size="md">
                <Stack gap="md">
                    <Text size="sm">Barang: <strong>{rejectModal?.product?.name || rejectModal?.new_item_name}</strong></Text>
                    <Textarea
                        label="Alasan Penolakan"
                        placeholder="Masukkan alasan penolakan..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.currentTarget.value)}
                        rows={3}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Batal</Button>
                        <Button color="red" onClick={handleReject} loading={loading}>Tolak</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* View Detail Modal */}
            <Modal opened={!!viewItem} onClose={() => setViewItem(null)} title={viewItem?._selectedItem ? "Detail Item" : "Detail Permintaan"} size="lg">
                <Stack gap="md">
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Pemohon</Text>
                            <Text size="sm" fw={500}>{viewItem?.requester_name || viewItem?.requester?.name || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Divisi</Text>
                            <Text size="sm" fw={500}>{viewItem?.division || '-'}</Text>
                        </div>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Proyek</Text>
                            <Text size="sm" fw={500}>{viewItem?.project?.name || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Urgensi</Text>
                            <Badge color={viewItem?.urgency === 'urgent' ? 'red' : 'blue'} variant="light">
                                {viewItem?.urgency === 'urgent' ? 'Urgent' : 'Normal'}
                            </Badge>
                        </div>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Tanggal Permintaan</Text>
                            <Text size="sm" fw={500}>{viewItem?.request_date ? new Date(viewItem.request_date).toLocaleDateString('id-ID') : '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">Waktu Pengambilan</Text>
                            <Text size="sm" fw={500}>{viewItem?.pickup_time || '-'}</Text>
                        </div>
                    </Group>
                    <Group grow>
                        <div>
                            <Text size="xs" c="dimmed">Status MR</Text>
                            <Badge color={statusColor(viewItem?.status)} variant="light">{statusLabel(viewItem?.status)}</Badge>
                        </div>
                    </Group>

                    <Divider my="sm" />

                    {viewItem?._selectedItem ? (
                        <>
                            <Text fw={600} size="sm">Detail Item</Text>
                            <Box p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6, backgroundColor: '#fafafa' }}>
                                <Text size="xs" c="dimmed" mb={4}>Barang</Text>
                                <Text size="sm" fw={500}>{viewItem._selectedItem?.product?.name || viewItem._selectedItem?.new_item_name || '-'}</Text>
                                <Text size="xs" c="dimmed" mt={4}>SKU: {viewItem._selectedItem?.product?.sku || 'Barang Baru'} | Qty: {viewItem._selectedItem?.quantity_requested}</Text>
                                <Text size="xs" c="dimmed" mt={4}>Status: <Badge color={statusColor(viewItem._selectedItem?.status)} variant="light" size="sm">{statusLabel(viewItem._selectedItem?.status)}</Badge></Text>
                                {viewItem._selectedItem?.notes && <Text size="xs" c="dimmed" mt={4}>Catatan: {viewItem._selectedItem.notes}</Text>}
                            </Box>
                            {viewItem._selectedItem?.photo && (
                                <div>
                                    <Text size="xs" c="dimmed" mb={4}>Foto Barang</Text>
                                    <Image
                                        src={viewItem._selectedItem.photo.startsWith('http') ? viewItem._selectedItem.photo : `/storage/${viewItem._selectedItem.photo}`}
                                        radius="md"
                                        h={200}
                                        fit="contain"
                                    />
                                </div>
                            )}
                            {viewItem._selectedItem?.ready_photo && (
                                <div>
                                    <Text size="xs" c="dimmed" mb={4}>Foto Approve</Text>
                                    <Image
                                        src={viewItem._selectedItem.ready_photo.startsWith('http') ? viewItem._selectedItem.ready_photo : `/storage/${viewItem._selectedItem.ready_photo}`}
                                        radius="md"
                                        h={200}
                                        fit="contain"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setPhotoPreviewItem(viewItem._selectedItem.ready_photo)}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Text fw={600} size="sm">Items ({viewItem?.items?.length || 0})</Text>
                            {viewItem?.items?.map((item) => (
                                <Box key={item.id} p="sm" style={{ border: '1px solid #e5e7eb', borderRadius: 6, marginBottom: 8 }}>
                                    <Group justify="space-between" align="flex-start">
                                        <div style={{ flex: 1 }}>
                                            <Text size="sm" fw={500}>{item.product?.name || item.new_item_name || '-'}</Text>
                                            <Text size="xs" c="dimmed">Qty: {item.quantity_requested} | SKU: {item.product?.sku || 'Barang Baru'}</Text>
                                            <Text size="xs" c="dimmed" mt={4}>
                                                Status: <Badge color={statusColor(item.status)} variant="light" size="sm">{statusLabel(item.status)}</Badge>
                                            </Text>
                                            {item.notes && <Text size="xs" c="dimmed" mt={4}>Catatan: {item.notes}</Text>}
                                        </div>
                                        {item.photo && (
                                            <Image
                                                src={item.photo.startsWith('http') ? item.photo : `/storage/${item.photo}`}
                                                radius="md"
                                                h={80}
                                                w={80}
                                                fit="cover"
                                            />
                                        )}
                                        {item.ready_photo && (
                                            <Image
                                                src={item.ready_photo.startsWith('http') ? item.ready_photo : `/storage/${item.ready_photo}`}
                                                radius="md"
                                                h={80}
                                                w={80}
                                                fit="cover"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setPhotoPreviewItem(item.ready_photo)}
                                            />
                                        )}
                                    </Group>
                                </Box>
                            ))}
                        </>
                    )}
                </Stack>
            </Modal>

            <Modal opened={!!photoPreviewItem} onClose={() => setPhotoPreviewItem(null)} title="Foto Approve" size="lg" centered>
                <Image
                    src={photoPreviewItem?.startsWith('http') ? photoPreviewItem : `/storage/${photoPreviewItem}`}
                    radius="md"
                    fit="contain"
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
