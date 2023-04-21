import { TSchema, Type } from '@fastify/type-provider-typebox';

export class ApiResponseSchema {
	private static _instance: ApiResponseSchema;

	private constructor() {}

	public static get instance() {
		if (!this._instance) {
			this._instance = new ApiResponseSchema();
		}
		return this._instance;
	}

	private makeBaseSchema() {
		return Type.Object({ apiVersion: Type.String() });
	}

	public ofData<T extends TSchema>(data: T) {
		return Type.Intersect([this.makeBaseSchema(), Type.Object({ data })]);
	}

	public ofError() {
		return Type.Intersect([
			this.makeBaseSchema(),
			Type.Object({
				error: Type.Object({
					code: Type.String(),
					message: Type.String(),
				}),
			}),
		]);
	}
}
