import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import { Filter, ObjectId } from 'mongodb';
import User from '~/lib/models/user';
import { ApiResponder } from '~/lib/services/api-responder';
import { ApiResponseSchema } from '~/lib/services/api-response-schema';
import { DbClient } from '~/lib/services/db-client';
import httpStatus = require('http-status');

const post = (async (fastify): Promise<void> => {
	const schema = {
		body: Type.Object({
			_id: Type.Optional(Type.String()),
			email: Type.Optional(Type.String()),
		}),
		response: {
			'2xx': ApiResponseSchema.instance.ofData(Type.Any()),
			'4xx': ApiResponseSchema.instance.ofError(),
		},
	} satisfies FastifySchema;

	fastify.post('/', { schema }, async function ({ session, body }, reply) {
		if (!session) {
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

		if (!body._id && !body.email) {
			reply
				.code(httpStatus.BAD_REQUEST)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'MISSING_DATA_ERROR',
						message: 'Specify at least user _id or email',
					})
				);
			return;
		}

		const userId = new ObjectId(session.user._id);
		const filter: Filter<User> = body._id
			? { _id: new ObjectId(body._id) }
			: body.email
			? { email: body.email }
			: ({} as never);
		const friend = await DbClient.instance.collections.users.findOne(
			filter
		);

		if (!friend) {
			reply
				.code(httpStatus.NOT_FOUND)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'NOT_FOUND_ERROR',
						message: 'User not found',
					})
				);
			return;
		}

		if (friend._id.equals(session.user._id)) {
			reply
				.code(httpStatus.NOT_FOUND)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'SELF_REQUEST_ERROR',
						message: 'Cannot send request to self',
					})
				);
			return;
		}

		const count = await DbClient.instance.collections.users.countDocuments({
			$and: [
				{
					_id: friend._id,
				},
				{
					$or: [
						{ friends: userId },
						{ incomingFriendRequests: userId },
						{ outcomingFriendRequests: userId },
					],
				},
			],
		});

		if (count) {
			reply
				.code(httpStatus.CONFLICT)
				.type('application/json')
				.send(
					ApiResponder.instance.error({
						code: 'ALREADY_FRIEND_OR_REQUEST_ERROR',
						message:
							'This user is already a friend or you have already sent a request',
					})
				);
			return;
		}

		await Promise.all([
			DbClient.instance.collections.users.updateOne(
				{
					_id: userId,
				},
				{ $push: { outgoingFriendRequests: friend._id } }
			),
			DbClient.instance.collections.users.updateOne(
				{
					_id: friend._id,
				},
				{ $push: { incomingFriendRequests: userId } }
			),
		]);

		reply
			.code(httpStatus.OK)
			.type('application/json')
			.send(ApiResponder.instance.data({}));
	});
}) satisfies FastifyPluginAsyncTypebox;

export default post;
