import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    AppShell, Burger, Group, Avatar, Menu, Text, ScrollArea,
    Box, UnstyledButton, Collapse, Stack, Indicator, Tooltip, Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconLogout, IconUser, IconSettings, IconBell,
    IconChevronDown, IconChevronRight, IconChevronLeft,
} from '@tabler/icons-react';
import { navigation } from '@/Config/navigation';

function safeRoute(name, params) {
    try {
        return route(name, params);
    } catch {
        return '#';
    }
}

function NavItem({ item, active, expanded, onToggle, collapsed, badges }) {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = expanded[item.label];
    const icon = <item.icon size={20} stroke={1.8} />;
    const badgeCount = badges?.[item.route] || 0;

    if (collapsed) {
        const handleClick = hasChildren ? onToggle : undefined;
        const Tag = hasChildren ? UnstyledButton : Link;
        const linkProps = hasChildren ? {} : { href: item.route ? safeRoute(item.route) : '#' };

        return (
            <Tooltip label={item.label} position="right" withArrow transitionProps={{ transition: 'pop', duration: 150 }}>
                <Tag
                    {...linkProps}
                    onClick={handleClick}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', padding: '10px', borderRadius: '8px',
                        color: active ? '#705838' : '#6b7280',
                        backgroundColor: active ? '#faf6f1' : 'transparent',
                        transition: 'all 0.15s ease', textDecoration: 'none',
                        position: 'relative',
                    }}
                >
                    {icon}
                    {badgeCount > 0 && (
                        <Box
                            style={{
                                position: 'absolute', top: 2, right: 2,
                                width: 18, height: 18, borderRadius: '50%',
                                backgroundColor: '#e03131', color: '#fff',
                                fontSize: 10, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            {badgeCount}
                        </Box>
                    )}
                </Tag>
            </Tooltip>
        );
    }

    if (hasChildren) {
        return (
            <Box>
                <UnstyledButton
                    onClick={onToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        color: isOpen ? '#705838' : '#6b7280',
                        backgroundColor: isOpen ? '#faf6f1' : 'transparent',
                        transition: 'all 0.15s ease',
                    }}
                >
                    <item.icon size={20} stroke={1.8} />
                    <Text size="sm" fw={isOpen ? 600 : 500} style={{ flex: 1 }}>
                        {item.label}
                    </Text>
                    {isOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </UnstyledButton>
                <Collapse in={isOpen}>
                    <Stack gap={2} pl={40} pr={8} pt={4} pb={8}>
                        {item.children.map((child) => (
                            <NavItem key={child.route} item={child} active={active} expanded={expanded} onToggle={onToggle} collapsed={collapsed} badges={badges} />
                        ))}
                    </Stack>
                </Collapse>
            </Box>
        );
    }

    return (
        <Link
            href={item.route ? safeRoute(item.route) : '#'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: active ? '#705838' : '#6b7280',
                backgroundColor: active ? '#faf6f1' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                fontWeight: active ? 600 : 500,
            }}
        >
            <item.icon size={20} stroke={1.8} />
            <Text size="sm" fw={active ? 600 : 500} style={{ flex: 1 }}>
                {item.label}
            </Text>
            {badgeCount > 0 && (
                <Badge size="xs" color="red" variant="filled" circle>
                    {badgeCount}
                </Badge>
            )}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const navBadges = usePage().props.navBadges || {};
    const permissions = usePage().props.permissions || [];
    const [opened, { toggle, close }] = useDisclosure();
    const [expanded, setExpanded] = useState({});
    const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    const toggleExpand = (label) => {
        setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const toggleDesktopSidebar = () => {
        setDesktopCollapsed((prev) => {
            localStorage.setItem('sidebar-collapsed', !prev);
            return !prev;
        });
    };

    const isCurrentRoute = (routeName) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: desktopCollapsed ? 72 : 280,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            style={{ minHeight: '100vh' }}
        >
            {/* HEADER */}
            <AppShell.Header
                style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}
            >
                <Group>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <UnstyledButton
                        onClick={toggleDesktopSidebar}
                        visibleFrom="sm"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 8,
                            color: '#6b7280', transition: 'all 0.15s ease',
                        }}
                    >
                        {desktopCollapsed ? <IconChevronRight size={18} stroke={2} /> : <IconChevronLeft size={18} stroke={2} />}
                    </UnstyledButton>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Box
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                backgroundColor: '#705838',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: '12px', flexShrink: 0,
                            }}
                        >
                            CIP
                        </Box>
                        <Box>
                            <Text size="sm" fw={700} style={{ color: '#705838', lineHeight: 1.2 }}>
                                Composite
                            </Text>
                            <Text size="xs" style={{ color: '#6b6b6b', lineHeight: 1.2 }}>
                                Interior Prima
                            </Text>
                        </Box>
                    </Box>
                </Group>

                <Group gap="md">
                    <Indicator label={navBadges['operational.approval'] || 0} color="red" size={18} withBorder disabled={!navBadges['operational.approval']}>
                        <UnstyledButton
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                color: '#6b7280',
                            }}
                        >
                            <IconBell size={20} stroke={1.8} />
                        </UnstyledButton>
                    </Indicator>

                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <UnstyledButton
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                }}
                            >
                                <Avatar
                                    size={32}
                                    radius="xl"
                                    src={user.avatar ? `/storage/${user.avatar}` : null}
                                    color="brand"
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Text size="sm" fw={500} visibleFrom="sm">
                                    {user.name}
                                </Text>
                                <IconChevronDown size={14} style={{ color: '#6b7280' }} />
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconUser size={16} />}
                                component={Link}
                                href={safeRoute('profile.edit')}
                            >
                                Profile
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconSettings size={16} />}
                            >
                                Settings
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<IconLogout size={16} />}
                                color="red"
                                component={Link}
                                href={safeRoute('logout')}
                                method="post"
                            >
                                Logout
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </AppShell.Header>

            {/* NAVBAR / SIDEBAR */}
            <AppShell.Navbar
                p={desktopCollapsed ? 'xs' : 'md'}
                style={{
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e5e7eb',
                    transition: 'width 0.2s ease, padding 0.2s ease',
                    overflow: 'hidden',
                }}
            >
                <ScrollArea style={{ height: '100%' }}>
                    {/* PROFILE SECTION */}
                    <Box
                        mb="md"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: desktopCollapsed ? 'center' : 'flex-start',
                            padding: desktopCollapsed ? '8px 0' : '8px 12px',
                        }}
                    >
                        {desktopCollapsed ? (
                            <Tooltip label={user.name} position="right" withArrow>
                                <Avatar
                                    size={40} radius="xl"
                                    src={user.avatar ? `/storage/${user.avatar}` : null}
                                    color="brand"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </Tooltip>
                        ) : (
                            <Group gap="12px" wrap="nowrap">
                                <Avatar
                                    size={48} radius="xl"
                                    src={user.avatar ? `/storage/${user.avatar}` : null}
                                    color="brand"
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box style={{ overflow: 'hidden' }}>
                                    <Text size="sm" fw={600} style={{ color: '#1b1c1b', lineHeight: 1.2 }} truncate="end">
                                        {user.name}
                                    </Text>
                                    <Text size="xs" style={{ color: '#6b6b6b' }} truncate="end">
                                        {user.email}
                                    </Text>
                                </Box>
                            </Group>
                        )}
                    </Box>

                    {/* NAVIGATION MENU */}
                    <Stack gap={4}>
                        {navigation
                            .filter((item) => {
                                if (!item.permissions || item.permissions.length === 0) return true;
                                return item.permissions.some((p) => permissions.includes(p));
                            })
                            .map((item) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const isActive = hasChildren
                                    ? item.children.some((c) => isCurrentRoute(c.route))
                                    : isCurrentRoute(item.route);

                                const visibleChildren = hasChildren
                                    ? item.children.filter((c) => {
                                        if (!c.permissions || c.permissions.length === 0) return true;
                                        return c.permissions.some((p) => permissions.includes(p));
                                    })
                                    : [];

                                if (hasChildren && visibleChildren.length === 0) return null;

                                const filteredItem = hasChildren ? { ...item, children: visibleChildren } : item;

                                return (
                                    <NavItem
                                        key={filteredItem.label}
                                        item={filteredItem}
                                        active={isActive}
                                        expanded={expanded}
                                        onToggle={() => toggleExpand(filteredItem.label)}
                                        collapsed={desktopCollapsed}
                                        badges={navBadges}
                                    />
                                );
                            })}
                    </Stack>
                </ScrollArea>
            </AppShell.Navbar>

            {/* MAIN CONTENT */}
            <AppShell.Main>
                {header && (
                    <Box
                        style={{
                            backgroundColor: '#ffffff',
                            borderBottom: '1px solid #e5e7eb',
                            marginBottom: '24px',
                        }}
                    >
                        <Box style={{ padding: '16px 0' }}>
                            {header}
                        </Box>
                    </Box>
                )}
                {children}
                <Box
                    style={{
                        borderTop: '1px solid #e5e7eb',
                        padding: '16px',
                        textAlign: 'center',
                        marginTop: '32px',
                    }}
                >
                    <Text size="xs" c="dimmed">
                        © 2026 PT Composite Interior Prima. All rights reserved.
                    </Text>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
