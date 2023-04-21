import {
	FastifyPluginAsyncTypebox,
	Type,
} from '@fastify/type-provider-typebox';
import { FastifySchema } from 'fastify';
import httpStatus = require('http-status');
import apiResponder from '~/lib/services/api-responder';
import apiResponseSchema from '~/lib/services/api-response-schema';
import { DbClient } from '~/lib/services/db-client';
import * as bcrypt from 'bcrypt';

const post = (async (fastify): Promise<void> => {
	const schema = {
		body: Type.Object({
			email: Type.String(),
			password: Type.String(),
		}),
		response: {
			200: apiResponseSchema.ofData(Type.Object({})),
			400: apiResponseSchema.ofError(),
		},
	} satisfies FastifySchema;

	fastify.post('/', { schema }, async function (request, reply) {
		const user = await DbClient.instance.collections.users.findOne(
			{ email: request.body.email },
			{ limit: 1, projection: { password: 1 } }
		);

		if (!user) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					apiResponder.error({
						code: httpStatus.UNAUTHORIZED,
						message: 'User not found',
					})
				);
			return;
		}

		if (!bcrypt.compare(request.body.password, user.password)) {
			reply
				.code(httpStatus.UNAUTHORIZED)
				.type('application/json')
				.send(
					apiResponder.error({
						code: httpStatus.UNAUTHORIZED,
						message: 'Wrong password',
					})
				);
			return;
		}

		reply
			.code(httpStatus.OK)
			.type('application/json')
			.setSession(
				{ user: { _id: user._id.toHexString() } },
				{ expiresIn: '1d' }
			)
			.send(apiResponder.data({}));
	});
}) satisfies FastifyPluginAsyncTypebox;

export default post;
