import { TSchema, Type } from '@fastify/type-provider-typebox';

class ApiResponseSchema {
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

export default new ApiResponseSchema();
