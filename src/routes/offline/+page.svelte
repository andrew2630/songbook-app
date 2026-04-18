<script lang="ts">
	import { songs } from '$lib/stores/songStore';
	import { t } from 'svelte-i18n';
</script>

<section
	class="mx-auto mt-10 max-w-3xl space-y-4 rounded-[2rem] border border-surface-200/70 bg-surface-100/75 p-8 text-center text-on-surface shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
>
	<h1 class="text-2xl font-semibold sm:text-3xl">{$t('app.offline_ready')}</h1>
	<p class="text-sm leading-relaxed text-on-surface-muted">
		{$t('app.tagline')}
	</p>
	<p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500/90">
		{$songs.length}
		{$t('app.all_songs').toLowerCase()}
	</p>
</section>
