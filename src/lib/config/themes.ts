export type ThemeOption = {
  id: string;
  labelKey: string;
  preview: string[];
};

export const themeOptions: ThemeOption[] = [
  {
    id: 'songbook-modern',
    labelKey: 'aurora',
    preview: ['#eef2ff', '#c7d2fe', '#6366f1']
  },
  {
    id: 'songbook-forest',
    labelKey: 'forest',
    preview: ['#ecfdf4', '#bbf7d0', '#4ade80']
  },
  {
    id: 'songbook-sunrise',
    labelKey: 'sunrise',
    preview: ['#fff4f0', '#fecdd3', '#f43f5e']
  }
];

export const defaultTheme = themeOptions[0];
