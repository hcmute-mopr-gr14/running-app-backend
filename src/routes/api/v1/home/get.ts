import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import { DbClient } from '~/lib/services/db-client';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { ApiResponder } from '~/lib/services/api-responder';
//import mongodbCollections from '~/lib/services/mongodb-collections';

const getUser = (async (fastify): Promise<void> => {
	const schema = {
		querystring: Type.Object({
            email: Type.String(),
		}),
		response: {
			200: ApiResponseSchema.instance.ofData(Type.Object({
				nickname: Type.String(),
				level: Type.Integer(),
				stepData: Type.Array(Type.Object({
					date: Type.String(),
					stepCount: Type.Integer(),
				})),
			})),
			400: ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.get('/', { schema }, async function (request, reply) {
        const user = await DbClient.instance.collections.users.findOne(
            { email: request.query.email },
            { projection: { nickname: 1, level: 1, stepData: 1 } }
        );

		if (!user) {
			reply
				.code(httpStatus.NOT_FOUND)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'httpStatus.NOT_FOUND',
						message: 'User not found',
					})
				);
			return;
		}

		// if (typeof user.nickname !== 'string' || typeof user.level !== 'number' || !Array.isArray(user.stepData)) {
		// 	reply
		// 		.code(httpStatus.INTERNAL_SERVER_ERROR)
		// 		.type('application/json')
		// 		.send(
		// 			apiResponder.error({
		// 				code: httpStatus.INTERNAL_SERVER_ERROR,
		// 				message: 'Invalid user data',
		// 			})
		// 		);
		// 	return;
		// }

		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(ApiResponder.instance.data({
				nickname: user.nickname,
				level: user.level,
				stepData: user.stepData,
			}));
	});
}) satisfies FastifyPluginAsyncTypebox;

export default getUser;