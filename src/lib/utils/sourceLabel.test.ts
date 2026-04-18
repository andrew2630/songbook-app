import { describe, expect, it } from 'vitest';
import { getSourceTranslationKey } from '$lib/utils/sourceLabel';

describe('sourceLabel', () => {
	it('maps known sources regardless of case and diacritics', () => {
		expect(getSourceTranslationKey('Śpiewnik Pielgrzyma')).toBe('app.source.pielgrzym');
		expect(getSourceTranslationKey('SPIEWNIK ZBOROWY')).toBe('app.source.zborowy');
	});

	it('returns null for unknown sources', () => {
		expect(getSourceTranslationKey('Hymns of Grace')).toBeNull();
	});
});
