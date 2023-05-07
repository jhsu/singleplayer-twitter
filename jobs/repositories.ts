import { TweetRow } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface IWrite<T> {
	update(uuid: string, data: Record<string, unknown>): Promise<boolean>;
	create(data: T): Promise<boolean>;
	delete(uuid: string): Promise<boolean>;
}
interface IRead<T> {
	all(): Promise<T[]>;
	find(uuid: string): Promise<T>;
}
abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {
	public readonly _table: ReturnType<SupabaseClient["from"]>;

	constructor(db: SupabaseClient, tableName: string) {
		this._table = db.from(tableName);
	}
	async update(uuid: string, data: Record<string, unknown>): Promise<boolean> {
		const { error } = await this._table.update(data).eq("id", uuid);
		return !error;
	}
	async create(data: T): Promise<boolean> {
		const { error } = await this._table.insert(data);
		return !error;
	}
	async delete(uuid: string): Promise<boolean> {
		const { error } = await this._table.delete().eq("id", uuid);
		return !error;
	}
	async all(): Promise<T[]> {
		// need to handle error
		const { data, error } = await this._table.select();
		return data;
	}
	async find(uuid: string): Promise<T> {
		const { data, error } = await this._table
			.select()
			.eq("id", uuid)
			.limit(1)
			.single();
		return data;
	}
}

export class TweetsRepository extends BaseRepository<TweetRow> {
	// need to change this to persona_id eventually
	async recentTweet(userName: string): Promise<Pick<TweetRow, "created_at">> {
		const { data, error } = await this._table
			.select("created_at")
			// .eq("personal_id", personaId)
			.eq("username", userName)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();
		return data;
	}

	async recentTweets(userName: string): Promise<TweetRow[]> {
		const { data } = await this._table
			.select(
				"id, username, created_at, content, user_id, reply_to_id, persona_id",
			)
			.eq("username", userName)
			.order("created_at", { ascending: false })
			.limit(5);
		return data;
	}
}
