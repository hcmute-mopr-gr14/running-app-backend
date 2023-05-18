import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import { DbClient } from '~/lib/services/db-client';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { ApiResponder } from '~/lib/services/api-responder';
import { ObjectId } from 'mongodb';
import { withImageUrl } from '~/lib/utils';

const get = (async (fastify): Promise<void> => {
	const schema = {
		params: {
			userId: Type.String(),
		},
		response: {
			'2xx': ApiResponseSchema.instance.ofData(Type.Any()),
			'4xx': ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.get('/', { schema }, async function (request, reply) {
		// Kiểm tra session đăng nhập
		if (!request.session?.user?._id) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'httpStatus.UNAUTHORIZED',
						message: 'Unauthorized access',
					})
				);
			return;
		}

		const user = await DbClient.instance.collections.users.findOne(
			{ _id: new ObjectId((request.params as any).userId) },
			{
				projection: {
					_id: 1,
					email: 1,
					nickname: 1,
					image: 1,
				},
			}
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

		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(
				ApiResponder.instance.data(
					withImageUrl(user, {
						width: 200,
						height: 200,
						crop: 'fill',
					})
				)
			);
	});
}) satisfies FastifyPluginAsyncTypebox;

export default get;