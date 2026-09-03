<?php

namespace App\Http\Requests\Api\Master;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'purchase_source_id' => ['nullable', 'exists:purchase_sources,id'],
            'location_id' => ['nullable', 'exists:locations,id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak valid.',
            'name.required' => 'Nama barang wajib diisi.',
            'min_stock.required' => 'Stok minimum wajib diisi.',
            'min_stock.integer' => 'Stok minimum harus berupa angka.',
            'min_stock.min' => 'Stok minimum minimal 0.',
            'purchase_source_id.exists' => 'Sumber pembelian tidak valid.',
            'location_id.exists' => 'Lokasi tidak valid.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Format gambar harus jpg, jpeg, png, atau webp.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
