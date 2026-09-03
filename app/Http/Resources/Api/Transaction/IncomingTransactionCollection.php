<?php

namespace App\Http\Resources\Api\Transaction;

use Illuminate\Http\Resources\Json\ResourceCollection;

class IncomingTransactionCollection extends ResourceCollection
{
    public $collects = IncomingTransactionResource::class;

    public function toArray($request): array
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'current_page' => $this->resource->currentPage(),
                'last_page' => $this->resource->lastPage(),
                'per_page' => $this->resource->perPage(),
                'total' => $this->resource->total(),
            ],
        ];
    }
}
