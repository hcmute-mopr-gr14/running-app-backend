import { Db, MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import type User from '~/lib/models/user';

dotenv.config();

class MongoDbClient {
	private _db: Db | undefined;
	private _client: MongoClient | undefined;
	private _collections: MongoDbCollections | undefined;

	private open() {
		if (this._db) {
			return this._db;
		}
		this._client = new MongoClient(process.env.MONGO_URI);
		this._db = this._client.db('running-app');
		this._collections = new MongoDbCollections(this._db);
		return this._db;
	}

	public get collections() {
		if (!this._collections) {
			this.open();
		}
		return this._collections!;
	}

	public async close(force: boolean = true) {
		await this._client?.close(force);
		this._client = undefined;
		this._db = undefined;
		this._collections = undefined;
	}
}

class MongoDbCollections {
	constructor(private db: Db) {}

	public get users() {
		return this.db.collection<User>('users');
	}
}

export default new MongoDbClient();
