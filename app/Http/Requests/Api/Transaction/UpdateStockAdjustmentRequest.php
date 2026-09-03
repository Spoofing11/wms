<?php

namespace App\Http\Requests\Api\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'new_stock' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Barang wajib dipilih.',
            'product_id.exists' => 'Barang tidak valid.',
            'new_stock.required' => 'Stock baru wajib diisi.',
            'new_stock.integer' => 'Stock baru harus berupa angka.',
            'new_stock.min' => 'Stock baru minimal 0.',
            'reason.required' => 'Alasan wajib diisi.',
            'reason.max' => 'Alasan maksimal 255 karakter.',
        ];
    }
}
