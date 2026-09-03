import { usePage, router } from '@inertiajs/react';
import { useMemo } from 'react';

export default function useQueryParams(defaults = {}) {
    const { url } = usePage();

    const params = useMemo(() => {
        const urlObj = new URL(url, window.location.origin);
        return { ...defaults, ...Object.fromEntries(urlObj.searchParams) };
    }, [url, defaults]);

    const setParams = (newParams) => {
        router.get(route(route().current()), { ...params, ...newParams }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetParams = () => {
        router.get(route(route().current()), defaults, {
            preserveState: true,
            replace: true,
        });
    };

    return { params, setParams, resetParams };
}
