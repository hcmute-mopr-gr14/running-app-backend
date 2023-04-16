import {
	ApiDataResponse,
	ApiErrorResponse,
	ApiResponse,
} from '../models/api-response';

class ApiResponder {
	private makeBaseResponse(): ApiResponse {
		return {
			apiVersion: '1.0',
		};
	}
	public data<T>(data: T): ApiDataResponse<T> {
		return Object.assign(this.makeBaseResponse(), { data });
	}
	public error(error: ApiErrorResponse['error']): ApiErrorResponse {
		return Object.assign(this.makeBaseResponse(), { error });
	}
}

export default new ApiResponder();
