import { TweetRow } from "@/lib/types";

export class Tweet implements TweetRow {
	public content: string;
	public created_at: string;
	public id: string;
	public reply_to_id: string | null;
	public user_id: string | null;
	public username: string;

	constructor(data: TweetRow) {
		this.content = data.content;
		this.created_at = data.created_at;
		this.id = data.id;
		this.reply_to_id = data.reply_to_id;
		this.user_id = data.user_id;
		this.username = data.username;
	}
}
