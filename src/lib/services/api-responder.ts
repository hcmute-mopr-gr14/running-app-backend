import {
	ApiDataResponse,
	ApiErrorResponse,
	ApiResponse,
} from '../models/api-response';

interface ApiResponderOptions {
	apiVersion: string;
}

export class ApiResponder {
	private static _instance: ApiResponder;
	private static _options: ApiResponderOptions;

	private _apiVersion: string;

	private constructor(options: ApiResponderOptions) {
		this._apiVersion = options.apiVersion;
	}

	public static useOptions(options: ApiResponderOptions) {
		this._options = options;
	}

	public static get instance() {
		if (!this._instance) {
			if (!this._options) {
				throw new Error(
					'ApiResponder needs an options to construct its instance'
				);
			}
			this._instance = new ApiResponder(this._options);
		}
		return this._instance;
	}

	private makeBaseResponse(): ApiResponse {
		return {
			apiVersion: this._apiVersion,
		};
	}
	public data<T>(data: T): ApiDataResponse<T> {
		return Object.assign(this.makeBaseResponse(), { data });
	}
	public error(error: ApiErrorResponse['error']): ApiErrorResponse {
		return Object.assign(this.makeBaseResponse(), { error });
	}
}
