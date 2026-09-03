import { TextInput, Button, Text, Alert, Stack, Divider, Anchor } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <Stack gap="md">
                <Text fw={700} size="xl" ta="center" style={{ color: '#1b1c1b', fontFamily: 'Manrope, sans-serif' }}>
                    Lupa Password
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                    Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password.
                </Text>

                <Divider />

                {status && (
                    <Alert color="green" variant="light">
                        {status}
                    </Alert>
                )}

                <form onSubmit={submit}>
                    <Stack gap="md">
                        <TextInput
                            label="Email"
                            placeholder="Masukkan email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                            autoFocus
                            leftSection={<IconMail size={16} />}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            loading={processing}
                            color="brand"
                            size="md"
                            style={{ backgroundColor: '#705838' }}
                        >
                            Kirim Tautan Reset
                        </Button>

                        <Text size="sm" c="dimmed" ta="center">
                            <Anchor
                                component={Link}
                                href={route('login')}
                                size="sm"
                                style={{ color: '#705838', textDecoration: 'none' }}
                            >
                                Kembali ke Login
                            </Anchor>
                        </Text>
                    </Stack>
                </form>
            </Stack>
        </GuestLayout>
    );
}
