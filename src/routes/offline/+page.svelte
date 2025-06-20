<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { getAllSongs, type Song } from '$lib/db/songs';

	const songs = writable<Song[]>([]);

	onMount(async () => {
		songs.set(await getAllSongs());
	});
</script>

<h1>Offline songs</h1>
<ul>
	{#each $songs as song (song.id)}
		<li>{song.title}</li>
	{/each}
</ul>
