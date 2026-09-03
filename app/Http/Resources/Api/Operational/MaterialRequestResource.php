<?php

namespace App\Http\Resources\Api\Operational;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'request_date' => $this->request_date?->toIso8601String(),
            'division' => $this->division,
            'division_other' => $this->division_other,
            'requester_name' => $this->requester_name,
            'usage_type' => $this->usage_type,
            'urgency' => $this->urgency,
            'status' => $this->status,
            'request_datetime' => $this->request_datetime?->toIso8601String(),
            'pickup_time' => $this->pickup_time,
            'photo' => $this->photo,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
            ]),
            'requester' => $this->whenLoaded('requester', fn () => [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
            ]),
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'items' => MaterialRequestItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
