import { useMemo } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
    useLegacyTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table/legacy';
import {
    Table,
    TextInput,
    Group,
    Text,
    UnstyledButton,
    Box,
    Stack,
    Select,
    Checkbox,
    Button,
} from '@mantine/core';
import {
    IconChevronUp,
    IconChevronDown,
    IconSelector,
    IconSearch,
    IconTrash,
} from '@tabler/icons-react';

export default function DataTable({
    columns,
    data = [],
    total = 0,
    page = 1,
    perPage = 10,
    sortField,
    sortOrder,
    searchValue = '',
    searchPlaceholder = 'Cari...',
    onSearch,
    onPageChange,
    onSortChange,
    actions,
    verticalSpacing = 'sm',
    enableSelection = false,
    selectedRowIds = [],
    onSelectionChange,
    onBulkDelete,
    stickyColumns = [],
}) {
    const allPageIds = useMemo(() => data.map((d) => d.id), [data]);
    const allSelected = enableSelection && allPageIds.length > 0 && allPageIds.every((id) => selectedRowIds.includes(id));
    const someSelected = enableSelection && allPageIds.some((id) => selectedRowIds.includes(id));

    const toggleAll = () => {
        if (allSelected) {
            onSelectionChange?.([]);
        } else {
            onSelectionChange?.(allPageIds);
        }
    };

    const toggleRow = (id) => {
        if (!enableSelection) return;
        if (selectedRowIds.includes(id)) {
            onSelectionChange?.(selectedRowIds.filter((i) => i !== id));
        } else {
            onSelectionChange?.([...selectedRowIds, id]);
        }
    };

    const tableColumns = useMemo(() => {
        if (!enableSelection) return columns;
        return [
            {
                id: '_select',
                header: () => (
                    <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={toggleAll}
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedRowIds.includes(row.original.id)}
                        onChange={() => toggleRow(row.original.id)}
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
                size: 40,
                enableSorting: false,
            },
            ...columns,
        ];
    }, [columns, enableSelection, selectedRowIds, allSelected, someSelected]);

    const table = useLegacyTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
    });

    const stickyOffsets = useMemo(() => {
        const offsets = {};
        let currentLeft = 0;
        const offsetStep = 120;
        stickyColumns.forEach((col) => {
            offsets[col.accessorKey] = currentLeft;
            currentLeft += col.minWidth || offsetStep;
        });
        return offsets;
    }, [stickyColumns]);

    const isSticky = (accessorKey) => stickyColumns.some((c) => c.accessorKey === accessorKey);
    const getStickyStyle = (accessorKey, isHeader) => {
        if (!isSticky(accessorKey)) return {};
        return {
            position: 'sticky',
            left: stickyOffsets[accessorKey] ?? 0,
            zIndex: 2,
            backgroundColor: isHeader ? '#F9FAFB' : '#ffffff',
            boxShadow: '1px 0 0 0 #E5E7EB',
        };
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <IconSelector size={14} style={{ color: '#9CA3AF' }} />;
        return sortOrder === 'asc'
            ? <IconChevronUp size={14} style={{ color: '#374151' }} />
            : <IconChevronDown size={14} style={{ color: '#374151' }} />;
    };

    const totalPages = Math.ceil(total / perPage);
    const colSpan = enableSelection ? columns.length + 1 : columns.length;

    return (
        <Stack gap="md">
            <Group justify="space-between" align="center">
                <Group gap="sm">
                    <TextInput
                        placeholder={searchPlaceholder}
                        leftSection={<IconSearch size={16} style={{ color: '#9CA3AF' }} />}
                        value={searchValue}
                        onChange={(e) => onSearch?.(e.currentTarget.value)}
                        w={320}
                        size="sm"
                        radius="md"
                        styles={{
                            input: {
                                borderColor: '#E5E7EB',
                                backgroundColor: '#ffffff',
                                '&:focus-within': {
                                    borderColor: '#93C5FD',
                                    boxShadow: '0 0 0 1px #93C5FD',
                                },
                            },
                        }}
                    />
                    {enableSelection && selectedRowIds.length > 0 && (
                        <Button
                            size="sm"
                            color="red"
                            variant="light"
                            leftSection={<IconTrash size={16} />}
                            onClick={onBulkDelete}
                        >
                            Hapus {selectedRowIds.length} item
                        </Button>
                    )}
                </Group>
                {actions}
            </Group>

            <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <Table horizontalSpacing="md" verticalSpacing={verticalSpacing} fontSize="sm">
                    <Table.Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Th
                                        key={header.id}
                                        style={{
                                            backgroundColor: '#F9FAFB',
                                            borderBottom: '1px solid #E5E7EB',
                                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                            userSelect: 'none',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 600,
                                            fontSize: 12,
                                            letterSpacing: '0.02em',
                                            color: '#374151',
                                            padding: '10px 14px',
                                            width: header.column.id === '_select' ? 40 : undefined,
                                            ...getStickyStyle(header.column.id, true),
                                        }}
                                        onClick={() => {
                                            if (header.column.getCanSort()) {
                                                const nextOrder = sortField === header.column.id
                                                    ? (sortOrder === 'asc' ? 'desc' : 'asc')
                                                    : 'asc';
                                                onSortChange?.(header.column.id, nextOrder);
                                            }
                                        }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <Group gap={4} style={{ whiteSpace: 'nowrap' }}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && <SortIcon field={header.column.id} />}
                                            </Group>
                                        )}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Thead>
                    <Table.Tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <Table.Tr
                                    key={row.id}
                                    style={{
                                        transition: 'background-color 0.1s ease',
                                        ...(enableSelection && selectedRowIds.includes(row.original.id)
                                            ? { backgroundColor: '#EFF6FF' }
                                            : {}),
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!enableSelection || !selectedRowIds.includes(row.original.id)) {
                                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!enableSelection || !selectedRowIds.includes(row.original.id)) {
                                            e.currentTarget.style.backgroundColor = '';
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Td
                                            key={cell.id}
                                            style={{
                                                padding: '10px 14px',
                                                borderBottom: '1px solid #F3F4F6',
                                                ...getStickyStyle(cell.column.id, false),
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={colSpan}>
                                    <Text c="dimmed" ta="center" py="xl" size="sm">
                                        Tidak ada data ditemukan
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Box>

            <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                    {enableSelection && selectedRowIds.length > 0
                        ? `${selectedRowIds.length} item dipilih · `
                        : ''
                    }
                    Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} dari {total}
                </Text>
                <Group gap={4}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === page;
                        return (
                            <UnstyledButton
                                key={pageNum}
                                onClick={() => onPageChange?.(pageNum)}
                                style={{
                                    minWidth: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                    fontWeight: isActive ? 600 : 500,
                                    border: isActive ? '1px solid #705838' : '1px solid transparent',
                                    backgroundColor: isActive ? '#FAF6F1' : 'transparent',
                                    color: isActive ? '#705838' : '#6B7280',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                                        e.currentTarget.style.color = '#374151';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.color = '#6B7280';
                                    }
                                }}
                            >
                                {pageNum}
                            </UnstyledButton>
                        );
                    })}
                </Group>
            </Group>
        </Stack>
    );
}
