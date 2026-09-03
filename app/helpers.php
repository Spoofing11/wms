<?php

if (!function_exists('paginateForInertia')) {
    function paginateForInertia($paginator, callable $mapFn): array
    {
        return [
            'data' => $paginator->getCollection()->map($mapFn)->values()->all(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
