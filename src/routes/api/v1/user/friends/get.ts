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
import User from '~/lib/models/user';
import { withImageUrl } from '~/lib/utils';

const get = (async (fastify): Promise<void> => {
	const schema = {
		response: {
			'2xx': ApiResponseSchema.instance.ofData(Type.Any()),
			'4xx': ApiResponseSchema.instance.ofError(),
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

		const friends = await DbClient.instance.collections.users
			.aggregate<User>([
				{ $match: { _id: new ObjectId(request.session.user._id) } },
				{ $limit: 1 },
				{ $project: { friends: 1, _id: 0 } },
				{ $unwind: '$friends' },
				{
					$lookup: {
						from: 'users',
						localField: 'friends',
						foreignField: '_id',
						as: 'info',
					},
				},
				{ $unwind: '$info' },
				{
					$replaceRoot: {
						newRoot: '$info',
					},
				},
				{
					$project: {
						email: 1,
						nickname: 1,
						image: 1,
					},
				},
			])
			.toArray();
		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(
				ApiResponder.instance.data(
					friends?.map((friend) => withImageUrl(friend)) || []
				)
			);
	});
}) satisfies FastifyPluginAsyncTypebox;

export default get;
