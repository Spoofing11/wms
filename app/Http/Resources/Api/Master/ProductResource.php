<?php

namespace App\Http\Resources\Api\Master;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sequence_number' => $this->sequence_number,
            'category_id' => $this->category_id,
            'purchase_source_id' => $this->purchase_source_id,
            'location_id' => $this->location_id,
            'sku' => $this->sku,
            'name' => $this->name,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'image' => $this->image,
            'image_url' => $this->image ? asset("storage/{$this->image}") : null,
            'price' => $this->price,
            'average_cost' => $this->average_cost,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'purchase_source' => new PurchaseSourceResource($this->whenLoaded('purchaseSource')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
