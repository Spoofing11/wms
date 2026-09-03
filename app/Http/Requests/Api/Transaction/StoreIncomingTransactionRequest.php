<?php

namespace App\Http\Requests\Api\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncomingTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'purchase_source_id' => ['nullable', 'exists:purchase_sources,id'],
            'transaction_date' => ['required', 'date'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'purchase_request_id' => ['nullable', 'exists:purchase_requests,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Barang wajib dipilih.',
            'product_id.exists' => 'Barang tidak valid.',
            'transaction_date.required' => 'Tanggal masuk wajib diisi.',
            'transaction_date.date' => 'Format tanggal tidak valid.',
            'quantity.required' => 'Jumlah masuk wajib diisi.',
            'quantity.integer' => 'Jumlah masuk harus berupa angka.',
            'quantity.min' => 'Jumlah masuk minimal 1.',
            'purchase_price.numeric' => 'Harga pembelian harus berupa angka.',
        ];
    }
}
