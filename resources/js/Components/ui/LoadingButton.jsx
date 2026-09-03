import { Button, Loader } from '@mantine/core';

export default function LoadingButton({
    children,
    loading = false,
    disabled = false,
    variant = 'filled',
    color = 'brand',
    ...props
}) {
    return (
        <Button
            variant={variant}
            color={color}
            loading={loading}
            disabled={disabled || loading}
            loaderProps={{ size: 'sm' }}
            {...props}
        >
            {children}
        </Button>
    );
}
