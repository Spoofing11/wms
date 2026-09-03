import { useState, useRef } from 'react';
import { Box, Text, Group, Image, UnstyledButton } from '@mantine/core';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons-react';

export default function ImageUpload({ value, onChange, error, accept = 'image/*' }) {
    const [preview, setPreview] = useState(value || null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;

        onChange?.(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleChange(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onChange?.(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    if (preview) {
        return (
            <Box
                style={{
                    position: 'relative',
                    width: 200,
                    height: 200,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                }}
            >
                <Image
                    src={preview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <UnstyledButton
                    onClick={handleRemove}
                    style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                    }}
                >
                    <IconX size={14} />
                </UnstyledButton>
            </Box>
        );
    }

    return (
        <Box
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            style={{
                width: 200,
                height: 200,
                borderRadius: 8,
                border: `2px dashed ${dragActive ? '#705838' : '#d8d2c8'}`,
                backgroundColor: dragActive ? '#faf6f1' : '#faf6f1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
            }}
        >
            <Box
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#f2ebe0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#96774d',
                }}
            >
                <IconUpload size={20} />
            </Box>
            <Text size="xs" c="dimmed" ta="center">
                Seret & lepas atau klik untuk upload
            </Text>
            <Text size="xs" c="dimmed">
                JPG, PNG, WebP (Maks 2MB)
            </Text>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => handleChange(e.target.files?.[0])}
                style={{ display: 'none' }}
            />
        </Box>
    );
}
