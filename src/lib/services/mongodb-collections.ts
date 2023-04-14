import { Db, MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import type User from '~/lib/models/user';

dotenv.config();

class MongoDbCollections {
	private db: Db | undefined;

	private open() {
		if (this.db) {
			return this.db;
		}
		return (this.db = new MongoClient(process.env.MONGO_URI).db(
			'running-app'
		));
	}

	public get users() {
		return this.open().collection<User>('users');
	}
}

export default new MongoDbCollections();
