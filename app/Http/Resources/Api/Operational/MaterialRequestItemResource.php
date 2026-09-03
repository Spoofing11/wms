<?php

namespace App\Http\Resources\Api\Operational;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialRequestItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'specification' => $this->specification,
            'quantity_requested' => $this->quantity_requested,
            'notes' => $this->notes,
            'new_item_name' => $this->new_item_name,
            'purchase_quantity' => $this->purchase_quantity,
            'ready_photo' => $this->ready_photo,
            'photo' => $this->photo,
            'usage_type' => $this->usage_type,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'photo_approved_by' => $this->photo_approved_by,
            'photo_approved_at' => $this->photo_approved_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
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
            'approver' => $this->whenLoaded('approver', fn () => [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ]),
            'photoApprover' => $this->whenLoaded('photoApprover', fn () => [
                'id' => $this->photoApprover->id,
                'name' => $this->photoApprover->name,
            ]),
            'materialRequest' => $this->whenLoaded('materialRequest', fn () => [
                'id' => $this->materialRequest->id,
                'request_date' => $this->materialRequest->request_date?->toDateString(),
                'division' => $this->materialRequest->division,
                'requester_name' => $this->materialRequest->requester_name,
                'urgency' => $this->materialRequest->urgency,
                'usage_type' => $this->materialRequest->usage_type,
                'pickup_time' => $this->materialRequest->pickup_time,
                'project' => $this->materialRequest->relationLoaded('project') && $this->materialRequest->project ? [
                    'id' => $this->materialRequest->project->id,
                    'name' => $this->materialRequest->project->name,
                ] : null,
                'creator' => $this->materialRequest->relationLoaded('creator') && $this->materialRequest->creator ? [
                    'id' => $this->materialRequest->creator->id,
                    'name' => $this->materialRequest->creator->name,
                ] : null,
            ]),
            'purchaseRequest' => $this->whenLoaded('purchaseRequest', fn () => [
                'id' => $this->purchaseRequest->id,
                'status' => $this->purchaseRequest->status,
            ]),
        ];
    }
}
