export type SongLanguage = 'PL' | 'EN';

export interface SongHeader {
  id: number;
  language: SongLanguage;
  version: number;
  title: string;
  source: string;
  page: number;
  externalIndex: string;
  isPublic: boolean;
}

export interface SongItem {
  id: number;
  language: SongLanguage;
  lineNumber: number;
  type: 'TEXT' | 'CHORD' | 'SECTION';
  text: string;
  alignment: 'LEFT' | 'CENTER' | 'RIGHT';
  isBold: boolean;
  isItalics: boolean;
}

export interface Song extends SongHeader {
  items: SongItem[];
  lastUpdatedAt?: string;
}

export type SongViewMode = 'basic' | 'chords';
