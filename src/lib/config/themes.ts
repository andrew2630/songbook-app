export type ThemeOption = {
        id: string;
        labelKey: string;
        preview: string[];
        scheme: 'light' | 'dark';
        metaColor: string;
        hero: [string, string];
};

export const themeOptions: ThemeOption[] = [
        {
                id: 'songbook-lumen',
                labelKey: 'lumen',
                preview: ['#ffe9d6', '#ffd3eb', '#d6c7ff'],
                scheme: 'light',
                metaColor: '#fde9ff',
                hero: ['#fff6ea', '#f1ecff']
        },
        {
                id: 'songbook-oasis',
                labelKey: 'oasis',
                preview: ['#ddf7ff', '#c7f5de', '#7dd3fc'],
                scheme: 'light',
                metaColor: '#c8f5ff',
                hero: ['#ecfbff', '#e8fff4']
        },
        {
                id: 'songbook-twilight',
                labelKey: 'twilight',
                preview: ['#433d8b', '#7257b5', '#ee8468'],
                scheme: 'dark',
                metaColor: '#1c163f',
                hero: ['#2a1f52', '#412d65']
        },
        {
                id: 'songbook-nocturne',
                labelKey: 'nocturne',
                preview: ['#0f1c2e', '#12354a', '#4bc5c5'],
                scheme: 'dark',
                metaColor: '#0b1626',
                hero: ['#0b1626', '#102b38']
        }
];

export const defaultTheme = themeOptions[0];

export const themeMap = new Map(themeOptions.map((option) => [option.id, option]));
