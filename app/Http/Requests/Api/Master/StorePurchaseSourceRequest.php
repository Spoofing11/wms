<?php

namespace App\Http\Requests\Api\Master;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_type' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'source_type.required' => 'Tipe sumber wajib diisi.',
            'name.required' => 'Nama toko wajib diisi.',
        ];
    }
}
