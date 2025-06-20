import { supabase } from './client';

export async function fetchUpdatedSongs(since: string | null) {
	let query = supabase.from('songs').select('*');
	if (since) {
		query = query.gt('updated_at', since);
	}
	return query;
}
