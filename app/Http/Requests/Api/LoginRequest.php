<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'login.required' => 'Username atau email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ];
    }

    public function authenticate(): User
    {
        $login = $this->string('login');

        $user = User::query()
            ->where('email', $login)
            ->orWhere('username', $login)
            ->orWhere('name', $login)
            ->first();

        if (!$user || !Hash::check($this->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Username atau password salah.'],
            ]);
        }

        return $user;
    }
}
