<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import { createTabs, melt } from '@melt-ui/svelte';
  import { getSongByKey } from '$lib/stores/songStore';
  import { favourites, toggleFavourite, language, viewMode } from '$lib/stores/preferences';
  import type { Song, SongLanguage } from '$lib/types/song';

  const viewTabs = createTabs({ defaultValue: get(viewMode) });
  const { elements: viewTabElements, states: viewTabStates } = viewTabs;
  const viewTabsRoot = viewTabElements.root;
  const viewTabsList = viewTabElements.list;
  const viewTabsTrigger = viewTabElements.trigger;
  const viewTabValue = viewTabStates.value;

  $: viewTabStates.value.set($viewMode);
  $: if ($viewTabValue && $viewTabValue !== $viewMode) {
    viewMode.set($viewTabValue as 'basic' | 'chords');
  }

  let song: Song | null = null;
  let loading = true;

  onMount(async () => {
    const $page = get(page);
    const langParam = $page.url.searchParams.get('lang')?.toUpperCase() as SongLanguage | undefined;
    const activeLang = langParam ?? get(language);
    if (langParam) {
      language.set(langParam);
    }
    song = await getSongByKey(`${$page.params.id}-${activeLang}`);
    loading = false;
  });

  $: favouriteKey = song ? `${song.id}-${song.language}` : '';
</script>

<svelte:head>
  <title>{song ? `${song.title} · ${$t('app.title')}` : $t('app.title')}</title>
</svelte:head>

{#if loading}
  <div class="py-20 text-center text-sm text-[rgb(var(--text-secondary))]">{$t('app.syncing')}</div>
{:else if song}
  <article class="glass-panel mx-auto flex max-w-3xl flex-col gap-8 p-8">
    <header class="space-y-3 text-center">
      <button class="text-sm text-[rgb(var(--accent))]" on:click={() => goto('/')}>← {$t('app.all_songs')}</button>
      <h1 class="text-3xl font-semibold text-[rgb(var(--text-primary))]">{song.title}</h1>
      <div class="flex flex-wrap items-center justify-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
        <span class="chip">{$t('app.page_label')} {song.page}</span>
        <span class="chip">{$t('app.source_label')} {song.source}</span>
        <span class="chip">{$t('app.external_index')} {song.externalIndex}</span>
      </div>
      <div class="flex justify-center gap-2" use:melt={$viewTabsRoot}>
        <div class="surface-pill flex gap-2 rounded-full p-1" use:melt={$viewTabsList}>
          <button
            class={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              $viewTabValue === 'basic'
                ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow'
                : 'text-[rgb(var(--text-secondary))]'
            }`}
            use:melt={$viewTabsTrigger({ value: 'basic' })}
          >
            {$t('app.view.basic')}
          </button>
          <button
            class={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              $viewTabValue === 'chords'
                ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow'
                : 'text-[rgb(var(--text-secondary))]'
            }`}
            use:melt={$viewTabsTrigger({ value: 'chords' })}
          >
            {$t('app.view.chords')}
          </button>
        </div>
      </div>
      <button
        class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          $favourites.includes(favouriteKey)
            ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]'
            : 'surface-pill text-[rgb(var(--text-secondary))]'
        }`}
        on:click={() => toggleFavourite(favouriteKey)}
      >
        {$favourites.includes(favouriteKey) ? $t('app.remove_favourite') : $t('app.add_favourite')}
      </button>
    </header>

    <section class={`space-y-2 text-left text-[rgb(var(--text-primary))] ${$viewTabValue === 'chords' ? 'lg:grid lg:grid-cols-[180px,1fr] lg:gap-4' : ''}`}>
      {#each song.items as item}
        {#if item.text.trim().length}
          <p
            class={`text-base leading-relaxed ${
              item.alignment === 'CENTER'
                ? 'text-center'
                : item.alignment === 'RIGHT'
                ? 'text-right'
                : 'text-left'
            } ${item.isBold ? 'font-semibold' : ''} ${item.isItalics ? 'italic' : ''}`}
          >
            {#if $viewTabValue === 'chords'}
              <span class="text-xs uppercase tracking-wide text-[rgb(var(--text-secondary))]">TAB</span>
              <span class="ml-3 block text-base font-medium">{item.text}</span>
            {:else}
              {item.text}
            {/if}
          </p>
        {/if}
      {/each}
    </section>
  </article>
{:else}
  <div class="py-20 text-center text-sm text-[rgb(var(--text-secondary))]">Song not found.</div>
{/if}
