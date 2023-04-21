import { type Db, MongoClient, type MongoClientOptions } from 'mongodb';
import type User from '~/lib/models/user';

interface DbClientOptions {
	url: string;
	dbName: string;
	mongoClientOptions?: MongoClientOptions;
}

export class DbClient {
	private static _instance?: DbClient;
	private static _options?: DbClientOptions;

	private _client: MongoClient;
	private _collections: Collections;

	private constructor(options: DbClientOptions) {
		this._client = new MongoClient(options.url, options.mongoClientOptions);
		this._collections = new Collections(this._client.db(options.dbName));
	}

	public static useOptions(options: DbClientOptions) {
		this._options = options;
	}

	public static get instance() {
		if (!this._instance) {
			if (!this._options) {
				throw new Error(
					'DbClient needs an options to construct its instance'
				);
			}
			this._instance = new DbClient(this._options);
		}
		return this._instance;
	}

	public get collections() {
		return this._collections;
	}

	public get client() {
		return this._client;
	}

	public close(force?: boolean) {
		return this._client.close(force);
	}
}

class Collections {
	constructor(private db: Db) {}
	public get users() {
		return this.db.collection<User>('users');
	}
}
