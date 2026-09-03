import { useCallback } from 'react';

export default function useApi() {
    const request = useCallback(async (url, options = {}) => {
        const defaults = {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        };

        const config = { ...defaults, ...options };

        if (options.body && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
            config.body = options.body;
        }

        const response = await fetch(url, config);

        if (response.status === 204) {
            return { success: true };
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Server mengembalikan respons tidak valid.');
        }

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Terjadi kesalahan.');
            error.status = response.status;
            error.errors = data.errors || {};
            throw error;
        }

        return data;
    }, []);

    const get = useCallback((url, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const fullUrl = query ? `${url}?${query}` : url;
        return request(fullUrl);
    }, [request]);

    const post = useCallback((url, body) => {
        return request(url, { method: 'POST', body });
    }, [request]);

    const put = useCallback((url, body) => {
        if (body instanceof FormData) {
            body.append('_method', 'PUT');
            return request(url, { method: 'POST', body });
        }
        return request(url, { method: 'PUT', body });
    }, [request]);

    const del = useCallback((url) => {
        return request(url, { method: 'DELETE' });
    }, [request]);

    const upload = useCallback((url, formData, method = 'POST') => {
        if (method === 'PUT' || method === 'PATCH') {
            formData.append('_method', method);
        }
        return request(url, {
            method: method === 'PUT' || method === 'PATCH' ? 'POST' : method,
            body: formData,
        });
    }, [request]);

    return { request, get, post, put, del, upload };
}
