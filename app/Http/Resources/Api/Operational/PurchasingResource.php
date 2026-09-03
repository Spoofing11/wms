<?php

namespace App\Http\Resources\Api\Operational;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchasingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_name' => $this->item_name,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'project_name' => $this->project_name,
            'urgency' => $this->urgency,
            'notes' => $this->notes,
            'requester_name' => $this->requester_name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'sku' => $this->product->sku,
                'name' => $this->product->name,
                'stock' => $this->product->stock,
            ]),
            'requester' => $this->whenLoaded('requester', fn () => [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
            ]),
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
            ]),
            'materialRequestItem' => $this->whenLoaded('materialRequestItem', fn () => [
                'id' => $this->materialRequestItem->id,
                'new_item_name' => $this->materialRequestItem->new_item_name,
                'quantity_requested' => $this->materialRequestItem->quantity_requested,
                'status' => $this->materialRequestItem->status,
                'materialRequest' => $this->materialRequestItem->relationLoaded('materialRequest') && $this->materialRequestItem->materialRequest ? [
                    'id' => $this->materialRequestItem->materialRequest->id,
                    'request_date' => $this->materialRequestItem->materialRequest->request_date?->toDateString(),
                    'division' => $this->materialRequestItem->materialRequest->division,
                    'requester_name' => $this->materialRequestItem->materialRequest->requester_name,
                    'urgency' => $this->materialRequestItem->materialRequest->urgency,
                    'project' => $this->materialRequestItem->materialRequest->relationLoaded('project') && $this->materialRequestItem->materialRequest->project ? [
                        'id' => $this->materialRequestItem->materialRequest->project->id,
                        'name' => $this->materialRequestItem->materialRequest->project->name,
                    ] : null,
                ] : null,
            ]),
        ];
    }
}
