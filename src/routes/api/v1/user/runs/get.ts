import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import * as httpStatus from 'http-status';
import { DbClient } from '~/lib/services/db-client';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { ApiResponder } from '~/lib/services/api-responder';
import { ObjectId } from 'mongodb';

const get = (async (fastify): Promise<void> => {
	const schema = {
		response: {
			200: ApiResponseSchema.instance.ofData(Type.Any()),
			400: ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.get('/', { schema }, async function (request, reply) {
		if (!request.session) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'UNAUTHORIZED_ERROR',
						message: 'Not authorized',
					})
				);
			return;
		}

		const user = await DbClient.instance.collections.users.findOne(
			{ _id: new ObjectId(request.session.user._id) },
			{ projection: { _id: 0, runs: 1 } }
		);
		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(ApiResponder.instance.data(user?.runs || []));
	});
}) satisfies FastifyPluginAsyncTypebox;

export default get;
