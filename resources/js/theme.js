import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'brand',
    primaryShade: 7,
    colors: {
        brand: [
            '#faf6f1',
            '#f2ebe0',
            '#e6d8c5',
            '#d4bf9f',
            '#c4a87e',
            '#b09065',
            '#96774d',
            '#705838',
            '#5c4830',
            '#4a3a27',
        ],
        error: [
            '#fef2f2',
            '#fde8e8',
            '#fbd5d5',
            '#f8b4b4',
            '#f59e9e',
            '#e65454',
            '#c43838',
            '#ba1a1a',
            '#991b1b',
            '#7f1d1d',
        ],
    },
    fontFamily: "'Work Sans', sans-serif",
    fontFamilyMonospace: "'JetBrains Mono', monospace",
    headings: {
        fontFamily: "'Manrope', sans-serif",
        fontWeight: '700',
    },
    defaultRadius: 'sm',
    components: {
        Button: {
            defaultProps: {
                radius: 'sm',
            },
        },
        TextInput: {
            defaultProps: {
                radius: 'sm',
            },
        },
        Select: {
            defaultProps: {
                radius: 'sm',
            },
        },
        Paper: {
            defaultProps: {
                radius: 'sm',
                shadow: 'xs',
            },
        },
        AppShell: {
            defaultProps: {
                navbar: {
                    width: 280,
                    breakpoint: 'sm',
                },
            },
        },
    },
});
