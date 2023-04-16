export interface ApiResponse {
	apiVersion: string;
}

export interface ApiDataResponse<T> extends ApiResponse {
	data: T;
}

export interface ApiErrorResponse extends ApiResponse {
	error: {
		code: number;
		message: string;
	};
}
