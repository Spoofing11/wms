<?php

namespace App\Http\Resources\Api\Transaction;

use Illuminate\Http\Resources\Json\JsonResource;

class StockAdjustmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'old_stock' => $this->old_stock,
            'new_stock' => $this->new_stock,
            'reason' => $this->reason,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'sku' => $this->product->sku,
                'name' => $this->product->name,
                'stock' => $this->product->stock,
                'category' => $this->product->relationLoaded('category') && $this->product->category ? [
                    'id' => $this->product->category->id,
                    'code' => $this->product->category->code,
                    'name' => $this->product->category->name,
                ] : null,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
