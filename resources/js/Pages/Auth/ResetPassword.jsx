import { TextInput, PasswordInput, Button, Text, Stack, Divider } from '@mantine/core';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <Stack gap="md">
                <Text fw={700} size="xl" ta="center" style={{ color: '#1b1c1b', fontFamily: 'Manrope, sans-serif' }}>
                    Atur Ulang Password
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                    Masukkan password baru Anda di bawah ini.
                </Text>

                <Divider />

                <form onSubmit={submit}>
                    <Stack gap="md">
                        <TextInput
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                            readOnly
                        />

                        <PasswordInput
                            label="Password Baru"
                            placeholder="Masukkan password baru"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                            autoFocus
                        />

                        <PasswordInput
                            label="Konfirmasi Password"
                            placeholder="Ulangi password baru"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            loading={processing}
                            color="brand"
                            size="md"
                            style={{ backgroundColor: '#705838' }}
                        >
                            Reset Password
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </GuestLayout>
    );
}
