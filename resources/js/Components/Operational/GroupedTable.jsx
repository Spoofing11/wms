import { useState } from 'react';
import { Table, Box, Text, Group, ActionIcon } from '@mantine/core';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';

export default function GroupedTable({
    data = [],
    expandKey = 'id',
    headerColumns = [],
    childColumns = [],
    childRender = null,
    headerActions = () => null,
    childActions = () => null,
    defaultExpanded = false,
    emptyMessage = 'Tidak ada data',
    headerStyle = {},
    childStyle = {},
}) {
    const [expandedRows, setExpandedRows] = useState(() => {
        if (defaultExpanded) return new Set(data.map(d => d[expandKey]));
        return new Set();
    });

    const toggleExpand = (id) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
            <Table horizontalSpacing="md" verticalSpacing="sm" fontSize="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ backgroundColor: '#F9FAFB', width: 40, borderBottom: '1px solid #E5E7EB' }} />
                        {headerColumns.map((col) => (
                            <Table.Th
                                key={col.key}
                                style={{
                                    backgroundColor: '#F9FAFB',
                                    borderBottom: '1px solid #E5E7EB',
                                    padding: '10px 14px',
                                    textAlign: 'left',
                                    whiteSpace: 'nowrap',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    letterSpacing: '0.02em',
                                    color: '#374151',
                                    ...col.thStyle,
                                }}
                            >
                                {col.label}
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={headerColumns.length + 1}>
                                <Text c="dimmed" ta="center" py="xl" size="sm">
                                    {emptyMessage}
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        data.map((row) => {
                            const rowId = row[expandKey];
                            const isExpanded = expandedRows.has(rowId);
                            const children = row.items || row.children || [];

                            return [
                                <Table.Tr
                                    key={`header-${rowId}`}
                                    onClick={() => toggleExpand(rowId)}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: '#FAFBFC',
                                        transition: 'background-color 0.1s ease',
                                        ...headerStyle,
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FAFBFC'; }}
                                >
                                    <Table.Td style={{ padding: '10px 14px', width: 40, borderBottom: '1px solid #E5E7EB' }}>
                                        <Box
                                            style={{
                                                transition: 'transform 0.2s ease',
                                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                display: 'inline-flex',
                                            }}
                                        >
                                            <IconChevronRight size={16} style={{ color: '#6B7280' }} />
                                        </Box>
                                    </Table.Td>
                                    {headerColumns.map((col) => (
                                        <Table.Td
                                            key={col.key}
                                            style={{
                                                padding: '10px 14px',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                borderBottom: '1px solid #E5E7EB',
                                                color: '#111827',
                                                ...col.tdStyle,
                                            }}
                                        >
                                            {col.render ? col.render(row) : row[col.key]}
                                        </Table.Td>
                                    ))}
                                    <Table.Td style={{ padding: '6px 8px', width: 56, textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>
                                        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            {headerActions(row)}
                                        </Box>
                                    </Table.Td>
                                </Table.Tr>,

                                ...(isExpanded && children.length > 0 ? children.map((child, childIdx) => (
                                    <Table.Tr
                                        key={`child-${rowId}-${childIdx}`}
                                        style={{ backgroundColor: '#FFFFFF', ...childStyle }}
                                    >
                                        <Table.Td style={{ padding: '8px 14px', width: 40, borderLeft: '2px solid #E5E7EB', borderBottom: '1px solid #F3F4F6' }} />
                                        {childRender ? (
                                            <Table.Td colSpan={headerColumns.length} style={{ padding: '8px 14px', borderLeft: '2px solid #E5E7EB', borderBottom: '1px solid #F3F4F6' }}>
                                                {childRender(child, row)}
                                            </Table.Td>
                                        ) : (
                                            childColumns.map((col) => (
                                                <Table.Td
                                                    key={col.key}
                                                    style={{
                                                        padding: '8px 14px',
                                                        fontSize: 13,
                                                        borderLeft: '2px solid #E5E7EB',
                                                        borderBottom: '1px solid #F3F4F6',
                                                        color: '#374151',
                                                        ...col.tdStyle,
                                                    }}
                                                >
                                                    {col.render ? col.render(child, row) : child[col.key]}
                                                </Table.Td>
                                            ))
                                        )}
                                        <Table.Td style={{ padding: '6px 8px', width: 56, textAlign: 'center', borderLeft: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                                            <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {childActions(child, row)}
                                            </Box>
                                        </Table.Td>
                                    </Table.Tr>
                                )) : []),

                                ...(isExpanded && children.length === 0 ? [
                                    <Table.Tr key={`empty-${rowId}`} style={{ backgroundColor: '#FFFFFF' }}>
                                        <Table.Td style={{ padding: '8px 14px', width: 40, borderLeft: '2px solid #E5E7EB', borderBottom: '1px solid #F3F4F6' }} />
                                        <Table.Td colSpan={childRender ? headerColumns.length : childColumns.length} style={{ padding: '8px 14px', fontSize: 13, borderLeft: '2px solid #E5E7EB', borderBottom: '1px solid #F3F4F6', color: '#9CA3AF' }}>
                                            Tidak ada item
                                        </Table.Td>
                                    </Table.Tr>
                                ] : []),
                            ];
                        })
                    )}
                </Table.Tbody>
            </Table>
        </Box>
    );
}
