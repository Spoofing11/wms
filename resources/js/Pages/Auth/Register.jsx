import { TextInput, PasswordInput, Button, Text, Anchor, Stack, Divider } from '@mantine/core';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <Stack gap="md">
                <Text fw={700} size="xl" ta="center" style={{ color: '#1b1c1b', fontFamily: 'Manrope, sans-serif' }}>
                    Buat Akun
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                    Daftar untuk mengakses Warehouse Management System
                </Text>

                <Divider />

                <form onSubmit={submit}>
                    <Stack gap="md">
                        <TextInput
                            label="Nama Lengkap"
                            placeholder="Masukkan nama"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                            autoFocus
                        />

                        <TextInput
                            label="Email"
                            placeholder="Masukkan email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />

                        <PasswordInput
                            label="Password"
                            placeholder="Masukkan password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            required
                        />

                        <PasswordInput
                            label="Konfirmasi Password"
                            placeholder="Ulangi password"
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
                            Daftar
                        </Button>

                        <Text size="sm" c="dimmed" ta="center">
                            Sudah punya akun?{' '}
                            <Anchor
                                component={Link}
                                href={route('login')}
                                size="sm"
                                style={{ color: '#705838', textDecoration: 'none' }}
                            >
                                Masuk
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Stack>
        </GuestLayout>
    );
}
