import { usePage } from '@inertiajs/react';

export default function useCan() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const roles = user?.roles || [];

    const can = (role) => {
        if (!role) return true;
        return roles.includes(role);
    };

    const cannot = (role) => !can(role);

    const hasAnyRole = (roleList = []) => {
        return roleList.some((role) => roles.includes(role));
    };

    return { can, cannot, hasAnyRole, roles };
}
