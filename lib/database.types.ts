import { TweetRow } from "./types";

export interface Database {
	public: {
		tables: {
			timeline: {
				row: TweetRow;
				insert: {};
				update: {};
			};
		};
	};
}
