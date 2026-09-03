<?php

namespace App\Http\Requests\Api\Operational;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'request_date' => 'required|date',
            'project_id' => 'required|exists:projects,id',
            'division' => 'required|string|max:255',
            'division_other' => 'nullable|string|max:255',
            'requester_name' => 'nullable|string|max:255',
            'usage_type' => 'required|in:consumable,borrow',
            'urgency' => 'required|in:normal,urgent',
            'request_datetime' => 'nullable|date',
            'pickup_time' => 'nullable|string|max:255',
            'photo' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.new_item_name' => 'nullable|string|max:255',
            'items.*.quantity_requested' => 'required|integer|min:1',
            'items.*.purchase_quantity' => 'nullable|integer|min:0',
            'items.*.usage_type' => 'nullable|in:consumable,borrow',
            'items.*.notes' => 'nullable|string',
            'items.*.ready_photo' => 'nullable|string|max:255',
            'items.*.photo' => 'nullable|file|image|max:2048',
        ];
    }
}
