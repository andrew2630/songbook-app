import { fetchUpdatedSongs } from '$lib/supabase/songs';
import { getLastSync, setLastSync, saveSongs } from '$lib/db/songs';

export async function syncSongs() {
	if (!navigator.onLine) return;

	const lastSync = await getLastSync();
	const { data, error } = await fetchUpdatedSongs(lastSync);
	if (error) {
		console.error('Failed to fetch songs', error);
		return;
	}

	if (data && data.length > 0) {
		await saveSongs(data);
		await setLastSync(new Date().toISOString());
	}
}
