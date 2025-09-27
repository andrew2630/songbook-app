<script lang="ts">
  import { songs } from '$lib/stores/songStore';
  import { t } from 'svelte-i18n';
</script>

<section class="glass-panel mx-auto mt-10 max-w-3xl space-y-4 p-8 text-center">
  <h1 class="text-2xl font-semibold heading-gradient">{$t('app.offline_ready')}</h1>
  <p class="text-sm text-[rgb(var(--text-secondary))]">
    {$t('app.tagline')}
  </p>
  <p class="text-xs text-[rgb(var(--text-secondary))]">{$songs.length} {$t('app.all_songs').toLowerCase()}</p>
</section>
