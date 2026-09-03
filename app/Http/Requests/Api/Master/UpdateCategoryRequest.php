<?php

namespace App\Http\Requests\Api\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:10', Rule::unique('categories', 'code')->ignore($categoryId)->withoutTrashed()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'code.required' => 'Kode kategori wajib diisi.',
            'code.unique' => 'Kode kategori sudah digunakan.',
        ];
    }
}
