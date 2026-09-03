<?php

namespace App\Http\Resources\Api\Transaction;

use Illuminate\Http\Resources\Json\JsonResource;

class OutgoingTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'transaction_date' => $this->transaction_date?->toDateString(),
            'quantity' => $this->quantity,
            'condition' => $this->condition,
            'usage_type' => $this->usage_type,
            'project_name' => $this->project_name,
            'taken_by' => $this->taken_by,
            'pickup_time' => $this->pickup_time,
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
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
