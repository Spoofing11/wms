<?php

namespace App\Http\Requests\Api\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:10', Rule::unique('categories', 'code')->withoutTrashed()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max' => 'Nama kategori maksimal 255 karakter.',
            'code.required' => 'Kode kategori wajib diisi.',
            'code.max' => 'Kode kategori maksimal 10 karakter.',
            'code.unique' => 'Kode kategori sudah digunakan.',
        ];
    }
}
