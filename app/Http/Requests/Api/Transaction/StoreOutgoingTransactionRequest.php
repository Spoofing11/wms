<?php

namespace App\Http\Requests\Api\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreOutgoingTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'transaction_date' => ['required', 'date'],
            'quantity' => ['required', 'integer', 'min:1'],
            'usage_type' => ['required', 'string', 'in:Habis Pakai,Rusak,Dijual,Pindah,Pinjam,Hilang'],
            'condition' => ['required', 'string', 'in:good,bad'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'taken_by' => ['nullable', 'string', 'max:255'],
            'pickup_time' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Barang wajib dipilih.',
            'product_id.exists' => 'Barang tidak valid.',
            'transaction_date.required' => 'Tanggal keluar wajib diisi.',
            'transaction_date.date' => 'Format tanggal tidak valid.',
            'quantity.required' => 'Jumlah keluar wajib diisi.',
            'quantity.integer' => 'Jumlah keluar harus berupa angka.',
            'quantity.min' => 'Jumlah keluar minimal 1.',
            'usage_type.required' => 'Jenis pengeluaran wajib dipilih.',
            'usage_type.in' => 'Jenis pengeluaran tidak valid.',
            'condition.required' => 'Kondisi barang wajib dipilih.',
            'condition.in' => 'Kondisi barang tidak valid.',
            'project_id.exists' => 'Proyek tidak valid.',
        ];
    }
}
