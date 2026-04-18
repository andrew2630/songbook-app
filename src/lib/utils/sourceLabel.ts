function normaliseSource(source: string) {
	return source
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

export function getSourceTranslationKey(source: string) {
	const normalised = normaliseSource(source);
	if (normalised.includes('zborowy')) return 'app.source.zborowy';
	if (normalised.includes('pielgrzym')) return 'app.source.pielgrzym';
	return null;
}
