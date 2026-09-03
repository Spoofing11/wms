<?php

namespace App\Http\Resources\Api\Transaction;

use Illuminate\Http\Resources\Json\JsonResource;

class IncomingTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'transaction_date' => $this->transaction_date?->toDateString(),
            'quantity' => $this->quantity,
            'purchase_price' => $this->purchase_price,
            'notes' => $this->notes,
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
            'purchase_source' => $this->whenLoaded('purchaseSource', fn () => [
                'id' => $this->purchaseSource->id,
                'name' => $this->purchaseSource->name,
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
